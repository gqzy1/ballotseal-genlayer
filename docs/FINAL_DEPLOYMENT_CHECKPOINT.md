# Final deployment checkpoint — 2026-10-19

**BLOCKED: no deployment or real model/chain acceptance is claimed.**

## Verified release

Canonical contracts/ballot_seal.py SHA-256: 08deb1ff3faf647a239ae99d362894ab57e4a478d5f2c00b19e0f1585e7f39af. Both main copies have Git blob 1844fc26509bb39f4595579aee52f92fe176cb7a. Contract code remains unchanged.

A CI cache path was repaired in PR https://github.com/gqzy1/ballot-seal-primitive/pull/3. Run https://github.com/gqzy1/ballot-seal-primitive/actions/runs/39292448402 succeeded: 29 Direct Mode tests (mock LLM), pinned SDK setup, linter (3 AST checks, 3 writes/4 views) and SHA-256 verification. This does not prove fixed GenVM or real consensus execution.

B main run https://github.com/gqzy1/ballotseal-genlayer/actions/runs/39286155585 succeeded, including 26 tests, lint/check, source verification, production build and Pages deployment. https://gqzy1.github.io/ballotseal-genlayer/ was opened in real Chrome: wording revision preserved epoch/old acknowledgement; record integrity verification succeeded. No application-origin console error was observed (extension metadata errors excluded). Existing public preview remains https://ballotseal-gqzy1.zsf197176.chatgpt.site/ . Prior seven-scenario/export/import desktop evidence remains applicable because product code is unchanged. Narrow-screen browser execution remains unverified; CSS/DOM checks are not device acceptance.

## Authorized deployment boundary

The user now authorizes at most **8 broadcast transactions**, failures included, exclusively Stable Studionet chain 61999. Only a user-confirmed, user-controlled wallet may sign, with user confirmation through supported UI. No keys/seed phrases may be requested, read or stored; no mainnet, purchase, bridge or automatic Appeal. Broadcast so far: **0/8**. No hash, receipt or contract address exists.

One current official RPC eth_chainId POST returned HTTP403 / error code 1010. Requests stopped; no access-control bypass. Official Studio UI was reachable. Canonical source was imported into its editor; Run and Debug showed no constructor parameters, not deployed, and no transactions. Its network menu showed chain 61999. The displayed account's ownership/signing method is unverified; no Deploy click or signature was requested. Unrelated/shared Studio log entries are not BallotSeal evidence.

## Remaining acceptance gates

User must select/confirm a wallet they control and perform supported signing. Execute/verify the fixed target runtime or supported Studio simulation before release, then deploy exact canonical source, save final receipt/address and read back full source bytes. Configure that address in the app without disabling source/network/account/pending guards. Complete create V1, acknowledge V1, cosmetic V2 (carry), material V3 (invalidate), cosmetic V4 (no resurrection), acknowledge V4; verify every final execution result and chain readback. Deployment plus workflow is 7 transactions; reserve #8 solely for a justified recovery. Once a hash exists, track it before any retry. Real five-dimension labels/reasons/uncertainty remain untested; do not fill gaps with fixtures. Complete actual narrow-screen browser acceptance. Then update submission drafts with verified facts; no Portal submission has been made.
