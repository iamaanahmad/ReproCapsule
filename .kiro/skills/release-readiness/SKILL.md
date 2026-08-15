---
name: release-readiness
description: Validate a ReproCapsule build, its tests, sample export, integrity verification, and judge-facing setup before submission.
---

1. Run `npm run check`.
2. Create a fresh sample capsule with `npm run sample`.
3. Verify it with `npm run verify:sample`.
4. Confirm README commands, expected output, setup requirements, privacy claims, and demo script match the actual behavior.
5. Do not claim browser replay ran unless the documented Playwright command completed.
