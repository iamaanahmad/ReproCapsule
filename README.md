# ReproCapsule

**The bug report that proves itself.** ReproCapsule turns a captured browser failure into a local, privacy-safe directory that another developer can inspect, integrity-check, and convert into Playwright test source.

> A screenshot tells you a failure happened. A ReproCapsule retains the sanitized interaction timeline and failure evidence needed to reproduce it.

## What ships

- **A local browser demo** with a genuine HTTP 500 response and console error.
- **Capture-time sanitization** for password-like input fields, token-like URL query values, and sensitive request headers.
- **A portable capsule directory** containing `manifest.json`, `events.json`, `report.html`, and `replay.spec.ts`.
- **SHA-256 integrity verification** to detect changed capsule contents.
- **Deterministic Playwright test generation** from supported capture events.
- **Offline automated tests** for privacy, deterministic generation, validation, and tamper detection.

ReproCapsule has no backend, accounts, telemetry, database, or runtime third-party dependencies. Captures remain local.

## Quick start

**Requirement:** Node.js 24 or later.

```powershell
npm ci
npm run check
npm run sample
npm run verify:sample
```

Expected verification output includes:

```text
VALID capsule checkout-failure-demo
SIGNAL Network failure: POST 500 ...
SIGNAL Console error: Checkout failed: inventory service is unavailable
```

Open the generated `artifacts/checkout-failure.capsule/report.html` in a browser to inspect the self-contained report.

## Browser demo

Start the local demo server:

```powershell
npm run demo
```

Open [http://localhost:4173](http://localhost:4173), enter any email/password, then click **Reproduce checkout failure**. The target triggers a real local `POST /api/checkout` response with status 500 and writes a console error. The UI displays the exact sanitized events that can be downloaded.

Export that JSON into a capsule and verify it:

```powershell
node dist/src/cli.js export .\Downloads\repro-capture.json artifacts\browser-failure.capsule
node dist/src/cli.js verify artifacts\browser-failure.capsule
```

The demo deliberately exports only the sanitized event list. It does not store request bodies, response bodies, cookies, or telemetry.

## CLI

Run `npm run build` first, then:

```text
node dist/src/cli.js sample [output-directory]
node dist/src/cli.js export <sanitized-or-raw-events.json> <output-directory>
node dist/src/cli.js verify <capsule-directory>
```

`export` runs the sanitizer again, so a raw input file cannot bypass the Node export boundary. `verify` validates capsule structure and SHA-256 hashes, then reports recorded failure signals. It does **not** start a browser.

## Playwright replay source

Every exported capsule contains a deterministic `replay.spec.ts` file. It is actual source targeting `@playwright/test`, but this repository intentionally does not bundle a browser binary or claim to execute browser replay.

To run the generated test in a target project that has the appropriate URL and test fixtures:

```powershell
npm install --save-dev --save-exact @playwright/test
npx playwright install chromium
npx playwright test .\path\to\replay.spec.ts
```

Sensitive input is emitted as a comment, never as a value. Replace the comment with a safe fixture in the target project.

## Capsule format

```text
checkout-failure.capsule/
├── manifest.json       # Format version, event count, summary, SHA-256 hashes
├── events.json         # Ordered sanitized capture events
├── replay.spec.ts      # Generated Playwright test source
└── report.html         # Offline visual timeline
```

The manifest format is versioned (`formatVersion: 1`). Verification fails if any protected capsule artifact changes.

## Privacy model

The sanitizer is applied before event serialization, report rendering, and replay generation. It masks:

- Input events from password-, secret-, token-, or API-key-like fields/selectors
- Query values whose keys indicate a password, secret, token, or API key
- `authorization`, `cookie`, token-like, and API-key-like request headers

This MVP intentionally does **not** capture request bodies, response bodies, cookies, video, or telemetry. As with any diagnostic tool, review the sanitized output before sharing it externally.

## Development and validation

```powershell
npm run build             # Strict TypeScript compilation
npm test                  # Five offline requirement-focused tests
npm run check             # Build plus tests
npm run sample            # Fresh bundled capsule export
npm run verify:sample     # Integrity and signal verification
```

Tests cover redaction of adversarial secret values, secret-like URLs and headers, portable export, tamper detection, and deterministic Playwright source generation.

## Meaningful Kiro usage

ReproCapsule was developed with an inspectable requirements-to-verification workflow in [`.kiro/`](.kiro/):

- [`specs/repro-capsule/requirements.md`](.kiro/specs/repro-capsule/requirements.md) defines EARS-style privacy, integrity, and reproducibility acceptance criteria.
- [`specs/repro-capsule/design.md`](.kiro/specs/repro-capsule/design.md) records the format, trust boundaries, and test strategy.
- [`specs/repro-capsule/tasks.md`](.kiro/specs/repro-capsule/tasks.md) tracks implementation progress.
- [`steering/`](.kiro/steering/) preserves product, privacy, and test conventions.
- [`hooks/`](.kiro/hooks/) validates implementation work after source saves and spec tasks.
- [`agents/capsule-engineer.md`](.kiro/agents/capsule-engineer.md) scopes an engineering agent around local privacy and deterministic artifacts.
- [`skills/release-readiness/`](.kiro/skills/release-readiness/) packages the submission verification workflow.

## Three-minute demo script

1. **Problem (0:00–0:15):** A screenshot cannot prove how a bug happened; ReproCapsule produces a portable, inspectable failure artifact.
2. **Capture (0:15–0:55):** Run the local demo, enter an email and password, and click checkout. Show the real 500 and console error.
3. **Privacy (0:55–1:20):** Show the live preview: password, query token, API key, and authorization header are `[REDACTED]` before the downloaded file exists.
4. **Export and verify (1:20–2:00):** Export JSON and run `export` then `verify`. Open `report.html` and show the evidence timeline.
5. **Replay support (2:00–2:20):** Open the generated `replay.spec.ts`; clearly state it is executable Playwright source after target-project setup, not a replay demonstrated in this video.
6. **Kiro workflow (2:20–3:00):** Show one requirement, its design/testing choice, a completed task, and the `.kiro` hooks/steering that enforce the workflow.

## Submission checklist

- [ ] Make the repository public before submitting.
- [ ] Keep the full `.kiro` directory committed at the repository root.
- [ ] Run `npm ci`, `npm run check`, `npm run sample`, and `npm run verify:sample` from a clean checkout.
- [ ] Record an accessible video no longer than three minutes using the script above.
- [ ] Include repository and video links in the official submission form before **August 23, 2026 at 23:59 UTC**.
- [ ] Verify no `artifacts/`, `node_modules/`, credentials, or other private data are committed.

## License

No license has been selected yet. Add an appropriate license before public release if you want to grant reuse permissions.
