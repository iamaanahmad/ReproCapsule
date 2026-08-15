import { createHash, randomUUID } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { generatePlaywright } from "./generator.js";
import { sanitizeEvents } from "./sanitize.js";
import { FORMAT_VERSION, type CapsuleManifest, type CapsuleSummary, type CaptureEvent, type VerificationResult } from "./types.js";

const artifactNames = ["events.json", "replay.spec.ts", "report.html"] as const;
const hash = (content: string) => createHash("sha256").update(content).digest("hex");
const stringify = (value: unknown) => `${JSON.stringify(value, null, 2)}\n`;

function assertEvent(value: unknown, index: number): asserts value is CaptureEvent {
  if (!value || typeof value !== "object") throw new Error(`Event ${index} must be an object.`);
  const event = value as Partial<CaptureEvent>;
  if (!event.id || !event.at || !event.url || !event.type) throw new Error(`Event ${index} is missing id, at, url, or type.`);
  if (!(["interaction", "console-error", "network-failure", "warning"] as string[]).includes(event.type)) throw new Error(`Event ${index} has unsupported type ${String(event.type)}.`);
  if (event.type === "interaction" && !event.kind) throw new Error(`Interaction ${index} is missing kind.`);
}

export function validateEvents(value: unknown): CaptureEvent[] {
  if (!Array.isArray(value)) throw new Error("Capture input must be a JSON array of events.");
  value.forEach(assertEvent);
  return value as CaptureEvent[];
}

function summaryFor(events: CaptureEvent[]): CapsuleSummary {
  return {
    interactions: events.filter((event) => event.type === "interaction").length,
    consoleErrors: events.filter((event) => event.type === "console-error").length,
    networkFailures: events.filter((event) => event.type === "network-failure").length,
    warnings: events.filter((event) => event.type === "warning").length,
  };
}

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character] ?? character);

function reportFor(events: CaptureEvent[], summary: CapsuleSummary): string {
  const rows = events.map((event) => `<article class="event ${event.type}"><time>${escapeHtml(event.at)}</time><strong>${escapeHtml(event.type)}</strong><pre>${escapeHtml(JSON.stringify(event, null, 2))}</pre></article>`).join("\n");
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>ReproCapsule report</title><style>body{font:16px system-ui;background:#0b1020;color:#e6edf7;max-width:960px;margin:auto;padding:2rem}header,.event{background:#151d33;border:1px solid #2d3a5e;border-radius:12px;padding:1rem;margin:.8rem 0}.signal{color:#ffb4ab}.network-failure,.console-error{border-color:#f87171}pre{white-space:pre-wrap;overflow-wrap:anywhere;color:#cbd5e1}time{color:#94a3b8;margin-right:1rem}</style></head><body><header><h1>ReproCapsule</h1><p>Local, sanitized, inspectable failure evidence.</p><p class="signal">${summary.consoleErrors + summary.networkFailures} reproduction signal(s): ${summary.consoleErrors} console error(s), ${summary.networkFailures} network failure(s).</p></header><main>${rows}</main></body></html>`;
}

export async function exportCapsule(raw: unknown, outputDirectory: string, capsuleId: string = randomUUID()): Promise<CapsuleManifest> {
  const events = sanitizeEvents(validateEvents(raw));
  const summary = summaryFor(events);
  const artifacts = {
    "events.json": stringify(events),
    "replay.spec.ts": generatePlaywright(events),
    "report.html": reportFor(events, summary),
  };
  await rm(outputDirectory, { recursive: true, force: true });
  await mkdir(outputDirectory, { recursive: true });
  await Promise.all(artifactNames.map((name) => writeFile(join(outputDirectory, name), artifacts[name], "utf8")));
  const manifest: CapsuleManifest = { formatVersion: FORMAT_VERSION, capsuleId, createdAt: new Date().toISOString(), eventCount: events.length, summary, files: Object.fromEntries(artifactNames.map((name) => [name, hash(artifacts[name])])) as CapsuleManifest["files"] };
  await writeFile(join(outputDirectory, "manifest.json"), stringify(manifest), "utf8");
  return manifest;
}

export async function verifyCapsule(directory: string): Promise<VerificationResult> {
  const errors: string[] = [];
  let manifest: CapsuleManifest | undefined;
  let events: CaptureEvent[] = [];
  try {
    manifest = JSON.parse(await readFile(join(directory, "manifest.json"), "utf8")) as CapsuleManifest;
    if (manifest.formatVersion !== FORMAT_VERSION) errors.push(`Unsupported format version ${String(manifest.formatVersion)}.`);
    for (const name of artifactNames) {
      const content = await readFile(join(directory, name), "utf8");
      if (hash(content) !== manifest.files?.[name]) errors.push(`Integrity mismatch: ${name}.`);
    }
    events = validateEvents(JSON.parse(await readFile(join(directory, "events.json"), "utf8")));
    if (events.length !== manifest.eventCount) errors.push("Manifest event count does not match events.json.");
  } catch (error) {
    errors.push(error instanceof Error ? error.message : "Unable to read capsule.");
  }
  const signals = events.filter((event) => event.type === "console-error" || event.type === "network-failure").map((event) => event.type === "console-error" ? `Console error: ${event.message}` : `Network failure: ${event.method} ${event.status} ${event.url}`);
  return { valid: errors.length === 0, capsuleId: manifest?.capsuleId, signals, errors };
}
