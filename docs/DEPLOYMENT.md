# Existing Studionet deployment — do not redeploy

The canonical deployment and seven finalized transactions are recorded in [LIVE_ACCEPTANCE.md](LIVE_ACCEPTANCE.md) and `deployments/studionet.json`.

Address: `0x01Da0016b86dA8DD85721A502Cb88B5dfb462d4c`, chain **61999**. Full deployed bytes match both canonical sources. The 8-broadcast authorization has used **7**, with **0** failed transactions. Slot 8 remains reserved solely for a justified recovery after the original transaction's state is known. It is not an automatic testing or retry allowance.

Reuse this deployment. Do not deploy another instance, upgrade code, Appeal or resend a known hash merely because a UI is stale. Any future write must retain the network/account/source/pending guards, user authorization and budget. Never read/export/store Studio keys or seed phrases. No mainnet, purchases or bridging.

Current release is BLOCKED by the remaining acceptance limits in LIVE_ACCEPTANCE.md, not by absent deployment. Prior no-write authorization and initial deployment plans are historical; the user subsequently explicitly authorized the Studio built-in wallet. Final Portal submission is always performed by the user.

