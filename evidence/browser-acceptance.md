# Browser acceptance — V0.3

Current application: https://gqzy1.github.io/ballotseal-genlayer/

## Desktop Chrome

- Homepage, navigation and onboarding were operated.
- Seven local fixtures were compared through the UI. Outcomes are authored examples, not chain consensus. See browser-scenarios.json.
- Custom input validation, conservative local REVIEW, history, integrity checks and JSON export/import were exercised.
- The actual Studionet deployment loaded V1–V4, source verification and epoch 2. Record verification and a real JSON download succeeded; the export's four text digests matched.
- Captured application-origin warnings/errors: zero. Extension metadata errors were excluded.
- The earlier local-fixture browser-export.json remains offline evidence; the onchain export is evidence/studionet/onchain-export.json.

## Narrow-screen Chrome

Chrome device-toolbar checks covered 320×844 and 390×844 layouts. Record verification, JSON download and normal button operation were manually confirmed on 20 October 2026. This is browser emulation, not physical-device testing. Separate keyboard and reduced-motion execution were not recorded.

## Publication

GitHub Pages is the current deployment-configured application. Real chain receipts and runtime boundaries are documented in [live acceptance](../docs/LIVE_ACCEPTANCE.md).
