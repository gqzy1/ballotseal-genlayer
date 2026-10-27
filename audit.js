import { PROTOCOL, DIMS, verifyRecord, sha256 } from "./domain.js";
import { parse, validAddress, validRef } from "./sdk.js";
export const AUDIT_SCHEMA = "ballotseal-audit-1";
export const CANONICAL_SOURCE =
  "08deb1ff3faf647a239ae99d362894ab57e4a478d5f2c00b19e0f1585e7f39af";
export const CANONICAL_CONTRACT = "0x01Da0016b86dA8DD85721A502Cb88B5dfb462d4c";
export const EXAMPLE_VIEWER = "0x0a89623dae594e46beef902609ed37ea50b7d5b5";
export const EXAMPLE_REF = EXAMPLE_VIEWER + "::acceptance-v03";
const stable = (value) =>
  JSON.stringify(value, (_key, item) =>
    item && typeof item === "object" && !Array.isArray(item)
      ? Object.fromEntries(
          Object.keys(item)
            .sort()
            .map((k) => [k, item[k]]),
        )
      : item,
  );
export async function validateSnapshot(s) {
  if (
    !s ||
    s.chain_id !== 61999 ||
    s.contract?.toLowerCase() !== CANONICAL_CONTRACT.toLowerCase() ||
    s.source_sha256 !== CANONICAL_SOURCE
  )
    throw Error("Unsupported audit source.");
  validRef(s.reference);
  validAddress(s.viewer);
  await verifyRecord(s.record);
  if (s.record.mode !== "onchain")
    throw Error("Audit requires a chain record.");
  for (const a of s.record.acknowledgements)
    if (a.address?.toLowerCase() !== s.viewer.toLowerCase())
      throw Error("Acknowledgement belongs to another viewer.");
  return true;
}
export async function readSnapshot(reader, reference, viewer) {
  validRef(reference);
  validAddress(viewer);
  const code = await reader.getContractCode(CANONICAL_CONTRACT);
  if (typeof code !== "string" || (await sha256(code)) !== CANONICAL_SOURCE)
    throw Error("Deployed source mismatch.");
  const read = async (functionName, args) =>
    parse(
      await reader.readContract({
        address: CANONICAL_CONTRACT,
        functionName,
        args,
      }),
    );
  const first = await read("get_proposal", [reference]);
  if (
    first.protocol !== PROTOCOL ||
    !Number.isInteger(first.head) ||
    first.head < 1 ||
    first.head > 32 ||
    first.owner?.toLowerCase() !== reference.split("::")[0].toLowerCase()
  )
    throw Error("Invalid proposal metadata.");
  const trail = [];
  for (let v = 1; v <= first.head; v++)
    trail.push(await read("get_version", [reference, v]));
  const acknowledgements = await read("get_acknowledgement_history", [
    reference,
    viewer,
  ]);
  const latest = await read("get_acknowledgement", [reference, viewer]);
  const last = await read("get_proposal", [reference]);
  if (
    stable(first) !== stable(last) ||
    stable(first.current) !== stable(trail.at(-1)) ||
    first.epoch !== trail.at(-1).epoch
  )
    throw Error("Proposal changed during read. Read again.");
  const ack = acknowledgements.at(-1);
  if (
    latest.current_version !== first.head ||
    latest.acknowledged_version !== (ack?.version ?? 0) ||
    latest.applicable !== Boolean(ack && ack.epoch === first.epoch) ||
    latest.exact_current_version !== (ack?.version === first.head)
  )
    throw Error("Acknowledgements changed during read. Read again.");
  const snapshot = {
    chain_id: 61999,
    contract: CANONICAL_CONTRACT,
    source_sha256: CANONICAL_SOURCE,
    reference,
    viewer: viewer.toLowerCase(),
    read_at: new Date().toISOString(),
    record: {
      protocol: PROTOCOL,
      mode: "onchain",
      title: first.title,
      trail,
      acknowledgements,
    },
  };
  await validateSnapshot(snapshot);
  return snapshot;
}
export async function buildAudit(snapshot, from, to) {
  await validateSnapshot(snapshot);
  const { trail, acknowledgements } = snapshot.record;
  if (
    !Number.isInteger(from) ||
    !Number.isInteger(to) ||
    from < 1 ||
    to <= from ||
    to > trail.length
  )
    throw Error("Choose an increasing version range.");
  const steps = trail.slice(from, to).map((v) => ({
    from: v.version - 1,
    to: v.version,
    action: v.action,
    epoch: v.epoch,
    dimensions: DIMS.map((d) => ({ dimension: d, ...v.assessment[d] })),
  }));
  const timeline = trail.slice(from - 1, to).map((v) => {
    const a = acknowledgements.filter((a) => a.version <= v.version).at(-1);
    const lost = a
      ? trail.slice(a.version, v.version).find((x) => x.epoch !== a.epoch)
      : null;
    return {
      version: v.version,
      epoch: v.epoch,
      acknowledged_version: a?.version ?? null,
      status: !a
        ? "NO_ACK"
        : a.epoch !== v.epoch
          ? "EXPIRED"
          : a.version === v.version
            ? "EXACT"
            : "CARRIED",
      invalidated_at: lost?.version ?? null,
    };
  });
  const histories = acknowledgements
    .filter((a) => a.version <= to)
    .map((a) => ({
      version: a.version,
      epoch: a.epoch,
      digest: a.digest,
      first_invalidated_at:
        trail.slice(a.version, to).find((v) => v.epoch !== a.epoch)?.version ??
        null,
    }));
  return {
    from,
    to,
    endpoint_text_equal: trail[from - 1].text === trail[to - 1].text,
    from_digest: trail[from - 1].digest,
    to_digest: trail[to - 1].digest,
    epoch_breaks: steps.filter((x) => x.action !== "CARRY").map((x) => x.to),
    steps,
    timeline,
    acknowledgements: histories,
  };
}
export async function createReport(snapshot, from, to) {
  const report = {
    schema: AUDIT_SCHEMA,
    snapshot,
    analysis: await buildAudit(snapshot, from, to),
  };
  return { ...report, digest: await sha256(stable(report)) };
}
export async function verifyReport(report) {
  if (report?.schema !== AUDIT_SCHEMA || typeof report.digest !== "string")
    throw Error("Unsupported audit report.");
  const rebuilt = await createReport(
    report.snapshot,
    report.analysis?.from,
    report.analysis?.to,
  );
  if (stable(rebuilt) !== stable(report))
    throw Error("Audit report integrity mismatch.");
  return rebuilt;
}
export async function reverifyReport(reader, report) {
  await verifyReport(report);
  const old = report.snapshot;
  const fresh = await readSnapshot(reader, old.reference, old.viewer);
  if (
    fresh.record.title !== old.record.title ||
    fresh.record.trail.length < old.record.trail.length ||
    stable(fresh.record.trail.slice(0, old.record.trail.length)) !==
      stable(old.record.trail) ||
    stable(
      fresh.record.acknowledgements.filter(
        (a) => a.version <= old.record.trail.length,
      ),
    ) !== stable(old.record.acknowledgements)
  )
    throw Error("Report does not match chain history.");
  return {
    snapshot: fresh,
    additional_versions: fresh.record.trail.length - old.record.trail.length,
  };
}
