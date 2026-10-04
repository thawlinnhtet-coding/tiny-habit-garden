import { test, expect } from "@playwright/test";

test.use({ timezoneId: "Asia/Rangoon" });

test("manual lighting survives navigation and reload without changing habits", async ({
  page,
}) => {
  test.setTimeout(60000);
  await page.clock.setFixedTime(new Date("2026-10-04T03:30:00Z"));
  await page.goto("/habits/new");
  await page.getByLabel("What's your tiny habit?").fill("Enjoy a quiet moment");
  await page.getByRole("button", { name: "Plant my habit" }).click();
  await page.waitForURL("**/garden");
  const lighting = page.getByRole("group", { name: "Garden lighting" });
  const nightSwitch = lighting.getByRole("switch", { name: "Night mode" });
  await nightSwitch.click();
  await expect(nightSwitch).toBeChecked();
  await expect(
    lighting.getByRole("button", { name: "Auto", exact: true }),
  ).toHaveAttribute("aria-pressed", "false");
  await expect(page.getByText("A peaceful night to grow")).toBeAttached();
  await page.getByRole("link", { name: /Today/ }).click();
  await page.waitForURL("**/today");
  await page.reload();
  await expect(nightSwitch).toBeChecked();
  await expect(
    page.getByRole("button", { name: "Complete Enjoy a quiet moment" }),
  ).toBeEnabled();
  await page.getByRole("link", { name: "My Garden", exact: true }).click();
  await page.waitForURL("**/garden");
  await nightSwitch.press("Space");
  await expect(nightSwitch).not.toBeChecked();
  await expect(page.getByText("A lovely day to grow")).toBeAttached();
  await expect(
    page.getByRole("button", { name: "Enjoy a quiet moment, Oak tree, Seed" }),
  ).toBeVisible();
});

test("Auto follows the device clock at dawn and dusk and resumes after an override", async ({
  page,
}) => {
  await page.clock.install({ time: new Date("2026-10-04T23:29:30Z") });
  await page.goto("/garden");
  const lighting = page.getByRole("group", { name: "Garden lighting" });
  await expect(
    lighting.getByRole("button", { name: "Auto", exact: true }),
  ).toBeEnabled();
  await expect(page.getByText("A peaceful night to grow")).toBeAttached();
  await page.clock.fastForward(60000);
  await expect(page.getByText("A lovely day to grow")).toBeAttached();
  const nightSwitch = lighting.getByRole("switch", { name: "Night mode" });
  await expect(nightSwitch).not.toBeChecked();
  await nightSwitch.click();
  await nightSwitch.click();
  await expect(
    lighting.getByRole("button", { name: "Auto", exact: true }),
  ).toHaveAttribute("aria-pressed", "false");
  await page.clock.setSystemTime(new Date("2026-10-05T11:29:30Z"));
  await page.clock.fastForward(60000);
  await expect(page.getByText("A lovely day to grow")).toBeAttached();
  await lighting.getByRole("button", { name: "Auto", exact: true }).click();
  await expect(page.getByText("A peaceful night to grow")).toBeAttached();
});

test("night decoration respects reduced motion and stays within the viewport", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.clock.setFixedTime(new Date("2026-10-04T03:30:00Z"));
  await page.goto("/garden");
  const nightButton = page
    .getByRole("group", { name: "Garden lighting" })
    .getByRole("switch", { name: "Night mode" });
  await expect(nightButton).toBeEnabled();
  await nightButton.press("Enter");
  await expect(nightButton).toBeChecked();
  await expect(page.locator(".night-sky")).toHaveCSS("opacity", "1");
  await expect(page.locator(".night-star").first()).toHaveCSS(
    "animation-name",
    "none",
  );
  await expect(page.locator(".firefly").first()).toHaveCSS(
    "animation-name",
    "none",
  );
  await expect(page.locator(".shooting-star")).toBeHidden();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: test.info().outputPath("night-garden.png"),
    fullPage: true,
  });
  await page.getByRole("link", { name: "Tiny Habit Garden." }).click();
  await page.getByRole("link", { name: "My Garden", exact: true }).click();
  await page.waitForURL("**/garden");
});
