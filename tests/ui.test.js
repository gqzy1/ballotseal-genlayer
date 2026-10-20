import { JSDOM } from "jsdom";
import { readFile } from "node:fs/promises";
import test from "node:test";
import assert from "node:assert/strict";
import * as domain from "../domain.js";
import { finalized, finalizedOK, settledReceipt } from "../sdk.js";
const tick = async (w) => {
  for (let i = 0; i < 200; i++) {
    await new Promise((resolve) => setTimeout(resolve, 5));
    if (!w.document.getElementById("assess").disabled) return;
  }
  throw Error("UI operation did not settle.");
};
async function page(overrides = {}) {
  const dom = new JSDOM(await readFile("index.html", "utf8"), {
    runScripts: "outside-only",
    url: "https://example.com/ballotseal-genlayer/",
  });
  const w = dom.window;
  w.structuredClone = structuredClone;
  w.__domain = domain;
  w.__sdk = {
    connect: async () => {
      throw Error("No wallet requested in tests.");
    },
    parse: JSON.parse,
    finalized,
    finalizedOK,
    settledReceipt,
    validAddress: (a) => {
      if (!/^0x[0-9a-f]{40}$/.test(a))
        throw Error("Enter a valid nonzero contract address.");
      return a;
    },
    validRef: (r) => r,
    ...overrides,
  };
  const code = (await readFile("app.js", "utf8")).replace(
    /^import[\s\S]*?;\n/gm,
    "",
  );
  await w.eval(
    "(async()=>{const {connect,client,parse,finalizedOK,finalized,settledReceipt,validAddress,validRef}=window.__sdk;const {PROTOCOL,DIMS,NAMES,BASE,CASES,seal,append,acknowledge,applicability,unknownAssessment,exportRecord,verifyRecord,sha256,validateText}=window.__domain;" +
      code +
      "})()",
  );
  return w;
}
for (const key of Object.keys(domain.CASES))
  test(key + " full DOM walkthrough", async () => {
    const w = await page(),
      d = w.document;
    d.querySelector('[data-case="' + key + '"]').click();
    await tick(w);
    d.getElementById("assess").click();
    await tick(w);
    assert.equal(d.querySelectorAll(".dimension").length, 5);
    assert.match(
      d.getElementById("decisionTitle").textContent,
      key === "copy"
        ? /Same terms/
        : key === "uncertain"
          ? /Unclear/
          : /terms changed/,
    );
    assert.equal(d.querySelectorAll(".historyRow").length, 2);
    assert.match(
      d.getElementById("recordDigest").textContent,
      /^[0-9a-f]{64}$/,
    );
    d.getElementById("ack").click();
    await tick(w);
    assert.match(d.getElementById("ackStatus").textContent, /acknowledged V2/);
    assert.equal(d.querySelectorAll(".ackEvent").length, 2);
    d.getElementById("verify").click();
    await tick(w);
    assert.match(d.getElementById("status").textContent, /Verified:/);
    d.querySelector('[data-version="1"]').click();
    assert.equal(d.getElementById("recordText").textContent, domain.BASE);
    w.close();
  });
