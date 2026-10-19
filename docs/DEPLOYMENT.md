# Deployment gate — no transactions authorized in this release

1. Freeze canonical source and verify A/B SHA256, extracted ABI, pinned SDK and passing checks.
2. Run in the target fixed GenVM executor or supported Studio simulation. Separate mock outputs from actual model behavior. Test wording equivalence, each changed dimension, uncertain/missing inputs and injected instructions.
3. Only after separate authorization, deploy this exact source on Stable Studionet / 61999. Archive finalized receipt, returned address, explorer URL and deployed-source byte comparison.
4. Separately authorize the minimum real create/acknowledge/cosmetic revise/material revise/re-acknowledge sequence. Check each receipt and readback. Retain prior-version acknowledgements and prove non-resurrection after another cosmetic revision.
5. Configure the verified address in the app, run real wallet write E2E and test rejection/network/account changes and pending recovery. The app source digest gate must match; do not disable it to make a test pass.
6. Complete submission evidence only after finality and live readback checks. No budget from a different project applies.

Nothing here sends a transaction or requests a signature. These are future acceptance steps, not completed evidence.
