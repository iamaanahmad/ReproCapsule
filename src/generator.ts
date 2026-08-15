import type { CaptureEvent, InteractionEvent } from "./types.js";
import { REDACTED } from "./sanitize.js";

const quote = (value: string) => JSON.stringify(value);

function replayInteraction(event: InteractionEvent): string[] {
  if (event.kind === "navigation") return [`  await page.goto(${quote(event.url)});`];
  if (!event.selector) return [`  // Skipped ${event.kind}: no stable selector was captured.`];
  const locator = `page.locator(${quote(event.selector)})`;
  if (event.kind === "click" || event.kind === "submit") return [`  await ${locator}.click();`];
  if (event.kind === "input") {
    if (!event.value || event.value === REDACTED) return [`  // Skipped sensitive input for ${event.selector}; provide a test fixture value.`];
    return [`  await ${locator}.fill(${quote(event.value)});`];
  }
  return [`  // Unsupported interaction kind: ${event.kind}`];
}

export function generatePlaywright(events: CaptureEvent[]): string {
  const lines = [
    'import { test, expect } from "@playwright/test";',
    "",
    'test("replays ReproCapsule capture", async ({ page }) => {',
    "  const consoleErrors: string[] = [];",
    "  page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });",
  ];
  for (const event of events) {
    if (event.type === "interaction") lines.push(...replayInteraction(event));
    if (event.type === "warning") lines.push(`  // Capture warning: ${event.message}`);
  }
  const evidence = events.find((event) => event.type === "console-error" || event.type === "network-failure");
  if (evidence?.type === "console-error") lines.push(`  await expect.poll(() => consoleErrors.join("\\n")).toContain(${quote(evidence.message)});`);
  if (evidence?.type === "network-failure") lines.push(`  // Expected captured failure: ${evidence.method} ${evidence.status} at ${evidence.url}`);
  lines.push("});", "");
  return lines.join("\n");
}