test("custom seal, empty validation, missing AI disclosure and safe DOM output", async () => {
  const w = await page(),
    d = w.document;
  d.getElementById("newProposal").click();
  await tick(w);
  d.getElementById("seal").click();
  await tick(w);
  assert.match(d.getElementById("status").textContent, /20–6,000/);
  d.getElementById("title").value = "<img src=x onerror=alert(1)>";
  d.getElementById("after").value = domain.BASE;
  d.getElementById("seal").click();
  await tick(w);
  assert.equal(d.getElementById("proposalTitle").children.length, 0);
  d.getElementById("after").value = domain.BASE + " More terms.";
  d.getElementById("assess").click();
  await tick(w);
  assert.match(d.getElementById("status").textContent, /UNASSESSED/);
  assert.equal(d.querySelectorAll(".UNCERTAIN").length, 5);
  assert.match(d.getElementById("resultSource").textContent, /NOT AI/);
  w.close();
});
test("diff, guide and chain empty states are interactive", async () => {
  const w = await page(),
    d = w.document;
  d.getElementById("showDiff").click();
  assert.equal(d.getElementById("diff").hidden, false);
  assert.ok(d.querySelector("del"));
  d.getElementById("guideOpen").click();
  assert.ok(d.getElementById("guide").hasAttribute("open"));
  d.getElementById("guideStart").click();
  d.getElementById("live").click();
  await tick(w);
  assert.equal(d.getElementById("liveSettings").hidden, false);
  assert.equal(d.getElementById("scenarios").hidden, true);
  assert.match(d.getElementById("history").textContent, /No proposal/);
  d.getElementById("load").click();
  await tick(w);
  assert.match(d.getElementById("status").textContent, /valid nonzero/);
  w.close();
});
test("narrow layouts and reduced-motion rules exist", async () => {
  const w = await page(),
    d = w.document;
  assert.equal(
    d.querySelector("meta[name=viewport]").content,
    "width=device-width, initial-scale=1",
  );
  const css = await readFile("style.css", "utf8");
  for (const rule of [
    "max-width:480px",
    "max-width:780px",
    "prefers-reduced-motion:reduce",
    ":focus-visible",
  ])
    assert.ok(css.replace(/\s+/g, "").includes(rule));
  for (const area of ["before", "after", "title", "contract", "ref"])
    assert.ok(
      d.getElementById(area).getAttribute("aria-label") ||
        d.getElementById(area).closest("label"),
    );
  assert.equal(d.getElementById("status").getAttribute("aria-live"), "polite");
  w.close();
});

