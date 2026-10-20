import {
  connect,
  client,
  parse,
  finalizedOK,
  finalized,
  settledReceipt,
  validAddress,
  validRef,
} from "./sdk.js";
import {
  PROTOCOL,
  DIMS,
  NAMES,
  BASE,
  CASES,
  seal,
  append,
  acknowledge,
  applicability,
  unknownAssessment,
  exportRecord,
  verifyRecord,
  sha256,
  validateText,
} from "./domain.js";
const $ = (id) => document.getElementById(id);
const clone = (v) => structuredClone(v);
let mode = "demo",
  chosen = "copy",
  connection = null,
  state = null,
  busy = false,
  selected = 1,
  proposal = null;
let sourceDigest = null;
const labels = {
  CARRY: "Same terms. One consent epoch.",
  RECONFIRM: "The terms changed. Ask again.",
  REVIEW: "Unclear terms. Fresh confirmation.",
  INITIAL: "The original terms are sealed.",
};
function status(message, kind = "info") {
  $("status").textContent = message;
  $("status").dataset.kind = kind;
}
function text(tag, value, className) {
  const el = document.createElement(tag);
  el.textContent = value;
  if (className) el.className = className;
  return el;
}
function provider() {
  return window.okxwallet ?? window.ethereum;
}
function addr() {
  return validAddress($("contract").value.trim());
}
function ref() {
  return validRef($("ref").value.trim());
}
function persist() {
  if (mode === "demo" && state)
    try {
      localStorage.setItem("ballotseal-local-v3", JSON.stringify(state));
    } catch {
      status(
        "The record is in memory only. Export it before closing this tab.",
      );
    }
}
function renderRecord(version) {
  if (!state) return;
  selected = version;
  const v = state.trail.find((v) => v.version === version);
  $("recordVersion").textContent = "V" + version;
  $("recordDigest").textContent = v.digest;
  $("recordText").textContent = v.text;
  document.querySelectorAll(".historyRow").forEach((row) => {
    row.classList.toggle("selected", Number(row.dataset.version) === version);
    row.setAttribute(
      "aria-pressed",
      String(Number(row.dataset.version) === version),
    );
  });
}
function render() {
  if (!state) return;
  const latest = state.trail.at(-1),
    applies = applicability(state);
  $("proposalTitle").textContent = state.title;
  $("title").value = state.title;
  $("before").value = latest.text;
  $("sealedBadge").textContent = "SEALED / V" + latest.version;
  $("version").textContent =
    "V" + latest.version + " → V" + (latest.version + 1);
  $("epoch").textContent = String(latest.epoch).padStart(2, "0");
  $("result").hidden = false;
  $("result").dataset.action = latest.action;
  $("decisionTitle").textContent = labels[latest.action];
  $("decisionText").textContent =
    latest.action === "INITIAL"
      ? "This exact text starts epoch 1. Acknowledgements bind to a specific sealed version."
      : latest.action === "CARRY"
        ? "All five dimensions are unchanged. Earlier acknowledgements in this epoch remain applicable."
        : "A new epoch begins. Earlier acknowledgements remain in the permanent history and no longer apply to these terms.";
  $("resultSource").textContent =
    mode === "live"
      ? "ONCHAIN READBACK / VERIFY FINALITY SEPARATELY"
      : chosen === "custom"
        ? "LOCAL UNASSESSED / NOT AI"
        : "PRESET OUTCOME / NOT AI";
  $("dimensions").replaceChildren();
  for (const [i, k] of DIMS.entries()) {
    const item = latest.assessment[k];
    const card = text("article", "", "dimension " + (item?.label ?? "INITIAL"));
    card.append(
      text("span", "0" + (i + 1), "dimIndex"),
      text("h4", NAMES[k]),
      text("span", item?.label ?? "SEALED", "verdict"),
      text(
        "p",
        item?.reason ?? "Initial sealed terms. No amendment has been assessed.",
      ),
    );
    for (const quote of [item?.before_quote, item?.after_quote])
      if (quote) card.append(text("blockquote", quote));
    $("dimensions").append(card);
  }
  $("ackStatus").textContent = applies.applicable
    ? "Applicable · acknowledged V" + applies.version
    : applies.version
      ? "Fresh acknowledgement required"
      : "No acknowledgement yet";
  $("ackDetail").textContent = applies.exact
    ? "Your acknowledgement names this exact current version."
    : applies.applicable
      ? "The text was revised without changing its consent epoch."
      : "Confirm the exact current terms after reviewing them.";
  $("ack").disabled = busy || applies.exact;
  $("ack").textContent =
    mode === "live" ? "Acknowledge exact version ↗" : "Acknowledge locally ↗";
  $("history").replaceChildren();
  for (const v of [...state.trail].reverse()) {
    const row = document.createElement("button");
    row.className = "historyRow";
    row.dataset.version = v.version;
    row.setAttribute("aria-label", "Inspect version " + v.version);
    const detail = text(
      "span",
      v.action === "INITIAL" ? "Original terms sealed" : labels[v.action],
    );
    detail.append(
      text(
        "small",
        "EPOCH " + String(v.epoch).padStart(2, "0") + " / " + v.action,
      ),
      text("em", v.digest.slice(0, 16) + "…"),
    );
    row.append(text("b", "V" + v.version), detail);
    row.onclick = () => renderRecord(v.version);
    $("history").append(row);
  }
  $("ackHistory").replaceChildren();
  for (const a of state.acknowledgements) {
    const row = text("div", "", "ackEvent");
    row.append(
      text("span", "Acknowledged V" + a.version),
      text(
        "span",
        "EPOCH " +
          a.epoch +
          (a.epoch === latest.epoch ? " / APPLICABLE" : " / HISTORICAL"),
      ),
    );
    $("ackHistory").append(row);
  }
  if (!state.acknowledgements.length)
    $("ackHistory").append(
      text("p", "No acknowledgement recorded for this viewer.", "empty"),
    );
  renderRecord(latest.version);
  updateCount();
  persist();
}
function updateCount() {
  $("characterCount").textContent =
    Array.from($("after").value).length.toLocaleString() +
    " / 6,000 characters";
}
async function select(name) {
  if (!Object.hasOwn(CASES, name)) name = "copy";
  chosen = name;
  state = acknowledge(await seal("Design Guild / identity grant", BASE));
  $("after").value = CASES[name].text;
  $("diff").hidden = true;
  document.querySelectorAll("[data-case]").forEach((el) => {
    el.classList.toggle("selected", el.dataset.case === name);
    el.setAttribute("aria-pressed", String(el.dataset.case === name));
  });
  render();
  status(
    "Fixture loaded. V1 and its example acknowledgement are simulated locally.",
  );
}
async function configure(next) {
  mode = next;
  proposal = null;
  state = null;
  $("liveSettings").hidden = next !== "live";
  $("localIdLabel").hidden = next !== "live";
  $("scenarios").hidden = next === "live";
  for (const [id, active] of [
    ["demo", next === "demo"],
    ["live", next === "live"],
  ]) {
    $(id).classList.toggle("active", active);
    $(id).setAttribute("aria-pressed", String(active));
  }
  $("modeBadge").textContent =
    next === "demo"
      ? "LOCAL FIXTURE / NO AI / NO TRANSACTION"
      : "STABLE STUDIONET / READ-ONLY CONNECTION";
  $("modeNote").textContent =
    next === "demo"
      ? "Preset outcomes demonstrate the lifecycle. Custom local drafts always require review; they never receive an invented AI verdict."
      : "Read the canonical Studionet deployment and verify its source and text digests. Connecting a wallet is optional until you explicitly send a write.";
  $("actionHint").textContent =
    next === "demo"
      ? "Choose a scenario, then inspect the amendment."
      : "Seal or revise only after verifying the deployment source.";
  if (next === "demo") await select(chosen);
  else {
    $("before").value = "";
    $("after").value = "";
    $("result").hidden = true;
    $("history").replaceChildren(
      text(
        "p",
        "No proposal loaded. Read a deployed proposal to view its history.",
        "empty",
      ),
    );
    $("recordDigest").textContent = "No sealed record loaded.";
    $("recordText").textContent = "";
    $("ackHistory").replaceChildren();
    status(
      "Read-only mode. Enter the contract address and proposal reference.",
    );
  }
}
async function wallet() {
  connection = await connect(provider());
  $("wallet").textContent =
    connection.account.slice(0, 6) + "…" + connection.account.slice(-4);
  return connection;
}
async function ensure() {
  if (!connection) await wallet();
  const p = provider(),
    accounts = await p.request({ method: "eth_accounts" });
  if (Number(await p.request({ method: "eth_chainId" })) !== 61999)
    throw Error("Select chain 61999 before continuing.");
  if (accounts[0]?.toLowerCase() !== connection.account.toLowerCase()) {
    connection = null;
    throw Error("Wallet account changed. Reconnect before continuing.");
  }
  return connection;
}
function pendingKey(account) {
  return (
    "ballotseal-pending:61999:" +
    addr().toLowerCase() +
    ":" +
    account.toLowerCase()
  );
}
function readbackKey(account) {
  return pendingKey(account).replace("ballotseal-pending:", "ballotseal-readback:");
}
function rpcDetail(error) {
  return [
    error.shortMessage ?? error.message,
    error.details ?? error.cause?.message,
  ].filter(Boolean).join(" · ");
}
async function load() {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      return await loadOnce();
    } catch (error) {
      const detail = rpcDetail(error);
      const transient =
        /unknown rpc|internal rpc|network|fetch failed|timeout|timed out|429|502|503|504/i.test(detail);
      if (!transient || attempt === 1) throw Error(detail);
      status("RPC read interrupted. Retrying state refresh once…", "loading");
      await new Promise((resolve) => setTimeout(resolve, 400));
    }
  }
}
async function identity(reader, address) {
  if (!sourceDigest) {
    const m = await fetch("release.json");
    if (!m.ok) throw Error("Release manifest is unavailable.");
    sourceDigest = (await m.json()).contract_sha256;
  }
  const code = await reader.getContractCode(address);
  if (typeof code !== "string" || (await sha256(code)) !== sourceDigest)
    throw Error(
      "Deployed source does not match the canonical release. Writes are disabled.",
    );
}
async function settle(entry) {
  const { client: reader, account } = await ensure();
  if (
    entry.address.toLowerCase() !== addr().toLowerCase() ||
    entry.account.toLowerCase() !== account.toLowerCase()
  )
    throw Error(
      "Pending transaction belongs to a different account or contract.",
    );
  status(
    "Submitted " + entry.hash + " · waiting for FINALIZED. Do not resend.",
    "loading",
  );
  const receipt = await settledReceipt(reader, entry);
  if (finalizedOK(receipt)) {
    await ensure();
    const key = pendingKey(account);
    const saved = localStorage.getItem(key);
    if (saved && JSON.parse(saved).hash !== entry.hash)
      throw Error("Pending transaction changed. Inspect it before continuing.");
    localStorage.setItem(readbackKey(account), JSON.stringify(entry));
    localStorage.removeItem(key);
    status(
      "FINALIZED / SUCCESS · " + entry.hash + ". Readback follows.",
      "success",
    );
    return receipt;
  }
  if (finalized(receipt))
    throw Error(
      "Finalized transaction has no verified successful execution: " +
        entry.hash +
        ". Pending hash retained; inspect the execution result before retrying.",
    );
  throw Error("Transaction is not finalized. Resume later using " + entry.hash);
}
async function write(method, args) {
  const { client: reader, account } = await ensure();
  const address = addr();
  await identity(reader, address);
  const key = pendingKey(account);
  const old = localStorage.getItem(key);
  if (old) {
    const pending = JSON.parse(old);
    await settle(pending);
    await reloadSettled(pending);
    throw Error(
      "Previous transaction resolved. Read the latest proposal before sending another write.",
    );
  }
  const refresh = localStorage.getItem(readbackKey(account));
  if (refresh) {
    await reloadSettled(JSON.parse(refresh));
    throw Error("Confirmed state refreshed. Review it before sending another write.");
  }
  localStorage.setItem(key, "storage-check");
  localStorage.removeItem(key);
  status("Review the " + method + " request in your wallet.", "loading");
  const hash = await reader.writeContract({
    address,
    functionName: method,
    args,
    value: 0n,
  });
  if (typeof hash !== "string" || !/^0x[0-9a-fA-F]{64}$/.test(hash))
    throw Error(
      "Unexpected wallet response. Inspect the wallet before retrying.",
    );
  const entry = { hash, address, account, method, args };
  try {
    localStorage.setItem(key, JSON.stringify(entry));
  } catch {
    status(
      "Transaction submitted but storage failed. Save this hash and do not resend: " +
        hash,
      "error",
    );
    throw Error(
      "Pending hash " +
        hash +
        " must be checked manually before another write.",
    );
  }
  await settle(entry);
  await reloadSettled(entry);
}
async function reloadSettled(entry) {
  const reference =
    entry.method === "acknowledge"
      ? entry.args[0]
      : entry.account.toLowerCase() + "::" + entry.args[0];
  $("ref").value = validRef(reference);
  try {
    await load();
    localStorage.removeItem(readbackKey(entry.account));
  } catch (error) {
    throw Error(
      "FINALIZED / SUCCESS · " + entry.hash +
      ". State refresh failed: " + rpcDetail(error) +
      ". Use Check pending transaction to retry the read only. Do not resend.",
    );
  }
}
async function loadOnce() {
  const address = addr(),
    reference = ref();
  const reader = connection?.client ?? client();
  const p = parse(
    await reader.readContract({
      address,
      functionName: "get_proposal",
      args: [reference],
    }),
  );
  if (
    p.protocol !== PROTOCOL ||
    !Number.isInteger(p.head) ||
    p.head < 1 ||
    p.head > 32
  )
    throw Error("Unsupported contract protocol or version count.");
  const versions = [];
  for (let v = 1; v <= p.head; v++)
    versions.push(
      parse(
        await reader.readContract({
          address,
          functionName: "get_version",
          args: [reference, v],
        }),
      ),
    );
  let acknowledgements = [];
  if (connection)
    acknowledgements = parse(
      await reader.readContract({
        address,
        functionName: "get_acknowledgement_history",
        args: [reference, connection.account],
      }),
    );
  const loaded = {
    protocol: PROTOCOL,
    mode: "onchain",
    title: p.title,
    trail: versions,
    acknowledgements,
  };
  await verifyRecord(loaded);
  proposal = p;
  state = loaded;
  chosen = "chain";
  $("after").value = p.current.text;
  render();
  status(
    "Readback loaded and text digests verified. Block finality is not inferred from a read.",
    "success",
  );
  try {
    await identity(reader, address);
    $("modeBadge").textContent = "STUDIONET / CANONICAL SOURCE VERIFIED";
  } catch (e) {
    throw Error("Readback loaded. " + rpcDetail(e));
  }
}
async function sealNew() {
  validateText($("after").value);
  if (mode === "demo") {
    chosen = "custom";
    state = await seal($("title").value, $("after").value);
    render();
    status(
      "V1 sealed locally. Exact UTF-8 text fingerprint recorded. No AI or chain call.",
      "success",
    );
  } else {
    const id = $("localId").value.trim();
    if (!/^[a-z0-9-]{1,40}$/.test(id))
      throw Error(
        "Local ID must use 1–40 lowercase letters, digits or hyphens.",
      );
    await write("create", [id, $("title").value, $("after").value]);
  }
}
async function assess() {
  if (!state) throw Error("Seal or load a proposal first.");
  validateText($("after").value);
  if (mode === "live") {
    if (!proposal) throw Error("Read the proposal first.");
    const { account } = await ensure();
    if (proposal.owner !== account.toLowerCase())
      throw Error("Only the proposal owner can append a revision.");
    await write("revise", [
      ref().split("::")[1],
      proposal.head,
      $("after").value,
    ]);
    return;
  }
  const fixture = CASES[chosen],
    eligible =
      fixture &&
      state.trail.length === 1 &&
      state.trail[0].text === BASE &&
      $("after").value === fixture.text;
  const assessment = eligible ? clone(fixture.assessment) : unknownAssessment();
  if (!eligible) chosen = "custom";
  state = await append(state, $("after").value, assessment);
  render();
  status(
    eligible
      ? "Preset comparison sealed locally. This is a fixture outcome, not AI consensus."
      : "Custom revision sealed as UNASSESSED / REVIEW. A fresh acknowledgement is required. No AI was called.",
    "success",
  );
}
async function run(fn) {
  if (busy) return;
  busy = true;
  const controls = [...document.querySelectorAll("button,input,textarea")];
  const previous = controls.map((el) => el.disabled);
  controls.forEach((el) => (el.disabled = true));
  try {
    await fn();
  } catch (e) {
    status(e.shortMessage ?? e.message ?? String(e), "error");
  } finally {
    busy = false;
    controls.forEach((el, i) => (el.disabled = previous[i]));
    if (state) $("ack").disabled = applicability(state).exact;
  }
}
function showDiff() {
  if ($("diff").hidden) {
    const a = $("before").value,
      b = $("after").value;
    let start = 0;
    while (start < Math.min(a.length, b.length) && a[start] === b[start])
      start++;
    let end = 0;
    while (
      end < Math.min(a.length, b.length) - start &&
      a[a.length - 1 - end] === b[b.length - 1 - end]
    )
      end++;
    $("diff").replaceChildren(
      document.createTextNode(a.slice(0, start)),
      text("del", a.slice(start, end ? a.length - end : undefined)),
      text("ins", b.slice(start, end ? b.length - end : undefined)),
      document.createTextNode(end ? a.slice(a.length - end) : ""),
    );
  }
  $("diff").hidden = !$("diff").hidden;
  $("showDiff").textContent = $("diff").hidden
    ? "Inspect text differences ＋"
    : "Hide text differences −";
}
for (const [i, [name, s]] of Object.entries(CASES).entries()) {
  const button = text("button", "", "scenario");
  button.dataset.case = name;
  button.setAttribute("aria-pressed", "false");
  const label = text("span", s.title);
  label.append(text("small", s.subtitle));
  button.append(text("b", String(i + 1).padStart(2, "0")), label);
  button.onclick = () => run(() => select(name));
  $("scenarios").append(button);
}
$("demo").onclick = () => run(() => configure("demo"));
$("live").onclick = () => run(() => configure("live"));
$("assess").onclick = () => run(assess);
$("seal").onclick = () => run(sealNew);
$("wallet").onclick = () => run(wallet);
$("load").onclick = () => run(load);
$("resume").onclick = () =>
  run(async () => {
    const { account } = await ensure();
    const entry = localStorage.getItem(pendingKey(account));
    if (!entry) {
      const refresh = localStorage.getItem(readbackKey(account));
      if (refresh) {
        await reloadSettled(JSON.parse(refresh));
        return;
      }
      throw Error("No saved pending transaction for this account and contract.");
    }
    const pending = JSON.parse(entry);
    await settle(pending);
    await reloadSettled(pending);
  });
