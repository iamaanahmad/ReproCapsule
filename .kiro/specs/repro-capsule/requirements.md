# ReproCapsule requirements

## Purpose
ReproCapsule converts a browser failure capture into a portable, inspectable capsule that another developer can validate and convert into a Playwright reproduction test without sending the capture to a server.

## Acceptance criteria

### Capture and privacy
1. WHEN a capture contains an input event from a password field THEN the persisted event MUST contain `[REDACTED]`, never the original value.
2. WHEN headers include `authorization`, `cookie`, `x-api-key`, or a name containing `token`, THEN their values MUST be redacted before capsule creation.
3. WHEN a URL query contains secret-like keys (`token`, `key`, `secret`, `password`) THEN those values MUST be redacted.
4. WHEN a capture includes ordinary interactions, console errors, or failed requests THEN those events MUST remain inspectable in the exported capsule.

### Portable capsule
5. WHEN valid raw events are exported THEN ReproCapsule MUST create a versioned `manifest.json`, `events.json`, `replay.spec.ts`, and `report.html` in a named capsule directory.
6. WHEN an event file is changed after export THEN verification MUST fail with a file-integrity error.
7. WHEN malformed input is supplied THEN export MUST fail with an actionable validation error.

### Reproduction support
8. WHEN supported interaction events are exported THEN the generated Playwright test MUST retain their order and produce deterministic source for identical normalized input.
9. WHEN a capsule contains a console error or failed request THEN verification MUST mark the reproduction signal as detected and name the evidence.
10. WHEN an unsupported event is captured THEN it MUST appear in the report as a warning rather than silently disappearing.

## Non-goals for the MVP
- No cloud upload, login, background telemetry, video capture, automatic root-cause analysis, or code fixing.
- Generated Playwright code is an executable artifact after the user installs Playwright; this MVP does not bundle a browser binary.
