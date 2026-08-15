# ReproCapsule design

## Architecture

```text
browser recorder / local JSON import
        ↓
 shared allowlist validation + sanitization (before preview/write)
        ↓
 capsule writer ─── events.json + manifest SHA-256
        ├────────── replay.spec.ts with selector-confidence comments
        └────────── report.html with confidence labels
                    ↓
       verifier checks format, hashes, and failure signals
```

All processing is local. Browser import reads a selected file in memory and has no upload endpoint. Node runtime uses only the standard library; Playwright is a pinned development dependency for the local Chromium workflow tests.

## Format v2
A capsule directory contains a manifest, ordered sanitized events, deterministic replay source, and offline report. Format v2 adds optional interaction `selectorConfidence` (`high`, `medium`, `low`, or `unknown`). Omitted confidence means unknown; it is never inferred as high.

## Privacy boundary
`validation.ts` allowlists every event field and rejects unknown fields, bodies, response bodies, and cookies. `sanitize.ts` reconstructs each accepted event from allowlisted fields, masks sensitive input/query/header values, and removes selectors with embedded sensitive attribute values. The same compiled modules serve the local browser import UI and the Node exporter.

## Replay boundary
`verify` validates artifact integrity and recorded evidence only. It never claims to launch a browser. Generated `replay.spec.ts` is executable `@playwright/test` source after target-project setup. Separately, this repository’s Chromium suite launches a local browser to prove the capture/import UI and redaction behavior.

## Test strategy
Unit tests cover redaction, allowlist rejection, format v2 report/replay generation, determinism, integrity, and tampering. Browser tests use only `127.0.0.1` and prove a live local 500 capture, visible secret absence, selector confidence, hostile import rejection, and safe import rendering. The CLI smoke flow exports and verifies the bundled sample.
