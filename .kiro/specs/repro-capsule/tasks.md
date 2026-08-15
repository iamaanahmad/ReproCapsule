# Implementation Plan: ReproCapsule

## Overview
Implement ReproCapsule in dependency order: define and validate the safe data model, sanitize and capture local evidence, produce deterministic capsule and replay artifacts, verify artifact integrity, integrate local entry points, then cover the behavior with unit and browser tests.

## Task Dependency Graph
```json
{
  "waves": [
    { "wave": 1, "tasks": [1] },
    { "wave": 2, "tasks": [2, 3] },
    { "wave": 3, "tasks": [4, 6] },
    { "wave": 4, "tasks": [5] },
    { "wave": 5, "tasks": [7, 8, 10, 19] },
    { "wave": 6, "tasks": [9, 11] },
    { "wave": 7, "tasks": [12] },
    { "wave": 8, "tasks": [13, 14, 17, 18, 20] },
    { "wave": 9, "tasks": [15] },
    { "wave": 10, "tasks": [16] }
  ]
}
```

## Tasks

### Types and validation
- [x] 1. Define the format-v2 event, manifest, integrity-record, selector-confidence, and warning types, with strict schemas that reject unknown fields and prohibited bodies or cookies. (R3, R6, R8, R10, R12)
- [x] 2. Implement shared browser and CLI validation adapters that return actionable errors for malformed or unsupported import and export inputs. (R3, R8)

### Sanitization
- [x] 3. Implement capture-time sanitizers for password-like inputs, token-like URL query values, and sensitive request-header values before they can reach previews, exports, reports, or generated code. (R1, R2)
- [x] 4. Preserve inspectable safe interaction, console-error, and failed-request evidence while applying normalization and redaction. (R1, R2, R4)

### Browser capture and import
- [ ] 5. Implement browser capture normalization for supported interactions, console errors, and failed requests, including selector-confidence evidence and warnings for unsupported events. (R4, R10, R12)
- [x] 6. Implement local browser JSON import that validates, sanitizes, rejects unsafe payloads, and renders accepted events in the current session without upload or persistence. (R2, R3, R5, R8)

### Capsule and report export
- [x] 7. Implement deterministic format-v2 capsule export containing manifest.json, events.json, replay.spec.ts, and report.html from validated normalized events. (R6, R9)
- [x] 8. Implement report rendering that exposes sanitized evidence, selector confidence (or unknown state), and unsupported-event warnings. (R2, R4, R10, R12)
- [x] 9. Implement protected-artifact digests and manifest integrity records during capsule export. (R6, R7)

### Replay generation
- [x] 10. Implement deterministic Playwright source generation that preserves supported interaction order and includes selector-confidence evidence or an explicit unknown state. (R9, R10)
- [x] 11. Emit unsupported captured events as generated replay warnings rather than omitting them silently. (R12)

### Verification and CLI
- [x] 12. Implement capsule verification that validates schemas and integrity records, reports file-integrity failures, and names console-error or failed-request reproduction signals. (R7, R8, R11)
- [ ] 13. Implement CLI import, export, and verification commands using the shared safe validation and sanitization pipeline with actionable failures. (R2, R3, R5, R7, R8, R11)

### Server integration
- [ ] 14. Integrate the capture, import, capsule-export, replay-generation, and verification services into local server endpoints without transmitting or persisting captured data. (R2, R5, R6, R7, R8)
- [ ] 15. Ensure server responses and error paths expose only sanitized capture evidence and actionable validation results. (R1, R2, R3, R8)

### Unit tests
- [ ] 16. Add unit tests proving password, URL-query, and sensitive-header secrets cannot appear in previews, exports, reports, generated replay, CLI output, or server responses. (R1, R2)
- [ ] 17. Add unit tests for strict import validation, safe local rendering, deterministic export and replay output, selector confidence, and unsupported-event warnings. (R3, R5, R8, R9, R10, R12)
- [ ] 18. Add unit tests for capsule file lists, artifact-integrity tampering, and reproduction-signal reporting. (R6, R7, R11)

### Browser tests
- [ ] 19. Add browser integration tests for in-browser capture and local import, including safe event rendering and rejection of unknown fields, bodies, responses, and cookies. (R3, R4, R5, R8)
- [ ] 20. Add browser integration tests covering local capsule export, report redaction and selector-confidence display, generated replay ordering, tamper verification failure, reproduction signals, and unsupported-event warnings. (R1, R2, R6, R7, R9, R10, R11, R12)

## Notes
All tasks are local, coding-only work. The graph uses T1–T20 labels to make implementation prerequisites explicit while the task list remains in dependency order.
