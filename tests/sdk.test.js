import test from "node:test";
import assert from "node:assert/strict";
import {
  connect,
  finalized,
  finalizedOK,
  parse,
  settledReceipt,
} from "../sdk.js";
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
    {
      ...receipt,
      consensus_data: { leader_receipt: [{ execution_result: "ERROR" }] },
    },
    { ...receipt, consensus_data: { leader_receipt: [] } },
  ])
    assert.equal(finalizedOK(candidate), false);
  assert.equal(
    finalizedOK({
      statusName: "FINALIZED",
      txExecutionResultName: "FINISHED_WITH_RETURN",
    }),
    true,
  );
});

test("pinned SDK full and simplified receipt shapes retain successful execution", async () => {
  const { simplifyTransactionReceipt, decodeLocalnetTransaction } =
    await import("genlayer-js");
  const full = decodeLocalnetTransaction({
    hash: "0x" + "a".repeat(64),
    status: 7,
    statusName: "FINALIZED",
    result_name: "MAJORITY_AGREE",
    data: {},
    consensus_data: {
      leader_receipt: [{ mode: "leader", execution_result: "SUCCESS" }],
      validators: [{ vote: "idle", execution_result: "ERROR" }],
    },
  });
  const simplified = simplifyTransactionReceipt(full);
  assert.equal(finalizedOK(simplified), true);
  assert.equal(finalizedOK(full), true);
});

test("pending recovery verifies the same finalized transaction through connected transport", async () => {
  const entry = {
    hash: "0xc2ac0d9a18394cee793b07000a0399f139824acec683632adb3399072646d32f",
    account: "0xEB56F245EFEceD0899b7e23697FeE512a39DBdCc",
    address: "0x01Da0016b86dA8DD85721A502Cb88B5dfb462d4c",
  };
  const raw = {
    hash: entry.hash,
    from_address: entry.account,
    to_address: entry.address,
    status: "FINALIZED",
    result: 6,
    consensus_data: {
      leader_receipt: [{ execution_result: "SUCCESS" }],
      validators: [{ vote: "idle", execution_result: "ERROR" }],
    },
  };
  let current = raw,
    requests = 0;
  const reader = {
    waitForTransactionReceipt: async (options) => {
      assert.equal(options.fullTransaction, true);
      return { status_name: "FINALIZED" };
    },
    request: async ({ method, params }) => {
      requests++;
      assert.equal(method, "eth_getTransactionByHash");
      assert.deepEqual(params, [entry.hash]);
      return current;
    },
  };
  assert.equal(finalizedOK(await settledReceipt(reader, entry)), true);
  for (const change of [
    { hash: "0x" + "0".repeat(64) },
    { from_address: "0x" + "0".repeat(40) },
    { to_address: "0x" + "0".repeat(40) },
  ]) {
    current = { ...raw, ...change };
    await assert.rejects(
      () => settledReceipt(reader, entry),
      /identity mismatch/,
    );
  }
  for (const change of [
    { status: "ACCEPTED" },
    { result: 3 },
    { consensus_data: { leader_receipt: [{ execution_result: "ERROR" }] } },
  ]) {
    current = { ...raw, ...change };
    assert.equal(finalizedOK(await settledReceipt(reader, entry)), false);
  }
  const before = requests;
  reader.waitForTransactionReceipt = async () => raw;
  assert.equal(finalizedOK(await settledReceipt(reader, entry)), true);
  assert.equal(requests, before);
});
