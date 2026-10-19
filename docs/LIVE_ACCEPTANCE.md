# BallotSeal V0.3 live acceptance

**Overall release gate: BLOCKED.** The seven-transaction chain workflow succeeded. Remaining acceptance limits are stated below; no Portal submission was made.

## Network and canonical deployment

- Stable GenLayer Studionet, chain **61999**.
- Contract: `0x01Da0016b86dA8DD85721A502Cb88B5dfb462d4c`.
- User explicitly selected and authorized the Studio built-in account `0x0A89623dAe594e46BEef902609ED37eA50b7D5B5`. No private key or seed phrase was read, exported or stored.
- Exact canonical source: `contracts/ballot_seal.py`, **9,529 bytes**, SHA-256 `08deb1ff3faf647a239ae99d362894ab57e4a478d5f2c00b19e0f1585e7f39af`.
- The full deployed source was read from the official Explorer Contract/Code DOM, saved, SHA-256 checked, and byte-compared with both canonical copies. Exact match. The Studio upload label was ballotseal_v03_verified.py; source bytes and BallotSeal class are unchanged.
- GenVM dependency: `py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6`.
- Explorer: https://explorer-studio.genlayer.com/address/0x01Da0016b86dA8DD85721A502Cb88B5dfb462d4c
- Proposal reference: `0x0a89623dae594e46beef902609ed37ea50b7d5b5::acceptance-v03`.

## Actual transactions

All seven are **FINALIZED / SUCCESS**. Budget used **7/8**, failed broadcasts **0**, one recovery slot remains unused. No Appeal, redeployment, upgrade, purchase, bridge or mainnet transaction occurred.

| # | Method / purpose | Hash | Readback |
|---|---|---|---|
| 1 | deploy | `0xd6a6c8a748dbe0ea31f31db1542f4f5026192ad3a5194d3ed8b2c67d53589def` | Exact deployed source matches canonical |
| 2 | create V1 | `0x567f55e21e08c1153ee0e54eaa8f48927d2d9196e2afa5289d3632422bfd4ead` | head 1 / epoch 1 |
| 3 | acknowledge V1 | `0xfb33404a731ddbb61d286e709148c9de6188b6060b02e26257993ed672e93e58` | acknowledged 1 / applicable true |
| 4 | cosmetic V2 | `0x62db53b8ac94bfa2c9363b1249844ed7df6b4f958b74e691e8d5863c5ee86304` | five SAME / CARRY / epoch 1; V1 acknowledgement remains applicable |
| 5 | doubled budget V3 | `0x6891e55d080b04f4760ad7dd3f265e1041f48e8ea76df4190bd9464239f13a34` | budget CHANGED, other dimensions SAME / RECONFIRM / epoch 2; V1 acknowledgement false |
| 6 | cosmetic V4 | `0x4bc45631d04279523fd25deb847eb8ebb9aa39536d27cd4e602fbfdc2a0298ca` | five SAME / CARRY / epoch 2; V1 acknowledgement stays false |
| 7 | acknowledge V4 | `0x18c8d614a753699f291ecb41bd2497762d654a18054c88d7939560fd8b30385e` | acknowledged 4 / current 4 / applicable true / exact true |

Finalized acknowledgement history retains both V1/epoch1 and V4/epoch2 records. Native LLM output, grounded quotes, labels and validator/quorum information were observed for transactions 4–6. Some validators were cancelled after quorum and shown as ERROR/Idle; these entries are preserved in the receipt text. Do not describe them as seven failed transactions or as five unanimous completed validator executions.

## Evidence and verification boundaries

`evidence/studionet/` contains the ledger, seven final human-readable Studio receipt snapshots, Finalized readbacks, source comparison and actual public-app JSON export. Receipt text is captured UI evidence, not a claimed raw JSON-RPC receipt export. Transaction hashes allow independent inspection.

The public product at https://gqzy1.github.io/ballotseal-genlayer/ successfully read real V1–V4 through its SDK, verified exact deployed-source SHA-256, displayed real five-dimension results, validated parent links/epochs/digests and exported four real versions. The read-only export has no viewer acknowledgements because no EIP-1193 wallet was connected to that origin. The Studio built-in account's real acknowledgement history is archived separately. Do not claim an empty reader export proves absent onchain acknowledgements.

Actual target GenVM deployment and contract calls are now evidenced, unlike earlier Direct Mode/mock-only checks. No local Docker/WASM executable or host container image digest is claimed. Cosmetic and doubled-budget semantic consensus ran on the hosted target. Authority/beneficiary/deadline/scope change fixtures were not repeated onchain.

A single missing-terms Studio dry run used the explicit **Simulation Mode / Simulate** UI. It returned `null` (the write method returns no value), and no new transaction appeared. The interface did not expose its five labels, so this is **not a passed live UNCERTAIN-label test** and is not chain consensus evidence. No extra broadcast was spent to improve a table.

## Remaining gates

1. Live UNCERTAIN labels/reasons were not observable in the non-persistent dry run. Fail-closed logic is covered by prior Direct Mode tests, not claimed as live model validation.
2. Actual narrow-screen browser acceptance remains unavailable. The cloud browser has no supported viewport control or installed local browser executable. A file:// QA page was rejected by browser URL policy; no workaround was attempted. Desktop screenshots and CSS checks are not mobile acceptance.
3. Transactions used the authorized Studio built-in wallet. Public-app EIP-1193 wallet writes/rejection/account-switch behavior were not exercised with a real external wallet; prior adapter tests remain mock tests. Do not extract the Studio key to bridge this gap.

Earlier terminal RPC POST evidence remains HTTP403/1010. Auto-review rejected a repeated terminal confirmation; it was not executed or bypassed. Official Studio, Explorer and the product's supported browser RPC reads worked. This is not a claim that the terminal access restriction is resolved. The official supported path is the existing Studio UI; persistent access restrictions can be reported through the official documentation/community links. No support message was sent.

## Reused checks and minimal release changes

Prior checks: A 29 Direct Mode tests, pinned SDK/linter/schema/type checks; B 26 tests, lint/check, source verification and production build. These suites were not manually rerun in this acceptance phase. The previously pending A main CI 39293675655 was read as completed/success.

The only product changes attach the real deployment manifest/default address/reference and correct obsolete undeployed text. Canonical contract, SDK dependencies, classifier, epochs, history, wallet/network/source/pending guards and styling are unchanged. `node --check app.js` and a production build were run for this changed address-configured bundle; this was not a rerun of the unchanged candidate. New PR commits receive normal repository CI before merge. No Portal submit button was clicked.

