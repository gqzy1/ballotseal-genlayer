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

User screenshots at 320×844 (homepage) and 390×844 (workbench) were reviewed. Visible content had no obvious obstruction. On 20 October 2026 the user confirmed successful verification, JSON download and normal button operation after the narrow-screen read/verify/export instructions.

Evidence is screenshot review plus user-reported interaction in Chrome device-toolbar emulation. Physical mobile hardware, an independent user-local console capture, keyboard traversal and reduced-motion execution were not recorded. CSS and automated DOM checks are separate evidence.

## Publication

GitHub Pages is the current deployment-configured application. The earlier chatgpt.site publication was an offline preview and is not the current release. Real chain receipts and runtime boundaries are documented in [live acceptance](../docs/LIVE_ACCEPTANCE.md).