$("ack").onclick = () =>
  run(async () => {
    if (!state) throw Error("Seal or load a proposal first.");
    if (mode === "live") {
      await write("acknowledge", [ref(), proposal.head]);
    } else {
      state = acknowledge(state);
      render();
      status(
        "Acknowledgement saved locally for exact V" +
          state.trail.at(-1).version +
          ". Earlier records remain intact.",
        "success",
      );
    }
  });
$("newProposal").onclick = () =>
  run(async () => {
    if (mode === "live") {
      proposal = null;
      state = null;
      $("ref").value = "";
    } else {
      chosen = "custom";
      state = null;
    }
    $("before").value = "";
    $("after").value = "";
    $("title").value = "";
    $("result").hidden = true;
    $("history").replaceChildren(
      text(
        "p",
        "No versions yet. Enter a title and proposal text, then choose “Seal as new V1”.",
        "empty",
      ),
    );
    $("recordDigest").textContent = "No sealed record.";
    $("recordText").textContent = "";
    $("ackHistory").replaceChildren();
    $("after").focus();
    status("New proposal workspace. Enter text in AFTER, then seal V1.");
    updateCount();
  });
$("after").oninput = () => {
  updateCount();
  $("diff").hidden = true;
};
$("showDiff").onclick = showDiff;
$("verify").onclick = () =>
  run(async () => {
    if (!state) throw Error("There is no record to verify.");
    await verifyRecord(state);
    status(
      "Verified: exact text SHA-256, parent links, version order, epochs and acknowledgement bindings. This does not prove authorship or AI accuracy.",
      "success",
    );
  });
