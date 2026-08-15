# ReproCapsule design

## Architecture

```text
browser recorder / raw JSON
        ↓
  normalize + sanitize (before write)
        ↓
 capsule writer ─── events.json + manifest SHA-256
        ├────────── replay.spec.ts
        └────────── report.html
                    ↓
       verifier checks schema, hashes, and failure signals
```

All processing is local. The TypeScript CLI uses Node's standard library only at runtime.

## Capsule format
A capsule is a directory named `<capture>.capsule` containing:

- `manifest.json`: `formatVersion`, export time, event count, summary, and SHA-256 hashes
- `events.json`: ordered, sanitized event records
- `replay.spec.ts`: deterministic Playwright test source
- `report.html`: self-contained visual timeline

## Event model
`interaction` events preserve URL, target selector, action and an optional safe value. `console-error`, `network-failure`, and `warning` events preserve diagnosis evidence. Every event has a stable ID and ISO timestamp.

## Boundary decisions
- Sanitization occurs before event serialization. Raw values are not passed to report or generator code.
- `verify` validates JSON structure, compares every manifest hash, and derives its result only from recorded failure evidence. It does not claim to launch a browser.
- `replay.spec.ts` imports `@playwright/test`; the command to execute it is documented, with the dependency and browser installation left explicit.

## Test strategy
Unit tests cover privacy redaction, URL/header masking, serialization integrity, deterministic code generation, and tamper detection. A CLI smoke workflow exports the included raw capture and verifies its resulting capsule.
