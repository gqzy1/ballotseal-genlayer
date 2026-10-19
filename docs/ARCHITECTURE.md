# Architecture and integration

Buildless source UI plus esbuild-bundled `genlayer-js@1.1.8`. No server. GitHub Actions builds static `dist/` on main and publishes it as a Pages artifact. Desktop/tablet/phone CSS uses 1100/780/480 breakpoints, text-labelled statuses, labelled form fields, a skip link, keyboard focus outlines, an aria-live status region and a reduced-motion override.

## Execution modes

- Local fixture: seven authored comparisons with visibly disclosed preset outcomes. Initial example V1 acknowledgement is simulated and labelled.
- Custom local: seal complete arbitrary text. No AI is called. Each revision is conservative REVIEW, all five UNCERTAIN, fresh epoch. This is an offline lifecycle demonstration, not semantic classification.
- Studionet: exact supported protocol readbacks through official RPC, complete historical text SHA/parent/epoch checks. Wallet optional for reads. No address supplied by this release. Contract source must match generated release digest before an explicit write.

`domain.js` mirrors the contract's deterministic epoch and acknowledgement rules; local tests cover them. The browser never submits local labels or model findings to the contract. Only revise(text) invokes native consensus within the contract.

## Writes and recovery

Explicit buttons invoke create/revise/acknowledge; no page load or test requests signatures. Before a write: account continuity, chain 61999, canonical source and pending-context checks. UI controls are disabled during operations. After submission, save transaction hash + destination/account/method/args under a chain/contract/account-scoped key. A later write resolves that saved transaction and stops to require fresh reads. Only FINALIZED / SUCCESS receipts count as execution success. Finalized business failure is an error. A readback is verified after success. Unknown responses are not auto-retried.

If browser storage fails after a transaction hash exists, the hash is shown and manual inspection is required before retrying. Local pending records do not independently prove transaction inclusion or finality. Live recovery behavior remains untested.

Read-only failures, including Cloudflare restrictions, are shown without claiming a successful load. There is no proxy workaround or silent fallback RPC.

## Integrity and exports

Text hashes use exact UTF-8; limits count Unicode code points consistently with Python. Every revision carries its predecessor's text digest. Exports preserve version text, labels, explanations and acknowledgement history. Verification validates bounds, hash links, version order, deterministic epochs, action labels and acknowledgement version/digest bindings. It is not a signature or a Merkle proof of chain state. File verification never installs external content into the current state. All user text is rendered through textContent, never innerHTML.
