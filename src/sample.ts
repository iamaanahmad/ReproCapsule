import type { CaptureEvent } from "./types.js";

export const sampleCapture: CaptureEvent[] = [
  { id: "evt-001", at: "2026-08-15T10:00:00.000Z", type: "interaction", kind: "navigation", url: "http://localhost:4173/" },
  { id: "evt-002", at: "2026-08-15T10:00:02.000Z", type: "interaction", kind: "input", selector: "#email", fieldName: "email", value: "ada@example.test", url: "http://localhost:4173/" },
  { id: "evt-003", at: "2026-08-15T10:00:03.000Z", type: "interaction", kind: "input", selector: "#password", fieldName: "password", value: "correct-horse-battery-staple", url: "http://localhost:4173/?token=secret-token" },
  { id: "evt-004", at: "2026-08-15T10:00:04.000Z", type: "interaction", kind: "click", selector: "#checkout", url: "http://localhost:4173/" },
  { id: "evt-005", at: "2026-08-15T10:00:04.250Z", type: "network-failure", method: "POST", status: 500, url: "http://localhost:4173/api/checkout?api_key=demo-key", requestHeaders: { authorization: "Bearer private-token", "content-type": "application/json" } },
  { id: "evt-006", at: "2026-08-15T10:00:04.260Z", type: "console-error", message: "Checkout failed: inventory service is unavailable", url: "http://localhost:4173/" }
];
