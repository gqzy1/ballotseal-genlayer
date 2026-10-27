# Cross-version consent audit · 0.4

Open **Consent audit** in the navigation. The audit workspace reads any proposal in the canonical BallotSeal deployment and the acknowledgement history of any specified wallet, without connecting a wallet or sending a transaction.

## Trace an interval

1. Enter an owner-address::local-id proposal reference and a viewer address.
2. Choose **Read & verify chain history**. The reader verifies deployed source bytes, every text digest, parent link, epoch and viewer-bound acknowledgement. It brackets the read with proposal metadata and cross-checks the latest acknowledgement to reject changing snapshots.
3. Select increasing start and end versions. Inspect every intermediate transition, including all five labels, reasons and original excerpts.
4. Read the applicability table: EXACT is a confirmation of that exact version; CARRIED shares its epoch; EXPIRED crossed an epoch boundary; NO_ACK means no acknowledgement bound to that or an earlier version.

The table reconstructs applicability by the version to which an acknowledgement is bound. The contract stores no acknowledgement timestamps: this is not a chronological account of when a person clicked. Returning to identical text does not undo intermediate epoch breaks. No new non-adjacent AI classification is invented; the report composes the existing adjacent consensus records.

## Portable reports

**Export audit JSON** retains the complete source history, chosen interval, viewer, analysis and deterministic SHA256. **Open audit report** recomputes all analysis and validates input hashes. Imported reports are labelled unverified for chain provenance, even if a read timestamp is present.

**Re-verify report against chain** reads the canonical deployment again and compares exact historical records and viewer acknowledgements. Newer versions may be present; these are counted and available in the refreshed workspace. A changed record, missing confirmation, source mismatch or unavailable read cannot produce a verified result. Reports are limited to 2 MB.

**Explore archived chain example** uses existing V1–V4 records and the matching acknowledgement history from `evidence/studionet/`. It is clearly labelled archived, never silently substituted for a failed network read. This example demonstrates V1 → V2 CARRIED, expiry at V3, and a new exact V4 acknowledgement.

## Reproduce

```sh
npm ci
npm run check
npm run lint
npm test
npm run verify:source
npm run build
npm run format:check
node verification/verify-audit.mjs
```

The last command is read-only and requires access to Stable Studionet. It saves a fresh verification artifact only after source, history and expected example states pass.

The app release is 0.4; contract protocol remains `ballotseal-0.3`. No contract migration, fresh semantic consensus run, voting system or legal-consent guarantee is implied.
