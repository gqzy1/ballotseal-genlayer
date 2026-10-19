# Runtime evidence and limits

Target: Stable GenLayer Studionet (61999). Contract dependency pinned to `py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6`.

| Environment | Evidence | Limit |
|---|---|---|
| Python 3.12 | Syntax/import support through direct runner | Ordinary Python alone is insufficient |
| Official SDK Direct Mode | Actual persistent SDK containers, decorators and calldata round trips, mocked LLM output; v0.2.16 artifacts | No WASM sandbox, real consensus or live AI |
| Official genvm-linter 0.11.0 | AST safety checks, SDK validation, schema extraction, configured normal Pyright | Static/SDK validation, not fixed GenVM execution |
| Fixed GenVM WASM executor | NOT RUN: no configured executor/node in this workspace | Runtime-specific execution behavior unverified |
| Stable Studionet | No deployment or write authorized; one read-only POST preflight archived | No onchain capability/fees/consensus/finality evidence |

Use `tests/test_protocol.py` for the explicit artifact version. No `latest` runner is used. Exact `genlayer-test==0.29.2`, `pytest==8.4.2`, `genvm-linter==0.11.0` are pinned in requirements. SDK schema is in `docs/abi.json`. Compatibility claims are restricted to these observed checks.

Official references consulted:
- https://docs.genlayer.com/developers/intelligent-contracts/features/calling-llms
- https://docs.genlayer.com/api-references/genlayer-linter
- https://docs.genlayer.com/understand-genlayer-protocol/core-concepts/genvm

There is no standalone single-provider AI API in this implementation. Native GenLayer semantic consensus is implemented, but not claimed to have executed live.
