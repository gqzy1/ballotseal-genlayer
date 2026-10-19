# Current validation — V0.3

This report covers the V0.3 application and its canonical contract copy.

Current result: **26/26 PASS**, lint/syntax/source checks and production build PASS locally.

Automated verification commands: `npm ci`, `npm run check`, `npm run lint`, `npm test`, `npm run verify:source`, `npm run build`. Raw logs are in evidence/. Node domain/DOM/SDK tests check all seven examples, custom input validation, five reasons, epoch rules, historical acknowledgements, digest/export verification and tampering, text diff, safe text rendering, guide, chain empty/error modes, receipt finality checks and wallet network rejection. Responsive/reduced-motion rule checks are source checks; actual rendered-layout acceptance is recorded separately.

Canonical full source is byte-identical to Repository A; SOURCE_SHA256.txt is checked locally and in CI. Interface protocol is ballotseal-0.3. The generated release.json includes the verified deployment from deployments/studionet.json. No private key, signing secret or paid API is used.

See [browser acceptance](evidence/browser-acceptance.md) and [live evidence](docs/LIVE_ACCEPTANCE.md) for desktop, narrow-screen and deployed lifecycle results. Direct Mode and adapter mocks are distinct from the seven actual finalized transactions. External EIP-1193 writes and physical mobile hardware remain untested.
