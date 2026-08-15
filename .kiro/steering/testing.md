---
inclusion: fileMatch
fileMatchPattern: "**/*.test.ts"
---
# Testing steering

Test observable requirements instead of implementation details. Every sanitizer change needs adversarial secret values. Every format change needs validation and deterministic-generation coverage. Keep tests offline and reproducible with `npm test`.
