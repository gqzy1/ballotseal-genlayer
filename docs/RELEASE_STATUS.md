# Release status — V0.3

Final submission status: **BLOCKED**.

Implementation PR #1 is merged. Implementation main commit: `f8e7512c463423d46fe9a0454f7d25b593f477b1`; reviewed development head: `025212914651a0c81528e31f681187f8a6a26a02`. Later acceptance-only documentation commits do not change the canonical contract or app bundle.

Local implementation checks passed: A 29 SDK Direct Mode tests, official AST/SDK/schema validation and normal Pyright (0 errors/warnings); B 26 automated domain/DOM/adapter tests, lint, syntax/source checks and production build. A/B source digest: `08deb1ff3faf647a239ae99d362894ab57e4a478d5f2c00b19e0f1585e7f39af`.

Both repositories now contain full code, MIT license, architecture/API/security/runtime notes, tests and submission drafts. Normal PR merge followed successful local checks and source/diff review. GitHub-hosted CI remained queued and was not represented as a pass or bypassed by disabling checks. No branch was force-pushed and initial history is preserved.

The existing public walkthrough is updated: https://ballotseal-gqzy1.zsf197176.chatgpt.site/ . Browser acceptance is recorded in the Projects repository. Pages is configured to Actions; its main workflow is queued, not a verified deployment. Intended Pages URL https://gqzy1.github.io/ballotseal-genlayer/ is not represented as live.

Open gates:
1. Fixed GenVM executor execution, actual model accuracy and independent live consensus unverified.
2. Contract deployment and all chain writes prohibited in this task. No address, receipt, wallet signing or fund usage. Projects requires actual GenLayer interaction; SDK mocks/fixtures do not qualify.
3. Official JSON-RPC POST eth_chainId returned HTTP 403 / Cloudflare 1010 once. No repeated requests or bypass attempts.
4. Actual narrow/mobile browser layout could not be exercised with available viewport controls. Source/DOM responsive and accessibility checks passed.
5. GitHub-hosted CI/Pages runner queue remains unresolved at this checkpoint.

No Portal submission occurred. Remaining work requires separate authorization for deployment/signatures plus supported network access; no user action is needed to inspect this release's code or public local walkthrough. See DEPLOYMENT.md for the bounded next-stage acceptance procedure.
