import test from "node:test";
import assert from "node:assert/strict";
import { connect, finalizedOK, parse } from "../sdk.js";
test("rejects wrong wallet network before writes", async () => {
  await assert.rejects(
    () =>
      connect({
        request: async ({ method }) =>
          method === "eth_requestAccounts" ? ["0x" + "1".repeat(40)] : "0x1",
      }),
    /61999/,
  );
});
test("receipt acceptance requires finalized successful execution", () => {
  assert.equal(
    finalizedOK({ status: "FINALIZED", execution_result: "SUCCESS" }),
    true,
  );
  for (const r of [
    { status: "ACCEPTED", execution_result: "SUCCESS" },
    { status: "FINALIZED", execution_result: "FAILURE" },
    { status: "PENDING" },
    {},
  ])
    assert.equal(finalizedOK(r), false);
});
test("JSON contract reads parsed", () =>
  assert.deepEqual(parse('{"head":1}'), { head: 1 }));
test("missing wallet has useful error", async () =>
  assert.rejects(() => connect(null), /wallet/));
