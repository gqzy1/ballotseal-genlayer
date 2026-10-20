import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { custom, http } from "viem";
export const chainId = 61999;
export function client(provider, account) {
  return createClient({
    chain: studionet,
    transport: provider
      ? custom(provider)
      : http("https://studio.genlayer.com/api"),
    ...(account ? { account } : {}),
  });
}
export async function connect(provider) {
  if (!provider) throw Error("Open this site in a browser with an EVM wallet.");
  const accounts = await provider.request({ method: "eth_requestAccounts" });
  if (Number(await provider.request({ method: "eth_chainId" })) !== chainId)
    throw Error("Select Stable Studionet (chain 61999) in your wallet.");
  if (!accounts[0] || !/^0x[0-9a-fA-F]{40}$/.test(accounts[0]))
    throw Error("No valid wallet account was returned.");
  return { account: accounts[0], client: client(provider, accounts[0]) };
}
export function parse(value) {
  return typeof value === "string" ? JSON.parse(value) : value;
}
export function finalized(receipt) {
  const statuses = [receipt?.status_name, receipt?.statusName, receipt?.status]
    .filter((value) => typeof value === "string");
  return statuses.length > 0 &&
    statuses.every((value) => value.toUpperCase() === "FINALIZED");
}
export function finalizedOK(receipt) {
  if (!finalized(receipt)) return false;
  const results = [];
  if (receipt.execution_result !== undefined)
    results.push(receipt.execution_result === "SUCCESS");
  if (receipt.txExecutionResultName !== undefined)
    results.push(receipt.txExecutionResultName === "FINISHED_WITH_RETURN");
  const leaders = receipt.consensus_data?.leader_receipt;
  if (Array.isArray(leaders))
    for (const leader of leaders)
      if (leader?.execution_result !== undefined)
        results.push(leader.execution_result === "SUCCESS");
  return results.length > 0 && results.every(Boolean);
}
export function validAddress(a) {
  if (!/^0x[0-9a-fA-F]{40}$/.test(a) || /^0x0{40}$/.test(a))
    throw Error("Enter a valid nonzero contract address.");
  return a;
}
export function validRef(r) {
  if (!/^0x[0-9a-fA-F]{40}::[a-z0-9-]{1,40}$/.test(r))
    throw Error("Use owner-address::local-id as the proposal reference.");
  return r;
}