$("export").onclick = () =>
  run(async () => {
    if (!state) throw Error("There is no record to export.");
    await verifyRecord(state);
    const blob = new Blob(
      [
        exportRecord(state, {
          network: mode === "live" ? 61999 : null,
          reference: mode === "live" ? ref() : null,
          contract: mode === "live" ? addr() : null,
        }),
      ],
      { type: "application/json" },
    );
    const a = document.createElement("a");
    const url = URL.createObjectURL(blob);
    a.href = url;
    a.download = "ballotseal-record.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    status(
      "Complete record exported, including exact texts and acknowledgement history.",
      "success",
    );
  });
$("importFile").onchange = () =>
  run(async () => {
    const file = $("importFile").files[0];
    if (!file) return;
    if (file.size > 400000)
      throw Error("Record file is too large (maximum 400 KB).");
    const record = JSON.parse(await file.text());
    await verifyRecord(record);
    status(
      "File integrity verified across " +
        record.trail.length +
        " versions. This checks internal consistency, not origin, AI accuracy or chain inclusion.",
      "success",
    );
    $("importFile").value = "";
  });
$("copyHash").onclick = () =>
  run(async () => {
    if (!state) throw Error("No digest is available.");
    await navigator.clipboard.writeText(
      state.trail.find((v) => v.version === selected).digest,
    );
    status("SHA-256 digest copied.", "success");
  });
