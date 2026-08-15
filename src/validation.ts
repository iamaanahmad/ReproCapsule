import type { CaptureEvent, InteractionKind, SelectorConfidence } from "./types.js";

const eventTypes = new Set(["interaction", "console-error", "network-failure", "warning"]);
const interactionKinds = new Set<InteractionKind>(["click", "input", "submit", "navigation"]);
const confidences = new Set<SelectorConfidence>(["high", "medium", "low", "unknown"]);

const isRecord = (value: unknown): value is Record<string, unknown> => Boolean(value) && typeof value === "object" && !Array.isArray(value);
function assertString(value: unknown, label: string): asserts value is string { if (typeof value !== "string" || value.length === 0) throw new Error(`${label} must be a non-empty string.`); }
const assertAllowedKeys = (event: Record<string, unknown>, allowed: string[], index: number): void => {
  for (const key of Object.keys(event)) if (!allowed.includes(key)) throw new Error(`Event ${index} contains forbidden field ${key}.`);
};
const assertOptionalString = (value: unknown, label: string): void => { if (value !== undefined && typeof value !== "string") throw new Error(`${label} must be a string when supplied.`); };

function assertHeaders(value: unknown, index: number): void {
  if (value === undefined) return;
  if (!isRecord(value)) throw new Error(`Network failure ${index} requestHeaders must be an object.`);
  for (const [key, headerValue] of Object.entries(value)) {
    assertString(key, `Network failure ${index} header name`);
    assertString(headerValue, `Network failure ${index} header ${key}`);
  }
}

function assertEvent(value: unknown, index: number): asserts value is CaptureEvent {
  if (!isRecord(value)) throw new Error(`Event ${index} must be an object.`);
  assertString(value.id, `Event ${index} id`);
  assertString(value.at, `Event ${index} at`);
  assertString(value.url, `Event ${index} url`);
  assertString(value.type, `Event ${index} type`);
  if (!eventTypes.has(value.type)) throw new Error(`Event ${index} has unsupported type ${value.type}.`);
  if (value.type === "interaction") {
    assertAllowedKeys(value, ["id", "at", "url", "type", "kind", "selector", "selectorConfidence", "fieldName", "value"], index);
    assertString(value.kind, `Interaction ${index} kind`);
    if (!interactionKinds.has(value.kind as InteractionKind)) throw new Error(`Interaction ${index} has unsupported kind ${value.kind}.`);
    assertOptionalString(value.selector, `Interaction ${index} selector`);
    assertOptionalString(value.fieldName, `Interaction ${index} fieldName`);
    assertOptionalString(value.value, `Interaction ${index} value`);
    if (value.selectorConfidence !== undefined && (typeof value.selectorConfidence !== "string" || !confidences.has(value.selectorConfidence as SelectorConfidence))) throw new Error(`Interaction ${index} has unsupported selector confidence.`);
    return;
  }
  if (value.type === "console-error") { assertAllowedKeys(value, ["id", "at", "url", "type", "message"], index); assertString(value.message, `Console error ${index} message`); return; }
  if (value.type === "network-failure") {
    assertAllowedKeys(value, ["id", "at", "url", "type", "method", "status", "requestHeaders"], index);
    assertString(value.method, `Network failure ${index} method`);
    if (typeof value.status !== "number" || !Number.isInteger(value.status)) throw new Error(`Network failure ${index} status must be an integer.`);
    assertHeaders(value.requestHeaders, index);
    return;
  }
  assertAllowedKeys(value, ["id", "at", "url", "type", "message"], index);
  assertString(value.message, `Warning ${index} message`);
}

export function validateEvents(value: unknown): CaptureEvent[] {
  if (!Array.isArray(value)) throw new Error("Capture input must be a JSON array of events.");
  value.forEach(assertEvent);
  return value as CaptureEvent[];
}
