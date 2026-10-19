# BallotSeal — The terms changed. Did your consent?

A complete static governance amendment desk built for GenLayer. **V0.3 has a source-verified Stable Studionet deployment.** Local fixtures, custom unassessed drafts and network readbacks are explicitly separated. Fixtures do not imply live AI success; actual onchain evidence is recorded separately in [live acceptance](docs/LIVE_ACCEPTANCE.md).

[Public app](https://ballotseal-gqzy1.zsf197176.chatgpt.site/) · [canonical Intelligent Contract](https://github.com/gqzy1/ballot-seal-primitive) · [validation](VALIDATION.md) · [Projects submission draft](docs/SUBMISSION_PROJECTS.md).

## Try the complete workflow

1. Open “How it works” for the three-step guide. Start with a fixture: wording, doubled budget, new treasury authority, changed deadline, new beneficiary, expanded scope or missing terms.
2. Inspect the BEFORE/AFTER text and character diff. Choose “Compare & seal revision” to view all five labels and reasons. These outcomes are fixed examples, not AI findings.
3. Check the consent epoch. Only five SAME labels carry the epoch; material or uncertain results open a fresh one. Acknowledge the exact current version locally; old confirmation records remain visible.
4. Click versions in the timeline, copy the text digest, verify the record and export JSON. “Verify a file” checks a prior export without loading it as trusted chain evidence.
5. Choose “New proposal”, enter a title and complete text in AFTER, and seal V1. Local custom revisions always use UNASSESSED / REVIEW with five UNCERTAIN labels. No model is silently substituted.
6. For the verified deployment, select Studionet connection and use the prefilled address/reference. Read-only loading requires no wallet. Writes require a wallet, matching canonical deployed source, chain/account checks and an explicit user signature.

## Build and verify

Node 22+:

```bash
npm ci
npm run check
npm run lint
npm test
npm run verify:source
npm run build
```

Serve `dist/` with a static host. No backend, database, private API key or paid AI dependency. `.github/workflows/pages.yml` checks PRs and builds/deploys main through GitHub Pages. All asset paths are relative for project-path hosting. Fonts use local system stacks; the geometric brand is a code-native SVG.

## Source map

| Path | Purpose |
|---|---|
| index.html, style.css, brand.svg | Graphite/cyan/violet identity; responsive full interface; reduced motion |
| app.js | UI, readback verification, explicit wallet writes and pending recovery |
| domain.js | Local fixture lifecycle, exact text hashing, export validation |
| sdk.js | Pinned genlayer-js client, wallet and network guards |
| contracts/ballot_seal.py | Complete byte-identical canonical contract from Repository A |
| SOURCE_SHA256.txt, scripts/verify-source.mjs | Canonical source digest verification |
| tests/ | Domain, SDK adapter and actual DOM workflow tests |
| docs/ | Architecture, API, security, runtime and submission material |
| evidence/ | Real command outputs and release acceptance evidence |

The contract protocol is `ballotseal-0.3`; changing its source requires synchronized A/B copies and a new verified deployment. `dist/release.json` is generated with the exact source digest and `deployments/studionet.json`. The browser fails closed if deployed source differs. It does not deploy contracts.

## Honest capability boundary

SHA256 confirms exact text bytes, not authorship or truth. File verification checks internal consistency, not AI accuracy or onchain inclusion. An acknowledgement is not a vote, quorum, membership, legal consent or permission to execute funds. Explanations are accepted-leader annotations, with independent consensus over labels. Local state is browser-local and can be modified by its owner; export before clearing browser data.

A verified Studionet address is configured. Seven actual transactions and real public-app reads are archived in [LIVE_ACCEPTANCE.md](docs/LIVE_ACCEPTANCE.md). Final release remains **BLOCKED** by the documented live uncertainty, narrow-screen and external-wallet acceptance limits. No Portal submission was made.

MIT licensed.

GitHub Pages has successfully published and been operated in real Chrome: https://gqzy1.github.io/ballotseal-genlayer/ . The older public Site remains an offline walkthrough; use Pages for the current deployment configuration.

## Latest live acceptance

See [actual deployment, seven final receipts and remaining gates](docs/LIVE_ACCEPTANCE.md). Canonical source remains unchanged; the full deployed bytes match A/B. Broadcast budget used: **7/8**. Historical no-deployment statements are superseded by this evidence. Final status remains **BLOCKED** until the documented acceptance gaps are resolved.