function openGuide() {
  if ($("guide").showModal) $("guide").showModal();
  else $("guide").setAttribute("open", "");
}
$("guideOpen").onclick = openGuide;
$("guideStart").onclick = () => {
  $("guide").close?.();
  $("guide").removeAttribute("open");
  try {
    localStorage.setItem("ballotseal-guide-seen", "1");
  } catch {
    /* Storage is optional for the guide preference. */
  }
  location.hash = "desk";
};
provider()?.on?.("accountsChanged", () => {
  connection = null;
  if (mode === "live" && state) {
    state.acknowledgements = [];
    render();
  }
  $("wallet").textContent = "Reconnect wallet";
  status("Wallet account changed. Read the proposal again before writing.");
});
provider()?.on?.("chainChanged", () => {
  connection = null;
  if (mode === "live" && state) {
    state.acknowledgements = [];
    render();
  }
  status("Network changed. Reconnect on Stable Studionet.");
});
await run(async () => {
  try {
    const stored = localStorage.getItem("ballotseal-local-v3");
    if (stored) {
      const restored = JSON.parse(stored);
      if (restored.mode !== "local") throw Error("Not a local record.");
      await verifyRecord(restored);
      state = restored;
      chosen = "custom";
      render();
      $("after").value = state.trail.at(-1).text;
      status(
        "Your local record was restored and its integrity verified. Choose a fixture to start a fresh example.",
      );
    } else await select("copy");
  } catch {
    await select("copy");
  }
});
