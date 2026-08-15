import assert from "node:assert/strict";
import test from "node:test";
import { REDACTED, sanitizeEvent, sanitizeUrl } from "../src/sanitize.js";
import type { CaptureEvent } from "../src/types.js";

test("sanitizes password input before export", () => {
  const event: CaptureEvent = { id: "1", at: "2026-08-15T00:00:00.000Z", type: "interaction", kind: "input", fieldName: "password", selector: "#password", value: "very-secret", url: "https://example.test" };
  const sanitized = sanitizeEvent(event);
  assert.equal(sanitized.type, "interaction");
  assert.equal(sanitized.value, REDACTED);
  assert.doesNotMatch(JSON.stringify(sanitized), /very-secret/);
});

test("masks secret query values and header values", () => {
  const event: CaptureEvent = { id: "2", at: "2026-08-15T00:00:00.000Z", type: "network-failure", method: "POST", status: 500, url: "https://example.test/a?token=private&safe=yes", requestHeaders: { Authorization: "Bearer private", "x-trace": "safe" } };
  const sanitized = sanitizeEvent(event);
  assert.equal(sanitized.type, "network-failure");
  assert.equal(sanitized.requestHeaders?.Authorization, REDACTED);
  assert.match(sanitized.url, /token=%5BREDACTED%5D/);
  assert.doesNotMatch(JSON.stringify(sanitized), /private/);
  assert.equal(sanitizeUrl("/x?secret=abc"), "/x?secret=[REDACTED]");
});
