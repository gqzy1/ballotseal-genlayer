# Current validation — V0.3

This report covers the V0.3 application and its canonical contract copy.

Current result: **31/31 PASS** in GitHub Actions, including the SDK 1.1.8 sequential-write regression.

Automated verification commands: `npm ci`, `npm run check`, `npm run lint`, `npm test`, `npm run verify:source`, `npm run build`, `npm run format:check`. Raw logs are in evidence/. Node domain/DOM/SDK tests check all seven examples, custom input validation, five reasons, epoch rules, historical acknowledgements, digest/export verification and tampering, text diff, safe text rendering, guide, chain empty/error modes, receipt finality checks and wallet network rejection. Responsive/reduced-motion rule checks are source checks; actual rendered-layout acceptance is recorded separately.

Canonical full source is byte-identical to Repository A; SOURCE_SHA256.txt is checked locally and in CI. Interface protocol is ballotseal-0.3. The generated release.json includes the verified deployment from deployments/studionet.json. No private key, signing secret or paid API is used.

See [browser acceptance](evidence/browser-acceptance.md) and [live evidence](docs/LIVE_ACCEPTANCE.md) for desktop, narrow-screen and deployed lifecycle results. Direct Mode and adapter mocks are distinct from the seven actual finalized transactions. The create → revise → acknowledge regression uses the application event handlers and receipt classifier with mocked wallet/network responses. It checks `status_name: "FINALIZED"` and successful consensus receipts, pending-marker removal, refreshed state, consecutive writes from one wallet, and switching back to local mode after a chain read. This is not a new on-chain wallet execution. External EIP-1193 writes and physical mobile hardware remain untested.

Pending recovery additionally checks the installed SDK decoder/simplifier and identity-checked connected-transport receipt lookup. Full SDK receipts are requested. Recovery restores the saved proposal reference, clears only a verified successful pending transaction, and reloads proposal state without resubmitting. These tests use fixtures; they do not replace live wallet evidence.

Finalized majority-agree receipts may include a successful execution alongside a nonfatal CONSENSUS_VALIDATOR_QUORUM_REACHED cancellation. The classifier excludes only this exact cancellation and still requires successful execution; genuine failures remain blocked.
