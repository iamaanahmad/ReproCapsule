import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { exportCapsule, verifyCapsule } from "./capsule.js";
import { sampleCapture } from "./sample.js";

const [command, ...args] = process.argv.slice(2);
const printHelp = () => console.log(`ReproCapsule\n\nCommands:\n  sample [output]       export the bundled checkout failure capture\n  export <raw.json> <output>  sanitize and create a capsule directory\n  verify <capsule>      validate capsule hashes and recorded failure signals\n\nGenerated replay.spec.ts is Playwright source. To execute it, install @playwright/test and browsers in your target project.`);

async function main(): Promise<void> {
  if (!command || command === "help" || command === "--help") return printHelp();
  if (command === "sample") {
    const output = resolve(args[0] ?? "artifacts/checkout-failure.capsule");
    const manifest = await exportCapsule(sampleCapture, output, "checkout-failure-demo");
    console.log(`Created ${output}\nCapsule: ${manifest.capsuleId}\nEvents: ${manifest.eventCount}`);
    return;
  }
  if (command === "export") {
    if (args.length !== 2) throw new Error("Usage: export <raw.json> <output>");
    const raw = JSON.parse(await readFile(resolve(args[0]), "utf8")) as unknown;
    const manifest = await exportCapsule(raw, resolve(args[1]));
    console.log(`Created ${resolve(args[1])}\nCapsule: ${manifest.capsuleId}\nEvents: ${manifest.eventCount}`);
    return;
  }
  if (command === "verify") {
    if (args.length !== 1) throw new Error("Usage: verify <capsule>");
    const result = await verifyCapsule(resolve(args[0]));
    console.log(`${result.valid ? "VALID" : "INVALID"} capsule${result.capsuleId ? ` ${result.capsuleId}` : ""}`);
    for (const signal of result.signals) console.log(`SIGNAL ${signal}`);
    for (const error of result.errors) console.error(`ERROR ${error}`);
    process.exitCode = result.valid ? 0 : 1;
    return;
  }
  throw new Error(`Unknown command: ${command}`);
}

main().catch((error: unknown) => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; });
