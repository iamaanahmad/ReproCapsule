import assert from "node:assert/strict";
import test from "node:test";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { exportCapsule, verifyCapsule } from "../src/capsule.js";
import { generatePlaywright } from "../src/generator.js";
import { sampleCapture } from "../src/sample.js";
import { sanitizeEvents } from "../src/sanitize.js";

test("exports a privacy-safe capsule with verifiable failure signals", async () => {
  const directory = await mkdtemp(join(tmpdir(), "repro-capsule-"));
  await exportCapsule(sampleCapture, directory, "test-capsule");
  const output = await readFile(join(directory, "events.json"), "utf8");
  assert.doesNotMatch(output, /correct-horse-battery-staple|private-token|demo-key|secret-token/);
  const result = await verifyCapsule(directory);
  assert.equal(result.valid, true);
  assert.equal(result.signals.length, 2);
});

test("rejects a tampered artifact", async () => {
  const directory = await mkdtemp(join(tmpdir(), "repro-capsule-"));
  await exportCapsule(sampleCapture, directory);
  await writeFile(join(directory, "report.html"), "tampered", "utf8");
  const result = await verifyCapsule(directory);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.includes("report.html")));
});

test("generates deterministic replay source from normalized events", () => {
  const events = sanitizeEvents(sampleCapture);
  assert.equal(generatePlaywright(events), generatePlaywright(events));
  assert.match(generatePlaywright(events), /Skipped sensitive input/);
});
