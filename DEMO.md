# ReproCapsule demo operator sheet

## Before recording

```powershell
npm ci
npx playwright install chromium
npm run check
npm run demo
```

Open `http://127.0.0.1:4173`. Keep a terminal ready for the CLI commands and `artifacts/` open in Explorer for the report reveal.

## Demo sequence

1. State the problem: a screenshot cannot show how a browser failure occurred, whether secrets were protected, or how reliable a replay selector is.
2. Enter `ada@example.test` and any password, then click **Reproduce checkout failure**.
3. Point out the real local 500, console error, and preview values:
   - password, token-like URL value, authorization, and API key are `[REDACTED]` before download;
   - `#checkout` has `high` selector confidence because it is a stable demo selector;
   - confidence is a review signal, not an automatic guarantee.
4. Download the file, then use **Inspect another capture locally** to reopen it. Explain it never leaves the browser; unknown fields, bodies, and cookies are rejected.
5. Run:

   ```powershell
   node dist/src/cli.js export C:\Users\iamas\Downloads\repro-capture.json artifacts\browser-failure.capsule
   node dist/src/cli.js verify artifacts\browser-failure.capsule
   ```

6. Open `artifacts/browser-failure.capsule/report.html`. Show both failure signals and selector-confidence labels.
7. Open `replay.spec.ts`. Say: “This is generated Playwright source with review confidence. It becomes runnable after the target project provides a browser, test fixtures, and the target URL. I am not representing it as a replay performed in this demo.”
8. Open `.kiro/specs/repro-capsule/requirements.md`, `.kiro/steering/privacy.md`, and `.kiro/hooks/`. Mention that `npm run test:browser` launches local Chromium and verifies the capture/import privacy workflow.

## Recovery plan

```powershell
npm run sample
npm run verify:sample
```

This creates a deterministic sanitized format-v2 sample with a 500 network signal, console-error signal, and selector-confidence evidence.
