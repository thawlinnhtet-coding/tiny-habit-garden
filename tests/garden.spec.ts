import { test, expect } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";

test("water once, grow, and retain progress after reload", async ({ page }) => {
  test.setTimeout(60000);
  await page.goto("/habits/new");
  await page.getByLabel("What's your tiny habit?").fill("Read a page");
  await page.getByRole("button", { name: "Plant my habit" }).click();
  await page.waitForURL("**/garden");
  await page.getByRole("link", { name: /Today/ }).click();
  await page
    .getByRole("button", { name: "Complete Read a page", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Completed Read a page today" }),
  ).toBeDisabled();
  await expect(page.getByRole("status")).toContainText("1 Day Streak!");
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Completed Read a page today" }),
  ).toBeDisabled();
  await page.getByRole("link", { name: "My Garden", exact: true }).click();
  await page
    .getByRole("button", { name: "Read a page, Oak tree, Sprout" })
    .click();
  await expect(page.getByRole("dialog")).toContainText("1 total completions");
});

test("plant, inspect, edit, persist, and intentionally remove a habit", async ({
  page,
}) => {
  await page.goto("/garden");
  await page.getByRole("link", { name: "Plant a habit", exact: true }).click();
  await page.getByLabel("What's your tiny habit?").fill("Study 30 minutes");
  await page.getByRole("radio", { name: "Mushroom" }).check();
  await page.getByRole("button", { name: "Plant my habit" }).click();
  await page
    .getByRole("button", {
      name: "Study 30 minutes, Mushroom, Seed",
      exact: true,
    })
    .click();
  await expect(page.getByRole("dialog")).toContainText("0 total completions");
  await page.getByRole("link", { name: "Edit habit" }).click();
  await page.getByLabel("What's your tiny habit?").fill("Read 10 pages");
  await page.getByRole("button", { name: "Save changes" }).click();
  await page.waitForURL("**/garden");
  await page.reload();
  await page
    .getByRole("button", { name: "Read 10 pages, Mushroom, Seed", exact: true })
    .waitFor();
  if (process.env.THG_SCREENSHOT_DIR) {
    await mkdir(process.env.THG_SCREENSHOT_DIR, { recursive: true });
    await page.screenshot({
      path: join(
        process.env.THG_SCREENSHOT_DIR,
        `garden-${test.info().project.name}.png`,
      ),
      fullPage: true,
    });
  }
  await page
    .getByRole("button", { name: "Read 10 pages, Mushroom, Seed", exact: true })
    .click();
  await page.getByRole("button", { name: "Remove", exact: true }).click();
  await page.getByRole("button", { name: "Keep my plant" }).click();
  await expect(page.getByRole("dialog")).toContainText("Read 10 pages");
  await page.getByRole("button", { name: "Remove", exact: true }).click();
  await page.getByRole("button", { name: "Remove habit", exact: true }).click();
  await expect(
    page.getByRole("button", {
      name: "Read 10 pages, Mushroom, Seed",
      exact: true,
    }),
  ).toHaveCount(0);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});

test("keyboard planting works with reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/garden");
  await page
    .getByRole("link", { name: "Plant a habit", exact: true })
    .press("Enter");
  await page.getByLabel("What's your tiny habit?").fill("Take a quiet walk");
  await page.getByRole("button", { name: "Plant my habit" }).press("Enter");
  const plant = page.getByRole("button", {
    name: "Take a quiet walk, Oak tree, Seed",
    exact: true,
  });
  await plant.press("Enter");
  await expect(page.getByRole("dialog")).toContainText("Take a quiet walk");
  await page.getByRole("button", { name: "Close", exact: true }).press("Enter");
  expect(
    await page
      .locator(".plant-sprite")
      .evaluate((element) => getComputedStyle(element).animationName),
  ).toBe("none");
  expect(
    await page
      .locator(".garden-plot")
      .first()
      .evaluate((element) => getComputedStyle(element).imageRendering),
  ).toBe("pixelated");
});