for (const fault of ["none", "transient", "persistent"])
  test("SDK 1.1.8 lifecycle and readback recovery: " + fault, async () => {
    const account = "0x" + "1".repeat(40);
    const address = "0x" + "2".repeat(40);
    const reference = account + "::lifecycle";
    const source = await readFile("contracts/ballot_seal.py", "utf8");
    const digest = await domain.sha256(source);
    let record = null;
    let failuresLeft =
      fault === "transient" ? 1 : fault === "persistent" ? 2 : 0;
    const writes = [],
      reads = [],
      pendingDuringWait = [];
    let w;
    const reader = {
      getContractCode: async () => source,
      writeContract: async ({ functionName, args }) => {
        writes.push(functionName);
        if (functionName === "create")
          record = await domain.seal(args[1], args[2]);
        else if (functionName === "revise") {
          assert.equal(args[1], record.trail.length);
          record = await domain.append(
            record,
            args[2],
            domain.unknownAssessment(),
          );
        } else {
          assert.equal(functionName, "acknowledge");
          assert.equal(args[1], record.trail.length);
          record = domain.acknowledge(record);
        }
        return "0x" + String(writes.length).repeat(64);
      },
      waitForTransactionReceipt: async ({ hash, status, fullTransaction }) => {
        assert.equal(fullTransaction, true);
        assert.equal(status, "FINALIZED");
        const key = "ballotseal-pending:61999:" + address + ":" + account;
        pendingDuringWait.push(JSON.parse(w.localStorage.getItem(key)).hash);
        assert.equal(pendingDuringWait.at(-1), hash);
        return {
          status_name: "FINALIZED",
          consensus_data: { leader_receipt: [{ execution_result: "SUCCESS" }] },
        };
      },
      readContract: async ({ functionName, args }) => {
        reads.push(functionName);
        if (functionName === "get_proposal") {
          if (writes.length === 2 && failuresLeft > 0) {
            failuresLeft--;
            throw Error(
              "An unknown RPC error occurred. Node temporarily unavailable.",
            );
          }
          assert.equal(args[0], reference);
          return JSON.stringify({
            protocol: domain.PROTOCOL,
            owner: account,
            title: record.title,
            head: record.trail.length,
            current: record.trail.at(-1),
          });
        }
        if (functionName === "get_version")
          return JSON.stringify(record.trail[args[1] - 1]);
        assert.equal(functionName, "get_acknowledgement_history");
        return JSON.stringify(record.acknowledgements);
      },
    };
    w = await page({ connect: async () => ({ account, client: reader }) });
    const d = w.document;
    w.ethereum = {
      request: async ({ method }) =>
        method === "eth_accounts" ? [account] : "0xf22f",
    };
    w.fetch = async () => ({
      ok: true,
      json: async () => ({ contract_sha256: digest }),
    });
    d.getElementById("live").click();
    await tick(w);
    d.getElementById("contract").value = address;
    d.getElementById("localId").value = "lifecycle";
    d.getElementById("title").value = "Live lifecycle regression";
    d.getElementById("after").value = domain.BASE;
    const key = "ballotseal-pending:61999:" + address + ":" + account;
    for (const [button, text] of [
      ["seal", domain.BASE],
      ["assess", domain.BASE + " Additional deliverables require review."],
      ["ack", null],
    ]) {
      if (text) d.getElementById("after").value = text;
      const previousReads = reads.length;
      d.getElementById(button).click();
      await tick(w);
      assert.equal(w.localStorage.getItem(key), null);
      const refreshKey = key.replace(
        "ballotseal-pending:",
        "ballotseal-readback:",
      );
      if (button === "assess" && fault === "persistent") {
        assert.match(
          d.getElementById("status").textContent,
          /FINALIZED \/ SUCCESS/,
        );
        assert.match(
          d.getElementById("status").textContent,
          /State refresh failed/,
        );
        assert.ok(w.localStorage.getItem(refreshKey));
        const polls = pendingDuringWait.length;
        const sent = writes.length;
        d.getElementById("ref").value = "";
        d.getElementById("resume").click();
        await tick(w);
        assert.equal(pendingDuringWait.length, polls);
        assert.equal(writes.length, sent);
        assert.equal(d.getElementById("ref").value, reference);
      }
      assert.equal(w.localStorage.getItem(refreshKey), null);
      assert.ok(reads.length > previousReads, "successful writes reload state");
      assert.equal(d.getElementById("status").dataset.kind, "success");
      assert.equal(d.getElementById("assess").disabled, false);
    }
    assert.deepEqual(writes, ["create", "revise", "acknowledge"]);
    w.localStorage.setItem(
      key,
      JSON.stringify({
        hash: "0x" + "3".repeat(64),
        address,
        account,
        method: "acknowledge",
        args: [reference, 2],
      }),
    );
    d.getElementById("ref").value = "";
    const beforeRecovery = reads.length;
    d.getElementById("resume").click();
    await tick(w);
    assert.equal(w.localStorage.getItem(key), null);
    assert.equal(d.getElementById("ref").value, reference);
    assert.ok(reads.length > beforeRecovery);
    assert.deepEqual(writes, ["create", "revise", "acknowledge"]);
    assert.equal(pendingDuringWait.length, 4);
    assert.equal(d.querySelectorAll(".historyRow").length, 2);
    assert.match(d.getElementById("ackStatus").textContent, /acknowledged V2/);
    d.getElementById("demo").click();
    await tick(w);
    assert.equal(d.getElementById("liveSettings").hidden, true);
    assert.equal(d.getElementById("scenarios").hidden, false);
    assert.equal(d.getElementById("status").dataset.kind, "info");
    assert.match(d.getElementById("modeBadge").textContent, /LOCAL FIXTURE/);
    assert.equal(d.querySelectorAll(".historyRow").length, 1);
    d.getElementById("assess").click();
    await tick(w);
    assert.equal(d.querySelectorAll(".historyRow").length, 2);
    assert.deepEqual(writes, ["create", "revise", "acknowledge"]);
    w.close();
  });
