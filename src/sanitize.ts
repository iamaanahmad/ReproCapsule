import type { CaptureEvent, InteractionEvent } from "./types.js";

export const REDACTED = "[REDACTED]";
const sensitiveName = /(pass(word)?|secret|token|api[-_]?key|authorization|cookie)/i;

export function sanitizeUrl(value: string): string {
  try {
    const url = new URL(value);
    for (const key of [...url.searchParams.keys()]) if (sensitiveName.test(key)) url.searchParams.set(key, REDACTED);
    return url.toString();
  } catch {
    return value.replace(/([?&](?:pass(?:word)?|secret|token|api[-_]?key)=)[^&#]*/gi, `$1${REDACTED}`);
  }
}

export function sanitizeHeaders(headers: Record<string, string> | undefined): Record<string, string> | undefined {
  if (!headers) return undefined;
  return Object.fromEntries(Object.entries(headers).map(([key, value]) => [key, sensitiveName.test(key) ? REDACTED : value]));
}

function isSensitiveInteraction(event: InteractionEvent): boolean {
  return Boolean(event.fieldName && sensitiveName.test(event.fieldName)) || Boolean(event.selector && sensitiveName.test(event.selector));
}

function sanitizeSelector(selector: string | undefined): string | undefined {
  if (!selector) return undefined;
  return /\[[^\]]*(pass(word)?|secret|token|api[-_]?key|authorization|cookie)[^\]]*=/i.test(selector) ? undefined : selector;
}

export function sanitizeEvent(event: CaptureEvent): CaptureEvent {
  const base = { id: event.id, at: event.at, url: sanitizeUrl(event.url) };
  if (event.type === "interaction") {
    const sensitive = isSensitiveInteraction(event);
    return { ...base, type: "interaction", kind: event.kind, selector: sanitizeSelector(event.selector), selectorConfidence: event.selector ? event.selectorConfidence ?? "unknown" : undefined, fieldName: sensitive ? undefined : event.fieldName, value: sensitive ? REDACTED : event.value };
  }
  if (event.type === "network-failure") return { ...base, type: "network-failure", method: event.method, status: event.status, requestHeaders: sanitizeHeaders(event.requestHeaders) };
  if (event.type === "console-error") return { ...base, type: "console-error", message: event.message };
  return { ...base, type: "warning", message: event.message };
}

export function sanitizeEvents(events: CaptureEvent[]): CaptureEvent[] {
  return events.map(sanitizeEvent);
}
