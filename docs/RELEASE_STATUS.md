# Release status — V0.3

**READY TO SUBMIT** under the project acceptance scope, as of 20 October 2026. This is a product acceptance status, not a guarantee of external review approval.

- Stable GenLayer Studionet, chain **61999**.
- Contract: `0x01Da0016b86dA8DD85721A502Cb88B5dfb462d4c`.
- Seven transactions finalized successfully: deployment, creation, two acknowledgements and three native semantic revisions.
- Four immutable versions; epochs **1, 1, 2, 2**. A material budget change invalidated the old acknowledgement; a later cosmetic change did not revive it.
- Full deployed source matches both repositories: SHA-256 `08deb1ff3faf647a239ae99d362894ab57e4a478d5f2c00b19e0f1585e7f39af`.
- Automated evidence: 29 contract Direct Mode tests with mocked LLM output; 26 frontend tests; SDK, lint, type, source and production-build checks.
- Chrome desktop network reads, integrity verification and JSON export were exercised. Chrome 320×844 and 390×844 screenshots were reviewed; the user confirmed narrow-screen verification, JSON download and normal button operation.
- Physical mobile hardware, real external EIP-1193 writes and live missing-terms UNCERTAIN labels are untested. These limits are documented, not represented as successful tests.

[Live evidence](LIVE_ACCEPTANCE.md) · [Runtime boundaries](RUNTIME.md) · [Deployment](DEPLOYMENT.md).
