# Current validation — V0.3

This report applies to the imported-and-revised source, not historical V0.1/V0.2 test numbers.

Current result: **26/26 PASS**, lint/syntax/source checks and production build PASS locally.

Automated verification commands: `npm ci`, `npm run check`, `npm run lint`, `npm test`, `npm run verify:source`, `npm run build`. Raw logs are in evidence/. Node domain/DOM/SDK tests check all seven examples, custom input validation, five reasons, epoch rules, historical acknowledgements, digest/export verification and tampering, text diff, safe text rendering, guide, chain empty/error modes, receipt finality checks and wallet network rejection. Responsive/reduced-motion rule checks are source checks; actual rendered-layout acceptance is recorded separately.

Canonical full source is byte-identical to Repository A; SOURCE_SHA256.txt is checked locally and in CI. Interface protocol is ballotseal-0.3. The generated release.json does not contain a deployed address. No private key, signing secret or paid API is used.

See evidence/browser-acceptance.md for rendered browser/publication checks when completed and docs/RUNTIME.md for SDK/GenVM boundaries. Live network consensus and wallet E2E are NOT RUN. Do not treat fixtures or DOM tests as onchain evidence. Projects final submission remains BLOCKED on actual GenLayer interaction.
