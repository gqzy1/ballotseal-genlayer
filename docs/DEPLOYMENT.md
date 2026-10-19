# Studionet deployment

| Field | Value |
|---|---|
| Network | Stable GenLayer Studionet |
| Chain ID | 61999 |
| Contract | `0x01Da0016b86dA8DD85721A502Cb88B5dfb462d4c` |
| Protocol | ballotseal-0.3 |
| Source | `contracts/ballot_seal.py` |
| SHA-256 | `08deb1ff3faf647a239ae99d362894ab57e4a478d5f2c00b19e0f1585e7f39af` |

The deployment manifest is `deployments/studionet.json`. Full deployed source bytes were read back and matched against both repositories. Deployment and all six subsequent acceptance calls finalized successfully; hashes and readbacks are in [LIVE_ACCEPTANCE.md](LIVE_ACCEPTANCE.md).

## Read the example

Open https://gqzy1.github.io/ballotseal-genlayer/ and select **Studionet connection**. Keep the configured address and reference `0x0a89623dae594e46beef902609ed37ea50b7d5b5::acceptance-v03`, then choose **Read proposal**. No wallet is required for reads. Inspect four versions and epoch 2, then verify and export the record.

## Integration checks

Use the configured instance for review. Before any write, verify chain, account, complete source digest and current version. Preserve a returned transaction hash and inspect its final execution status before considering another request. A successful read alone does not establish finality. Never export wallet keys to connect another application.

For a separate deployment, follow the pinned source dependency and API in [RUNTIME.md](RUNTIME.md) and [PROTOCOL.md](PROTOCOL.md). The web application does not deploy contracts. Terminal RPC access returned HTTP403/1010 in the acceptance environment; supported Studio and browser reads succeeded. No proxy fallback is configured.
