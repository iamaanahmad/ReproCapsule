# ReproCapsule demo operator sheet

## Before recording

```powershell
npm ci
npm run check
npm run demo
```

Open `http://localhost:4173`. Use a terminal window ready to run the two CLI commands below. Keep `artifacts/` open in Explorer for the report reveal.

## Demo sequence

1. State the problem: a screenshot cannot show how a browser failure occurred or whether it is reproducible.
2. Enter `ada@example.test` and any password, then click **Reproduce checkout failure**.
3. Point out the local 500 outcome, then the preview values:
   - the password is `[REDACTED]`;
   - the token-like URL value is `[REDACTED]`;
   - request authorization and API-key values are `[REDACTED]`.
4. Download the file and run:

   ```powershell
   node dist/src/cli.js export .\Downloads\repro-capture.json artifacts\browser-failure.capsule
   node dist/src/cli.js verify artifacts\browser-failure.capsule
   ```

5. Open `artifacts/browser-failure.capsule/report.html`. Show the timeline and both evidence signals.
6. Open `replay.spec.ts`. Say: “This is generated Playwright source. It becomes runnable after the target project provides Playwright, the browser binary, and safe test fixtures. I am not representing it as a replay performed in this demo.”
7. Open `.kiro/specs/repro-capsule/requirements.md`, `.kiro/steering/privacy.md`, and `.kiro/hooks/` to demonstrate the requirements-to-verification workflow.

## Recovery plan

If the browser download location differs, use the bundled stable input instead:

```powershell
npm run sample
npm run verify:sample
```

This produces a known six-event sanitized capture with a 500 network signal and a console-error signal.
