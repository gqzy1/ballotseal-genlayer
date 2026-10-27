import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { JSDOM } from "jsdom";
import {
  buildAudit,
  createReport,
  verifyReport,
  reverifyReport,
  readSnapshot,
  CANONICAL_SOURCE,
} from "../audit.js";
import { mountAudit } from "../audit-ui.js";
import { sha256 } from "../domain.js";
const example = JSON.parse(
  readFileSync(new URL("../audit-example.json", import.meta.url)),
);
const code = readFileSync(
  new URL("../contracts/ballot_seal.py", import.meta.url),
  "utf8",
);
const copy = () => structuredClone(example);
const reader = (s = example, override = {}) => ({
  getContractCode: async () => code,
  readContract: async ({ functionName, args }) => {
    const p = {
      protocol: s.record.protocol,
      owner: s.reference.split("::")[0],
      title: s.record.title,
      head: s.record.trail.length,
      epoch: s.record.trail.at(-1).epoch,
      current: s.record.trail.at(-1),
    };
    if (override[functionName]) return override[functionName](args, p);
    if (functionName === "get_proposal") return p;
    if (functionName === "get_version") return s.record.trail[args[1] - 1];
    if (functionName === "get_acknowledgement_history")
      return s.record.acknowledgements;
    const a = s.record.acknowledgements.at(-1);
    return {
      current_version: p.head,
      acknowledged_version: a?.version ?? 0,
      applicable: Boolean(a && a.epoch === p.epoch),
      exact_current_version: a?.version === p.head,
    };
  },
});
test("archived chain history: carry, expiry at V3, renewed V4; all five dimensions", async () => {
  const a = await buildAudit(example, 1, 4);
  assert.deepEqual(
    a.timeline.map((x) => x.status),
    ["EXACT", "CARRIED", "EXPIRED", "EXACT"],
  );
  assert.deepEqual(a.epoch_breaks, [3]);
  assert.equal(a.acknowledgements[0].first_invalidated_at, 3);
  assert.equal(a.steps.length, 3);
  assert.ok(a.steps.every((x) => x.dimensions.length === 5));
});
test("subrange retains acknowledgement and invalidation before range", async () => {
  const s = copy();
  s.record.acknowledgements.pop();
  const a = await buildAudit(s, 3, 4);
  assert.equal(a.timeline[0].invalidated_at, 3);
  assert.equal(a.timeline[1].status, "EXPIRED");
});
test("no acknowledgements and invalid range", async () => {
  const s = copy();
  s.record.acknowledgements = [];
  assert.ok(
    (await buildAudit(s, 1, 4)).timeline.every((x) => x.status === "NO_ACK"),
  );
  for (const range of [
    [0, 4],
    [4, 1],
    [1, 33],
    [2, 2],
    [1.5, 4],
  ])
    await assert.rejects(buildAudit(s, ...range));
});
test("returning to original text does not revive consent", async () => {
  const s = copy();
  s.record.acknowledgements.pop();
  const v = s.record.trail[3],
    prev = s.record.trail[2];
  v.text = s.record.trail[0].text;
  v.digest = await sha256(v.text);
  v.action = "RECONFIRM";
  v.epoch = 3;
  for (const d of Object.values(v.assessment)) {
    d.before_quote = "";
    d.after_quote = "";
    d.reason =
      "The dimension is unchanged except for the explicit budget change.";
    d.label = "SAME";
  }
  Object.assign(v.assessment.budget, {
    label: "CHANGED",
    before_quote: "2,000 USDC",
    after_quote: "1,000 USDC",
  });
  assert.ok(prev.text.includes("2,000 USDC"));
  const a = await buildAudit(s, 1, 4);
  assert.equal(a.endpoint_text_equal, true);
  assert.equal(a.timeline.at(-1).status, "EXPIRED");
  assert.deepEqual(a.epoch_breaks, [3, 4]);
});
test("reject tampered text, viewer, epoch, source and forged derived report", async () => {
  for (const mutate of [
    (s) => (s.record.trail[1].text += "!"),
    (s) => (s.record.acknowledgements[0].address = "0x" + "1".repeat(40)),
    (s) => (s.record.trail[2].epoch = 1),
    (s) => (s.source_sha256 = "fake"),
  ]) {
    const s = copy();
    mutate(s);
    await assert.rejects(buildAudit(s, 1, 4));
  }
  const report = await createReport(example, 1, 4);
  await verifyReport(report);
  report.analysis.epoch_breaks = [];
  await assert.rejects(verifyReport(report));
});
test("source and stable head checked during read; inconsistent ack fails", async () => {
  assert.equal(await sha256(code), CANONICAL_SOURCE);
  const s = await readSnapshot(reader(), example.reference, example.viewer);
  assert.deepEqual(s.record, example.record);
  await assert.rejects(
    readSnapshot(
      { ...reader(), getContractCode: async () => "bad" },
      example.reference,
      example.viewer,
    ),
  );
  let calls = 0;
  await assert.rejects(
    readSnapshot(
      reader(example, {
        get_proposal: (_a, p) => ({
          ...p,
          title: ++calls === 1 ? p.title : "changed",
        }),
      }),
      example.reference,
      example.viewer,
    ),
    /changed during read/,
  );
  await assert.rejects(
    readSnapshot(
      reader(example, { get_acknowledgement: () => ({}) }),
      example.reference,
      example.viewer,
    ),
  );
});
test("offline report is re-derived and checked against exact chain history", async () => {
  const report = await createReport(example, 1, 4);
  const result = await reverifyReport(reader(), report);
  assert.equal(result.additional_versions, 0);
  const changed = copy();
  changed.record.acknowledgements = [];
  await assert.rejects(
    reverifyReport(reader(changed), report),
    /does not match/,
  );
});
async function idle() {
  await new Promise((r) => setTimeout(r, 35));
}
test("DOM archive, range, export, import and live re-verification", async () => {
  const dom = new JSDOM('<section id="root"></section>');
  const prior = globalThis.document;
  globalThis.document = dom.window.document;
  try {
    const root = document.getElementById("root");
    let exported;
    mountAudit(root, {
      reader: () => reader(),
      fetcher: async () => ({ ok: true, json: async () => copy() }),
      download: (value) => {
        exported = JSON.parse(value);
      },
    });
    root.querySelector("#audit-archive").click();
    await idle();
    assert.match(root.textContent, /ARCHIVED CHAIN EVIDENCE/);
    assert.match(root.textContent, /EXPIRED/);
    root.querySelector("#audit-export").click();
    await idle();
    assert.equal(exported.schema, "ballotseal-audit-1");
    const input = root.querySelector("#audit-file");
    Object.defineProperty(input, "files", {
      value: [{ size: 100, text: async () => JSON.stringify(exported) }],
    });
    input.dispatchEvent(new dom.window.Event("change"));
    await idle();
    assert.match(root.textContent, /IMPORTED REPORT/);
    root.querySelector("#audit-reverify").click();
    await idle();
    assert.match(root.textContent, /REPORT MATCHES FRESH CHAIN READ/);
    root.querySelector("#audit-from").value = "4";
    root
      .querySelector("#audit-from")
      .dispatchEvent(new dom.window.Event("change"));
    await idle();
    assert.match(root.textContent, /increasing version range/);
    assert.equal(root.querySelector("#audit-export").disabled, true);
  } finally {
    globalThis.document = prior;
    dom.window.close();
  }
});
