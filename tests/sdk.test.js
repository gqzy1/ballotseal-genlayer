import test from "node:test";
import assert from "node:assert/strict";
import { connect, finalized, finalizedOK, parse } from "../sdk.js";
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

test("raw consensus receipt success is recognized without a legacy status field", () => {
  const receipt = {
    status_name: "FINALIZED",
    consensus_data: { leader_receipt: [{ execution_result: "SUCCESS" }] },
  };
  assert.equal(finalized(receipt), true);
  assert.equal(finalizedOK(receipt), true);
  for (const candidate of [
    { ...receipt, status_name: "ACCEPTED" },
    { ...receipt, status: "PENDING" },
    { status_name: "FINALIZED" },
    { ...receipt, execution_result: "FAILURE" },
    { ...receipt, consensus_data: { leader_receipt: [{ execution_result: "ERROR" }] } },
    { ...receipt, consensus_data: { leader_receipt: [] } },
  ]) assert.equal(finalizedOK(candidate), false);
  assert.equal(finalizedOK({
    statusName: "FINALIZED",
    txExecutionResultName: "FINISHED_WITH_RETURN",
  }), true);
});
