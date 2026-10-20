# BallotSeal V0.3 live acceptance

This record describes the deployed V0.3 example, semantic revisions and version-bound acknowledgements.

## Network and canonical deployment

- Stable GenLayer Studionet, chain **61999**.
- Contract: `0x01Da0016b86dA8DD85721A502Cb88B5dfb462d4c`.
- Acceptance transaction sender: `0x0A89623dAe594e46BEef902609ED37eA50b7D5B5`.
- Exact canonical source: `contracts/ballot_seal.py`, **9,529 bytes**, SHA-256 `08deb1ff3faf647a239ae99d362894ab57e4a478d5f2c00b19e0f1585e7f39af`.
- The full deployed source was read from the official Explorer Contract/Code DOM, saved, SHA-256 checked, and byte-compared with both canonical copies. Exact match. The Studio upload label was ballotseal_v03_verified.py; source bytes and BallotSeal class are unchanged.
- GenVM dependency: `py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6`.
- Explorer: https://explorer-studio.genlayer.com/address/0x01Da0016b86dA8DD85721A502Cb88B5dfb462d4c
- Proposal reference: `0x0a89623dae594e46beef902609ed37ea50b7d5b5::acceptance-v03`.

## Actual transactions

All seven are **FINALIZED / SUCCESS**. No failed broadcasts were observed.

| # | Method / purpose | Hash | Readback |
|---|---|---|---|
| 1 | deploy | `0xd6a6c8a748dbe0ea31f31db1542f4f5026192ad3a5194d3ed8b2c67d53589def` | Exact deployed source matches canonical |
| 2 | create V1 | `0x567f55e21e08c1153ee0e54eaa8f48927d2d9196e2afa5289d3632422bfd4ead` | head 1 / epoch 1 |
| 3 | acknowledge V1 | `0xfb33404a731ddbb61d286e709148c9de6188b6060b02e26257993ed672e93e58` | acknowledged 1 / applicable true |
| 4 | cosmetic V2 | `0x62db53b8ac94bfa2c9363b1249844ed7df6b4f958b74e691e8d5863c5ee86304` | five SAME / CARRY / epoch 1; V1 acknowledgement remains applicable |
| 5 | doubled budget V3 | `0x6891e55d080b04f4760ad7dd3f265e1041f48e8ea76df4190bd9464239f13a34` | budget CHANGED, other dimensions SAME / RECONFIRM / epoch 2; V1 acknowledgement false |
| 6 | cosmetic V4 | `0x4bc45631d04279523fd25deb847eb8ebb9aa39536d27cd4e602fbfdc2a0298ca` | five SAME / CARRY / epoch 2; V1 acknowledgement stays false |
| 7 | acknowledge V4 | `0x18c8d614a753699f291ecb41bd2497762d654a18054c88d7939560fd8b30385e` | acknowledged 4 / current 4 / applicable true / exact true |

Finalized acknowledgement history retains both V1/epoch1 and V4/epoch2 records. Native LLM output, grounded quotes, labels and validator/quorum information were observed for transactions 4–6. Some validators were cancelled after quorum and shown as ERROR/Idle; these entries are preserved in the receipt text. Quorum cancellation is distinct from a failed business transaction; the receipts do not establish unanimous completed execution.

## Evidence and verification boundaries

`evidence/studionet/` contains the ledger, seven final human-readable Studio receipt snapshots, Finalized readbacks, source comparison and actual public-app JSON export. Receipt text is captured UI evidence, not a claimed raw JSON-RPC receipt export. Transaction hashes allow independent inspection.

The public product at https://gqzy1.github.io/ballotseal-genlayer/ successfully read real V1–V4 through its SDK, verified exact deployed-source SHA-256, displayed real five-dimension results, validated parent links/epochs/digests and exported four real versions. The read-only export has no viewer acknowledgements because no EIP-1193 wallet was connected to that origin. The Studio built-in account's real acknowledgement history is archived separately. An empty viewer export does not imply absent onchain acknowledgements.

