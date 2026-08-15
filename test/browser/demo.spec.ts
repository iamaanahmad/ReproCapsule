import { expect, test } from "@playwright/test";

const password = "browser-adversarial-password";
const importedSecret = "imported-raw-secret";

test("captures, redacts, and presents a real local checkout failure", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Email").fill("ada@example.test");
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Reproduce checkout failure" }).click();
  await expect(page.locator("#outcome")).toContainText("Checkout failed as designed");
  const evidence = JSON.parse(await page.locator("#preview").textContent() ?? "[]") as Array<Record<string, unknown>>;
  expect(evidence.some((event) => event.type === "network-failure" && event.status === 500)).toBeTruthy();
  expect(evidence.some((event) => event.type === "console-error" && String(event.message).includes("inventory service"))).toBeTruthy();
  expect(evidence.some((event) => event.selector === "#checkout" && event.selectorConfidence === "high")).toBeTruthy();
  expect(evidence.some((event) => event.selector === "#download" || event.selector === "#import-file")).toBeFalsy();
  const serialized = JSON.stringify(evidence);
  expect(serialized).toContain("[REDACTED]");
  expect(serialized).not.toContain(password);
  expect(serialized).not.toContain("browser-demo-key");
  expect(serialized).not.toContain("never-export-this");
});

test("imports only sanitized, allowlisted local evidence", async ({ page }) => {
  await page.goto("/");
  const unsafeCapture = [{ id: "unsafe-1", at: "2026-08-15T00:00:00.000Z", type: "interaction", kind: "input", selector: '[data-token="imported-raw-secret"]', fieldName: "password", value: importedSecret, url: "http://local.test/?token=imported-raw-secret", requestBody: "must-be-rejected" }];
  await page.locator("#import-file").setInputFiles({ name: "unsafe.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(unsafeCapture)) });
  await expect(page.locator("#import-status")).toContainText("not accepted");
  await expect(page.locator("#import-preview")).not.toContainText(importedSecret);
  const safeCapture = [{ id: "safe-1", at: "2026-08-15T00:00:00.000Z", type: "interaction", kind: "input", selector: "#password", selectorConfidence: "high", fieldName: "password", value: importedSecret, url: "http://local.test/?token=imported-raw-secret" }];
  await page.locator("#import-file").setInputFiles({ name: "safe.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(safeCapture)) });
  await expect(page.locator("#import-status")).toContainText("Imported 1 sanitized event");
  const preview = await page.locator("#import-preview").textContent() ?? "";
  expect(preview).toContain("[REDACTED]");
  expect(preview).not.toContain(importedSecret);
  expect(preview).not.toContain("data-token");
});
