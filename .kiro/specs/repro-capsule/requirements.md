# ReproCapsule requirements

## Purpose
ReproCapsule converts a browser failure capture into a portable, inspectable capsule that another developer can validate and convert into Playwright reproduction source without sending the capture to a server.

## Acceptance criteria

### Capture and privacy
1. WHEN a capture contains a password-like input THEN its persisted value MUST be `[REDACTED]`, never the original value.
2. WHEN a URL query or request header is secret-like THEN its persisted value MUST be redacted before preview, export, report, or code generation.
3. WHEN imported JSON contains an unknown field, request/response body, or cookie THEN the browser and CLI MUST reject it rather than preserving it.
4. WHEN a capture includes ordinary interactions, console errors, or failed requests THEN the sanitized evidence MUST remain inspectable.
5. WHEN a safe local JSON event export is imported THEN it MUST be sanitized and rendered in the current browser without upload or persistence.

### Portable capsule
6. WHEN valid events are exported THEN ReproCapsule MUST create a format-v2 `manifest.json`, `events.json`, `replay.spec.ts`, and `report.html`.
7. WHEN a protected event artifact changes after export THEN verification MUST fail with a file-integrity error.
8. WHEN malformed or unsupported input is supplied THEN export/import MUST fail with an actionable validation error.

### Reproduction support
9. WHEN supported interactions are exported THEN generated Playwright source MUST retain their order and be deterministic for identical normalized input.
10. WHEN an interaction has a selector THEN report and generated source MUST expose its captured confidence or state that it is unknown.
11. WHEN a capsule contains a console error or failed request THEN verification MUST name the detected reproduction signal.
12. WHEN an unsupported event is captured THEN it MUST appear as a warning rather than silently disappearing.

## Non-goals for the MVP
- No cloud upload, login, background telemetry, video capture, automatic root-cause analysis, or code fixing.
- Generated Playwright source is executable after target-project setup; ReproCapsule does not claim that it replayed an arbitrary target unless that command runs.