Actual target GenVM deployment and contract calls are now evidenced, unlike earlier Direct Mode/mock-only checks. No local Docker/WASM executable or host container image digest is claimed. Cosmetic and doubled-budget semantic consensus ran on the hosted target. Authority/beneficiary/deadline/scope change fixtures were not repeated onchain.

A single missing-terms Studio dry run used the explicit **Simulation Mode / Simulate** UI. It returned `null` (the write method returns no value), and no new transaction appeared. The interface did not expose its five labels, so this is **not a passed live UNCERTAIN-label test** and is not chain consensus evidence.

## Browser acceptance

The published application loaded real V1–V4, displayed the verified-source marker and epoch 2, verified record integrity and downloaded JSON in desktop Chrome. Captured application-origin warning/error count was zero; extension metadata errors were excluded.

Chrome device-toolbar checks covered 320×844 and 390×844 layouts, record verification, JSON download and button operation. Screenshots and manual interaction checks are distinct from automated tests. Physical-phone testing and separate keyboard/reduced-motion runs were not recorded.

## Coverage limits

- Live missing-terms UNCERTAIN labels/reasons were not observable in the dry run. Fail-closed state rules are covered by Direct Mode tests with mocked outputs.
- The live semantic scenarios cover cosmetic wording and a doubled budget. Authority, beneficiary, deadline and scope fixtures were not repeated onchain.
- The original seven transactions used Studio's built-in account. The later deployed-frontend lifecycle below used one connected wallet. Live rejection and account-switch cases remain untested; automated wallet tests use mocks.
- No local WASM/Docker execution or host image digest is claimed. Actual hosted GenVM execution is evidenced by the deployed lifecycle.
- Terminal RPC POST returned HTTP403/1010 in the acceptance environment. Official Studio, Explorer and supported product browser reads succeeded; terminal access is not claimed resolved.

## Automated evidence

29 contract Direct Mode tests, pinned SDK/linter/schema/type/source checks, 33 frontend tests, lint and production build passed. The address-configured bundle also passed `node --check app.js` and `npm run build`. See [validation](../VALIDATION.md) and the raw evidence directory.

Contract source and deterministic business rules are unchanged.


## Deployed frontend lifecycle — 2026-10-21

Manual Chrome acceptance used genlayer-js 1.1.8 on chain 61999 with the same connected wallet, `0xEB56F245EFEceD0899b7e23697FeE512a39DBdCc`.
Proposal: `0xeb56f245efeced0899b7e23697fee512a39dbdcc::web-lifecycle-20261021`.

| Call | Transaction hash | Manually inspected receipt |
|---|---|---|
| create V1 | `0x7c412331bb04c40091cd9aa601225ce900f1bcb3d33b841bfb194ed721137349` | FINALIZED / SUCCESS |
| revise V2 | `0xc2ac0d9a18394cee793b07000a0399f139824acec683632adb3399072646d32f` | FINALIZED / SUCCESS |
| acknowledge V2 | `0xd93dc55d748809c8dcaef504301f045e639fe3a43cc0b90ad6165bf2cdb038ab` | FINALIZED / SUCCESS |

The budget changed from 100 to 200 USDC. The final application view showed “Applicable · acknowledged V2”; JSON was downloaded. The revision receipt contained successful execution and a nonfatal quorum-cancelled entry. PR #9 corrected their classification.

During recovery, the pending marker was cleared, but an RPC error interrupted the following state read. A manual Read proposal restored V2. This run therefore does not establish uninterrupted automatic refresh. PR #10 adds bounded read retry and a persistent post-finality readback checkpoint; its recovery tests use simulated RPC failures and are not an additional live write run.

Receipt statuses above were manually inspected in the browser. The transaction identifiers permit independent Explorer verification; no new raw-receipt archive or independently reverified export digest is claimed for this run.
