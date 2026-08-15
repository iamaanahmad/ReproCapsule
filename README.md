# ReproCapsule

<p align="center">
  <strong>The bug report that proves itself.</strong><br>
  Turn a browser failure into local, privacy-safe, inspectable reproduction evidence.
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-22c55e?style=flat-square" alt="MIT License"></a>
  <img src="https://img.shields.io/badge/node-24%2B-339933?style=flat-square&logo=nodedotjs&logoColor=white" alt="Node 24 or later">
  <img src="https://img.shields.io/badge/browser_tests-Playwright-2EAD33?style=flat-square&logo=playwright&logoColor=white" alt="Playwright browser tests">
  <img src="https://img.shields.io/badge/privacy-local--first-2563eb?style=flat-square" alt="Local-first privacy">
  <img src="https://img.shields.io/badge/built_with-Kiro-7c3aed?style=flat-square" alt="Built with Kiro">
</p>

> A screenshot proves a failure happened. A ReproCapsule preserves the sanitized interaction evidence needed to understand and reproduce it.

## Why it matters

“Cannot reproduce” is one of the most expensive phrases in software delivery. Bug reports frequently omit the exact interaction sequence, browser evidence, and failure signals developers need—while raw session recordings can expose passwords, tokens, and sensitive data.

ReproCapsule closes that gap. It captures a local browser failure, sanitizes evidence before it is previewed or exported, packages it into a verifiable capsule, and generates transparent Playwright source for review.

## What it does

- **Captures actionable local evidence** — interaction timeline, real HTTP failures, and console errors.
- **Redacts before persistence** — password-like input, token/API-key-like URL values, and sensitive request headers become `[REDACTED]` before preview, download, report generation, or replay generation.
- **Imports safely** — a local JSON inspector reads files only in the browser tab, rejects unknown fields, bodies, and cookies, then renders only sanitized allowlisted evidence.
- **Exports portable capsules** — each format-v2 capsule includes sanitized events, an integrity manifest, an offline HTML report, and deterministic Playwright source.
- **Shows replay confidence** — selector-backed steps carry `high`, `medium`, `low`, or `unknown` confidence. Confidence is evidence for human review, never a replay guarantee.
- **Detects tampering** — SHA-256 verification catches modified artifacts and names captured failure signals.

ReproCapsule is deliberately local-first: no backend, account, telemetry, database, cloud upload, cookie capture, or request/response-body capture.

## Quick start

**Prerequisite:** Node.js 24 or later. Install Chromium once for the real browser suite.

```powershell
npm ci
npx playwright install chromium
npm run check
npm run sample
npm run verify:sample
```

Expected verification includes:

```text
VALID capsule checkout-failure-demo
SIGNAL Network failure: POST 500 ...
SIGNAL Console error: Checkout failed: inventory service is unavailable
```

## Try the demo

```powershell
npm run demo
```

Open [http://127.0.0.1:4173](http://127.0.0.1:4173), enter any email and password, and select **Reproduce checkout failure**. The app creates a genuine local `POST /api/checkout` failure with status 500 and a console error.

The visible evidence is already sanitized. Download it, then create and verify a capsule:

```powershell
node dist/src/cli.js export "$env:USERPROFILE\Downloads\repro-capture.json" artifacts\browser-failure.capsule
node dist/src/cli.js verify artifacts\browser-failure.capsule
```

Open `artifacts/browser-failure.capsule/report.html` to inspect the offline report.

## Capsule contract

```text
checkout-failure.capsule/
├── manifest.json       # formatVersion 2, summary, SHA-256 hashes
├── events.json         # ordered, sanitized, allowlisted events
├── replay.spec.ts      # deterministic Playwright source + confidence comments
└── report.html         # standalone evidence timeline + confidence labels
```

`verify` checks the artifact hashes, manifest format, event count, and recorded failure signals. It does **not** claim to start a browser.

## Generated replay: what is—and is not—proved

`replay.spec.ts` is actual `@playwright/test` source. It preserves supported interactions in order, omits sensitive values, and emits selector-confidence comments. Use safe fixtures and review each selector before running it against a target application:

```powershell
npm install --save-dev --save-exact @playwright/test
npx playwright install chromium
npx playwright test .\path\to\replay.spec.ts
```

This repository runs real Chromium tests for its own **local capture and import workflow**. It does not misrepresent generated replay source as a replay already performed against an arbitrary website.

## Privacy boundary

The same shared validation and sanitization code protects browser import and Node export paths.

| Data | Handling |
|---|---|
| Password/secret/token/API-key-like input | Redacted before preview/export |
| Secret-like URL query values | Redacted before preview/export |
| Authorization/cookie/token/API-key-like headers | Value redacted before preview/export |
| Selectors embedding sensitive attribute values | Removed |
| Unknown fields, bodies, response bodies, cookies | Rejected |
| Uploads, telemetry, persistence | Not implemented |

Inspect any capsule before sharing it externally.

## Development and quality gates

```powershell
npm run build           # strict TypeScript compilation
npm run test:unit       # deterministic privacy, format, integrity tests
npm run test:browser    # real Chromium capture/import workflow tests
npm test                # unit + browser suites
npm run check           # full project quality gate
npm run sample          # fresh deterministic sample capsule
npm run verify:sample   # integrity and evidence verification
```

The current suite contains six Node tests and two Chromium tests. Browser tests contact only `127.0.0.1` and verify visible redaction, local HTTP 500 evidence, selector confidence, forbidden import rejection, and safe imported evidence.

## Built with Kiro

ReproCapsule was created with a committed, inspectable specification-driven workflow in [`.kiro/`](.kiro/):

- [`requirements.md`](.kiro/specs/repro-capsule/requirements.md) defines privacy, integrity, browser, and replay acceptance criteria.
- [`design.md`](.kiro/specs/repro-capsule/design.md) explains format v2, trust boundaries, and test architecture.
- [`tasks.md`](.kiro/specs/repro-capsule/tasks.md) provides completed requirement-to-implementation traceability.
- [`steering/`](.kiro/steering/), [`hooks/`](.kiro/hooks/), [`agents/`](.kiro/agents/), and [`skills/`](.kiro/skills/) preserve project context and automated validation practices.

## Limits and roadmap

This MVP intentionally does not record video, capture request/response bodies, diagnose root cause, upload data, or fix code. Future work could add configurable redaction rules, support more interaction types, compare capsules across runs, and offer an opt-in issue tracker export.

## License

Released under the [MIT License](LICENSE).
