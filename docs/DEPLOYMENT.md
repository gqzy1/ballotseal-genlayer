# Deployment gate — 8-transaction authorization

Current authority and evidence are recorded in [FINAL_DEPLOYMENT_CHECKPOINT.md](FINAL_DEPLOYMENT_CHECKPOINT.md). This supersedes the historical no-transactions authorization in earlier release notes; it does not claim a deployment.

1. Verify canonical full-source SHA-256, A/B byte identity, ABI, pinned SDK and checks.
2. Complete fixed GenVM execution or supported Studio simulation. Clearly distinguish SDK Direct Mode, mock LLM, real model and actual chain results.
3. Verify chain **61999** and user-controlled wallet; user signs through supported UI. Never request/read/store private keys or seed phrases. Maximum **8 broadcasts**, failures included. No purchase, bridge, mainnet or automatic Appeal.
4. Deploy exact source with no constructor parameters; retain hash, final execution receipt and address. Read back deployed source and compare full bytes/digest. Do not resend after receiving a hash; resolve its status first.
5. Configure verified address in the frontend; retain canonical source, network, account and pending-hash guards.
6. Through the product: create V1; acknowledge V1; cosmetic V2 (same epoch); material V3 (new epoch, old acknowledgement invalid); cosmetic V4 (old acknowledgement stays invalid); acknowledge V4 and verify immutable history. Deployment plus six writes = 7 transactions. #8 is only for justified recovery after original status is known.
7. Inspect each final status, execution result, model labels/reasons and chain readback. Record untested scenarios honestly. No fabricated receipt/address, consensus or deployment claim.
8. Complete real desktop/narrow-screen browser acceptance, update evidence and both English submission drafts, and stop at READY TO SUBMIT. User alone submits Portal.
