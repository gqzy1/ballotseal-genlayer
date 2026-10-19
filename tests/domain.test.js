import test from "node:test";
import assert from "node:assert/strict";
import {
  BASE,
  CASES,
  DIMS,
  seal,
  append,
  acknowledge,
  applicability,
  unknownAssessment,
  verifyRecord,
  exportRecord,
  sha256,
  validateText,
} from "../domain.js";
for (const [key, scenario] of Object.entries(CASES))
  test("scenario " + key + " follows the contract epoch rule", async () => {
    const s = acknowledge(await seal("Grant", BASE));
    const next = await append(s, scenario.text, scenario.assessment);
    assert.equal(
      next.trail[1].action,
      key === "copy" ? "CARRY" : key === "uncertain" ? "REVIEW" : "RECONFIRM",
    );
    assert.equal(applicability(next).applicable, key === "copy");
    assert.equal(s.trail.length, 1);
    assert.equal(s.acknowledgements.length, 1);
    assert.equal(await verifyRecord(next), true);
    const ack = acknowledge(next);
    assert.equal(applicability(ack).exact, true);
    assert.equal(ack.acknowledgements.length, 2);
  });
test("exact UTF8 SHA256 including emoji and whitespace", async () => {
  const { createHash } = await import("node:crypto");
  const value = BASE + " 🌐\n ";
  assert.equal(
    await sha256(value),
    createHash("sha256").update(value).digest("hex"),
  );
});
test("custom local input is always uncertain and invalidates old acknowledgement", async () => {
  let s = acknowledge(await seal("Grant", BASE));
  s = await append(s, BASE + " Updated.", unknownAssessment());
  assert.equal(s.trail[1].action, "REVIEW");
  assert.equal(applicability(s).applicable, false);
  assert.equal(
    DIMS.every((k) => s.trail[1].assessment[k].label === "UNCERTAIN"),
    true,
  );
});
test("later same dimensions never resurrect an earlier epoch", async () => {
  let s = acknowledge(await seal("Grant", BASE));
  s = await append(s, CASES.budget.text, CASES.budget.assessment);
  const a = structuredClone(CASES.copy.assessment);
  for (const k of DIMS) {
    a[k].before_quote = "";
    a[k].after_quote = "";
  }
  s = await append(s, CASES.budget.text + " ", a);
  assert.equal(s.trail.at(-1).epoch, 2);
  assert.equal(applicability(s).applicable, false);
});
test("export round trip and tamper detection", async () => {
  const s = await append(
    acknowledge(await seal("Grant", BASE)),
    CASES.deadline.text,
    CASES.deadline.assessment,
  );
  assert.equal(await verifyRecord(JSON.parse(exportRecord(s))), true);
  for (const mutate of [
    (r) => (r.trail[0].text += "x"),
    (r) => (r.trail[1].parent_digest = "bad"),
    (r) => (r.trail[1].epoch = 1),
    (r) => (r.acknowledgements[0].digest = "bad"),
    (r) => (r.trail[1].action = "CARRY"),
    (r) => (r.trail[0].version = 2),
  ]) {
    const t = structuredClone(s);
    mutate(t);
    await assert.rejects(() => verifyRecord(t));
  }
});
test("bounds, no-change and duplicate acknowledgement guard", async () => {
  for (const value of ["x", " ".repeat(6000) + BASE])
    assert.throws(() => validateText(value));
  await assert.rejects(() => seal("", BASE));
  let s = await seal("Grant", BASE);
  await assert.rejects(
    () => append(s, BASE, unknownAssessment()),
    /no text change/,
  );
  s = acknowledge(s);
  assert.throws(() => acknowledge(s), /already/);
});
