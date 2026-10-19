# Consensus and security boundary

- Input data is untrusted. A fixed prompt separates instructions from JSON-encoded proposal text and explicitly rejects embedded role changes and suggested verdicts.
- Every validator independently invokes the same classifier on the same complete documents. It does not use the leader's explanation as evidence. Schema and quote validation alone cannot approve an assessment.
- Labels must match per dimension. Different dimensions producing the same overall action do not satisfy the equivalence rule. Wording differences in reasons are allowed.
- Missing terms, unresolved references and incomplete comparisons instruct UNCERTAIN. REVIEW opens a new epoch. No confidence percentage implies certainty.
- Reasons: 20–360 characters; excerpts: 0–240 exact contiguous characters. CHANGED requires at least one excerpt. This rejects fabricated excerpts but cannot prove that a plausible reason supports its label. Model agreement can still be wrong, and correlated models or prompt injection can defeat interpretation. Real model accuracy is NOT TESTED in this release.
- Expected-version guards, owner namespaces and immutable history prevent stale writes, cross-owner revisions and silent acknowledgement replacement. Identity is the transaction sender, not an external DAO membership claim.
- Storage is bounded per address and proposal; users pay network resource costs on deployment. Sybil activity is not eliminated. No rate scheduler or externally verified source.
- SHA256 binds exact UTF-8 text only. It proves neither authorship, truth, legal consent, accepted chain inclusion nor the entire exported metadata bundle.
- Browser writes check the canonical source digest before requesting a write, require chain/account continuity and keep pending transaction hashes. Wallet errors or ambiguous responses must be inspected before retries. A missing/blocked official RPC is not bypassed.
- GenLayer's atomic rollback/finality is a network property; SDK Direct Mode does not establish actual network consensus.

No high-severity known finding is suppressed. Runtime execution and real-model consensus remain explicit release gates.
