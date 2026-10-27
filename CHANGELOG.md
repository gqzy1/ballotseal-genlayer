# Changelog

## 0.4.0 · Cross-version consent audit · 2026-10-27

Baseline: `a3146938ce93631a0eed9977a2ac2ae839b3c281` (previously accepted application).

- Added a read-only audit workspace for arbitrary version intervals and specified wallet addresses without wallet connection.
- Added full intermediate five-dimension evidence and a version-bound acknowledgement applicability matrix, including the first invalidating revision.
- Added portable audit reports with deterministic digests, independently recomputed analysis, report import and exact chain-history re-verification.
- Added stable-head and latest-acknowledgement consistency checks, exact deployed-source identity and viewer binding.
- Added an explicitly archived real-chain example and automated audit/domain/DOM regression coverage.

Previously: inspect a version and the connected viewer's current acknowledgement. Now: trace any interval and viewer, identify where old confirmation ceased to apply, and share a report that can be independently checked against chain history.

Existing contracts, addresses and protocol are unchanged. Existing transactions demonstrate the new reader; they are not new transactions for this release.
