# Protocol and API — ballotseal-0.3

Canonical source: `contracts/ballot_seal.py`. All writes reject stale expected versions. References use `lowercase-owner-address::local-id`; local ID is 1–40 lowercase ASCII letters, digits and hyphens. Same IDs under different owners are isolated.

| Method | Arguments | Return |
|---|---|---|
| create | local_id str, title str, text str | namespaced ref str |
| revise | local_id str, expected_version int, text str | None |
| acknowledge | ref str, expected_version int | None |
| get_proposal | ref str | JSON metadata + current version |
| get_version | ref str, version int | JSON immutable record |
| get_acknowledgement | ref str, address str | latest version, applicability and exact-current flag |
| get_acknowledgement_history | ref str, address str | JSON ordered immutable acknowledgements |

create seals V1 / epoch 1. Only its owner can revise; caller address constructs the reference, so another caller cannot reach its namespace through a local ID. revise snapshots the old version and proposed full text, builds one immutable prompt and invokes `run_nondet_unsafe`. Each role independently calls `exec_prompt`. Strict parser checks all keys, labels, explanation bounds and quotes. Validator compares its own labels to the leader's in all five positions. Prose equivalence is intentionally not required. Failed/rejected consensus commits no version changes under GenLayer's atomic transaction semantics; direct-mode tests separately verify that invalid output reaches no writes.

SAME × 5 preserves epoch; CHANGED anywhere increments it; remaining UNCERTAIN increments it. Revision records store exact text, SHA256, parent text digest, version, epoch, assessment and action. Parent links establish order of the stored text fingerprints. They do not commit all assessment/metadata bytes cryptographically; contract state inclusion must be verified separately.

acknowledge accepts only the current version and writes an immutable `(ref, address, version)` record containing digest and epoch. Duplicate confirmation of that exact version reverts. Only the latest-version pointer is updated. Historical records remain queryable. Applicability is latest acknowledged epoch == current epoch. This registry does not assert what other DAO software should do with the signal.

Storage: JSON strings in typed persistent TreeMaps for proposals and versions, a u256 latest-acknowledgement pointer, a separate immutable acknowledgement map, and u256 per-owner proposal counts. No admin, deletion, arbitrary verdict setter, scheduler, payments or API key.

See `abi.json` for the schema extracted by the actual pinned SDK validation. Reasons are descriptive accepted-leader annotations. Neither the schema nor their presence proves factual/semantic correctness.
