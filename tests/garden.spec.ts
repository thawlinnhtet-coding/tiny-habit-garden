import { test, expect } from "@playwright/test";

test("plant, inspect, edit, persist, and intentionally remove a habit", async ({ page }) => {
  await page.goto("/garden");
  await page.getByRole("link", { name: "Plant a habit", exact: true }).click();
  await page.getByLabel("What's your tiny habit?").fill("Study 30 minutes");
  await page.getByRole("radio", { name: "Mushroom" }).check();
  await page.getByRole("button", { name: "Plant my habit" }).click();
  await page.getByRole("button", { name: "Study 30 minutes, Mushroom, Seed", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText("0 total completions");
  await page.getByRole("link", { name: "Edit habit" }).click();
  await page.getByLabel("What's your tiny habit?").fill("Read 10 pages");
  await page.getByRole("button", { name: "Save changes" }).click();
  await page.waitForURL("**/garden");
  await page.reload();
  await page.getByRole("button", { name: "Read 10 pages, Mushroom, Seed", exact: true }).click();
  await page.getByRole("button", { name: "Remove", exact: true }).click();
  await page.getByRole("button", { name: "Keep my plant" }).click();
  await expect(page.getByRole("dialog")).toContainText("Read 10 pages");
  await page.getByRole("button", { name: "Remove", exact: true }).click();
  await page.getByRole("button", { name: "Remove habit", exact: true }).click();
  await expect(page.getByRole("button", { name: "Read 10 pages, Mushroom, Seed", exact: true })).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
