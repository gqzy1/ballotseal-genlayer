import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
const expected = (await readFile("SOURCE_SHA256.txt", "utf8")).split(/\s/)[0];
const actual = createHash("sha256")
  .update(await readFile("contracts/ballot_seal.py"))
  .digest("hex");
if (expected !== actual) throw Error("Canonical contract SHA256 mismatch.");
console.log("Canonical contract SHA256 verified: " + actual);
