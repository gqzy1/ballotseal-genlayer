# BallotSeal 0.4 verification

Application baseline: `a3146938ce93631a0eed9977a2ac2ae839b3c281`.

Published code: `c51b1ca2c91c484d8d2638b7704877c609fac69f`.

[Changes from baseline](https://github.com/gqzy1/ballotseal-genlayer/compare/a3146938ce93631a0eed9977a2ac2ae839b3c281...c51b1ca2c91c484d8d2638b7704877c609fac69f) · [Successful verification and Pages deployment](https://github.com/gqzy1/ballotseal-genlayer/actions/runs/40457754141) · [Open audit workspace](https://gqzy1.github.io/ballotseal-genlayer/#consent-audit).

## New workflow verified on 27 October 2026

The published application completed these actual desktop Chrome interactions:

1. Wallet-free live read of the canonical deployment, proposal `acceptance-v03` and its owner's acknowledgement history.
2. V1–V4 audit displayed EXACT → CARRIED → EXPIRED → EXACT, with the first invalidation at V3 and five-dimension intermediate evidence.
3. Exported the live audit JSON, then reopened that exact downloaded report. Imported provenance was reset to unverified.
4. Re-verified the report through fresh chain reads. The application displayed **Report matches stored chain history. 0 later version(s) found.**
5. Changed the interval to V2–V4; the table and transition evidence updated accordingly.

[Actual browser-exported report](audit-browser-report.json) · [Verified report screenshot](audit-browser.jpg) · [Independent SDK read](audit-live.json) · [41 passing automated tests](audit-tests.log).

No application-origin error was observed in the inspected browser log; extension metadata errors were excluded. Automated tests exercise archive loading, export/import, mocked live re-verification, report tampering, source mismatch, changing heads, acknowledgement inconsistency, invalid intervals, missing acknowledgements and return-to-original-text semantics. The published live read and re-verification above are separate from those mocked tests.

Syntax, lint, all 41 tests, canonical source hash, production build and formatting passed in GitHub Actions. Versioned application assets prevent reuse of cached 0.3 scripts. The source bytes and address of the deployed contract are unchanged.

Existing chain transactions supply the audit input. They are not new deployments or new semantic consensus transactions for release 0.4. No user adoption, mobile-device test or legal-consent guarantee is claimed.
