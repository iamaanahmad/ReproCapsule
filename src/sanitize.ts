import type { CaptureEvent, InteractionEvent, NetworkFailureEvent } from "./types.js";

export const REDACTED = "[REDACTED]";
const sensitiveName = /(pass(word)?|secret|token|api[-_]?key|authorization|cookie)/i;

export function sanitizeUrl(value: string): string {
  try {
    const url = new URL(value);
    for (const key of [...url.searchParams.keys()]) {
      if (sensitiveName.test(key)) url.searchParams.set(key, REDACTED);
    }
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
  return Boolean(event.fieldName && sensitiveName.test(event.fieldName)) || Boolean(event.selector && /password|secret|token/i.test(event.selector));
}

export function sanitizeEvent(event: CaptureEvent): CaptureEvent {
  const base = { ...event, url: sanitizeUrl(event.url) };
  if (base.type === "interaction" && isSensitiveInteraction(base)) return { ...base, value: REDACTED };
  if (base.type === "network-failure") return { ...base, requestHeaders: sanitizeHeaders((base as NetworkFailureEvent).requestHeaders) };
  return base;
}

export function sanitizeEvents(events: CaptureEvent[]): CaptureEvent[] {
  return events.map(sanitizeEvent);
}
