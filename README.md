# ReproCapsule

**The bug report that proves itself.** ReproCapsule turns a browser failure into a local, privacy-safe capsule another developer can inspect, integrity-check, and convert into Playwright test source.

> A screenshot tells you a failure happened. A ReproCapsule retains sanitized interaction evidence and makes the reproduction path reviewable.

## What ships

- **Local browser capture demo:** records form interactions, a genuine local HTTP 500, and a console error.
- **Capture-time privacy controls:** mask password-like inputs, secret-like query values, and sensitive request headers before preview or export.
- **Safe local import:** opens an event JSON file only in the browser, rejects unknown fields/bodies/cookies, sanitizes accepted events, and never uploads or persists the file.
- **Portable format v2 capsule:** `manifest.json`, sanitized `events.json`, self-contained `report.html`, and deterministic `replay.spec.ts`.
- **Replay transparency:** every selector-backed generated step and report event shows captured selector confidence; it remains a review cue, not a guarantee.
- **Integrity verification:** SHA-256 hashes detect changed capsule artifacts.
- **Real browser coverage:** Chromium tests exercise the visible capture/redaction and hostile/safe import workflows against the local server.

ReproCapsule has no backend, accounts, telemetry, database, runtime third-party dependencies, request/response-body capture, or cookie capture. Captures stay local.

## Quick start

**Requirement:** Node.js 24 or later. The browser suite additionally needs a local Chromium install once per machine.

```powershell
npm ci
npx playwright install chromium
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

Open `artifacts/checkout-failure.capsule/report.html` to inspect a self-contained report with the sanitized timeline and selector-confidence labels.

## Browser demo

```powershell
npm run demo
```

Open [http://127.0.0.1:4173](http://127.0.0.1:4173), enter any email/password, then select **Reproduce checkout failure**. The target performs a real local `POST /api/checkout` that returns 500 and creates a console error. The rendered evidence is already sanitized; stable demo selectors are shown as `high` confidence.

To inspect an existing event export, choose it under **Inspect another capture locally**. ReproCapsule reads it only in the current browser tab, rejects unknown fields—including bodies and cookies—then renders only the sanitized allowlisted evidence.

Export a downloaded capture into a capsule:

```powershell
node dist/src/cli.js export .\Downloads\repro-capture.json artifacts\browser-failure.capsule
node dist/src/cli.js verify artifacts\browser-failure.capsule
```

`verify` validates hashes and recorded failure signals; it does **not** start a browser.

## Generated replay source

Every capsule contains deterministic `replay.spec.ts` source targeting `@playwright/test`. Sensitive input remains a comment that requires a safe fixture. Selector-confidence comments explain why each generated locator requires review.

The repository’s own Chromium test suite proves its local **capture/import** workflow. It does not represent generated capsule replay as having run against an arbitrary target application. To run a generated spec in the appropriate target project:

```powershell
npm install --save-dev --save-exact @playwright/test
npx playwright install chromium
npx playwright test .\path\to\replay.spec.ts
```

## Capsule format

```text
checkout-failure.capsule/
├── manifest.json       # formatVersion 2, summary, SHA-256 hashes
├── events.json         # ordered sanitized and allowlisted event records
├── replay.spec.ts      # generated Playwright source plus review confidence
└── report.html         # offline evidence timeline with confidence labels
```

Verification fails when a protected artifact changes or the manifest format is unsupported.

## Privacy model

The same allowlist validation and sanitizer run in the browser import path and Node export path. They:

- redact password-, secret-, token-, and API-key-like input values;
- redact secret-like query values and sensitive request-header values;
- remove selector values that embed a sensitive attribute value;
- reject unknown fields, request bodies, response bodies, and cookies instead of preserving them.

As with any diagnostic artifact, inspect sanitized output before sharing it externally.

## Development and validation

```powershell
npm run build           # strict TypeScript compilation
npm run test:unit       # six deterministic unit tests
npm run test:browser    # two real local Chromium workflow tests
npm test                # both suites
npm run check           # build plus both suites
npm run sample          # fresh bundled capsule export
npm run verify:sample   # integrity and signal verification
```

The browser tests use only `127.0.0.1`; they verify the local 500 capture, visible secret redaction, selector-confidence evidence, rejection of forbidden import fields, and safe imported evidence rendering.

## Meaningful Kiro usage

The inspectable requirements-to-verification workflow lives in [`.kiro/`](.kiro/):

- [`specs/repro-capsule/requirements.md`](.kiro/specs/repro-capsule/requirements.md): privacy, integrity, replay, and browser-workflow acceptance criteria.
- [`specs/repro-capsule/design.md`](.kiro/specs/repro-capsule/design.md): format v2, trust boundaries, and local architecture.
- [`specs/repro-capsule/tasks.md`](.kiro/specs/repro-capsule/tasks.md): completed, traceable implementation work.
- [`steering/`](.kiro/steering/), [`hooks/`](.kiro/hooks/), [`agents/`](.kiro/agents/), and [`skills/`](.kiro/skills/): persistent conventions and automated quality workflow.

## Three-minute demo script

1. **0:00–0:15 — Problem:** screenshots do not provide replayable failure evidence.
2. **0:15–0:55 — Capture:** enter an email/password and reproduce the local 500; show console-error evidence.
3. **0:55–1:20 — Privacy:** show `[REDACTED]` values before download, then point out the stable selector’s `high` confidence.
4. **1:20–1:45 — Local import:** select the same JSON under the import section; explain that files are never uploaded and unknown fields/bodies/cookies are rejected.
5. **1:45–2:20 — Export and verify:** generate a capsule, run `verify`, and open `report.html` to show evidence and confidence labels.
6. **2:20–2:35 — Replay boundary:** show `replay.spec.ts`; say it is executable source after target-project setup, not a replay performed in this video.
7. **2:35–3:00 — Kiro:** trace requirement → design → completed task → browser test/hooks.


## License

No license has been selected yet. Add one before public release if you want to grant reuse permissions.
