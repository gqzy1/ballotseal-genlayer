# Projects — submission draft (not yet ready to send)

**Project:** BallotSeal

**Tagline:** Keep every acknowledgement attached to the proposal terms it was given.

**Main category:** Governance

**Secondary:** Developer Tools

**Repository:** https://github.com/gqzy1/ballotseal-genlayer

**Intelligent Contract source:** https://github.com/gqzy1/ballot-seal-primitive

**Public app:** https://ballotseal-gqzy1.zsf197176.chatgpt.site/

**Description:** BallotSeal is a governance proposal version-control and context-bound acknowledgement tool. It seals exact proposal text with a SHA-256 fingerprint, compares revisions across budget, beneficiary, delivery scope, deadline and authority, and makes consent-epoch changes visible. The complete product includes a seven-scenario interactive walkthrough, custom local sealing, text diffs, five-dimension reasons, version/acknowledgement history, integrity verification and JSON export. The native GenLayer contract independently classifies semantic changes and applies deterministic epoch transitions. The frontend implements source-verified wallet integration and readback checks.

**Why GenLayer is central:** Byte changes cannot determine changes in natural-language obligations. The Intelligent Contract requires independently computed labels from leader/validators before advancing a revision. The product reads that persistent result rather than submitting a client-supplied verdict.

**Walkthrough for reviewers:**
1. Load “A cleaner sentence”; compare it and inspect CARRY, epoch 1 and V1 applicability.
2. Load “The budget doubles”; compare it and inspect RECONFIRM, epoch 2 and the historical V1 acknowledgement.
3. Acknowledge V2 locally; inspect the retained V1/V2 acknowledgement history and timeline.
4. Try the authority, deadline, beneficiary, scope and missing-agreement cases.
5. Create custom V1 text and revise it. Observe the honest UNASSESSED / REVIEW result instead of a fabricated model response.
6. Verify and export the record; use “Verify a file” to check the export. This checks internal consistency, not chain inclusion.

**Mandatory current disclosure:** This release is undeployed. The public app's authored examples are not real AI consensus or onchain evidence. Custom local revisions are always conservative review. Live wallet writes, real semantic consensus and fixed GenVM execution remain unverified. The implemented integration requires a separately deployed, source-verified contract. No contract address or transaction receipt can be supplied yet.

**Submission gate:** BLOCKED. The Projects criterion requiring actual GenLayer interaction is not satisfied by fixtures, SDK Direct Mode or a published static site. Do not send this draft as a completed onchain product. Complete docs/DEPLOYMENT.md under separate authorization, archive real evidence and update only verified factual fields. Portal was not submitted.
