import { JSDOM } from "jsdom";
import { readFile } from "node:fs/promises";
import test from "node:test";
import assert from "node:assert/strict";
import * as domain from "../domain.js";
const tick = () => new Promise((resolve) => setTimeout(resolve, 15));
async function page() {
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
    finalizedOK: () => false,
    validAddress: (a) => {
      if (!/^0x[0-9a-f]{40}$/.test(a))
        throw Error("Enter a valid nonzero contract address.");
      return a;
    },
    validRef: (r) => r,
  };
  const code = (await readFile("app.js", "utf8")).replace(
    /^import[\s\S]*?;\n/gm,
    "",
  );
  await w.eval(
    "(async()=>{const {connect,client,parse,finalizedOK,validAddress,validRef}=window.__sdk;const {PROTOCOL,DIMS,NAMES,BASE,CASES,seal,append,acknowledge,applicability,unknownAssessment,exportRecord,verifyRecord,sha256,validateText}=window.__domain;" +
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
    await tick();
    d.getElementById("assess").click();
    await tick();
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
    await tick();
    assert.match(d.getElementById("ackStatus").textContent, /acknowledged V2/);
    assert.equal(d.querySelectorAll(".ackEvent").length, 2);
    d.getElementById("verify").click();
    await tick();
    assert.match(d.getElementById("status").textContent, /Verified:/);
    d.querySelector('[data-version="1"]').click();
    assert.equal(d.getElementById("recordText").textContent, domain.BASE);
    w.close();
  });
test("custom seal, empty validation, missing AI disclosure and safe DOM output", async () => {
  const w = await page(),
    d = w.document;
  d.getElementById("newProposal").click();
  await tick();
  d.getElementById("seal").click();
  await tick();
  assert.match(d.getElementById("status").textContent, /20–6,000/);
  d.getElementById("title").value = "<img src=x onerror=alert(1)>";
  d.getElementById("after").value = domain.BASE;
  d.getElementById("seal").click();
  await tick();
  assert.equal(d.getElementById("proposalTitle").children.length, 0);
  d.getElementById("after").value = domain.BASE + " More terms.";
  d.getElementById("assess").click();
  await tick();
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
  await tick();
  assert.equal(d.getElementById("liveSettings").hidden, false);
  assert.equal(d.getElementById("scenarios").hidden, true);
  assert.match(d.getElementById("history").textContent, /No proposal/);
  d.getElementById("load").click();
  await tick();
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
