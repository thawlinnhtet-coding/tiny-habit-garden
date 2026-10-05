import { test, expect } from "@playwright/test";

test("phone header fits beside the logo with comfortable control targets", async ({
  page,
}) => {
  await page.goto("/");
  const header = page.locator("header");
  const night = header.getByRole("switch", { name: "Night mode" });
  await expect(night).toBeEnabled();

  for (const width of [320, 360, 375, 390, 430, 600]) {
    await page.setViewportSize({ width, height: 844 });
    await page.evaluate(() => document.fonts.ready);
    const brand = await header
      .getByRole("link", { name: "Tiny Habit Garden." })
      .boundingBox();
    const tools = await page.locator(".header-tools").boundingBox();
    const nav = await header.getByRole("navigation").boundingBox();
    expect(brand).not.toBeNull();
    expect(tools).not.toBeNull();
    expect(nav).not.toBeNull();
    if (!brand || !tools || !nav) throw new Error("Header is not visible.");
    expect(
      Math.abs(brand.y + brand.height / 2 - tools.y - tools.height / 2),
    ).toBeLessThan(2);
    expect(brand.x + brand.width).toBeLessThanOrEqual(tools.x);
    expect(nav.y).toBeGreaterThanOrEqual(tools.y + tools.height);
    expect(tools.x + tools.width).toBeLessThanOrEqual(width);

    for (const target of [
      night,
      header.getByRole("button", { name: "Auto", exact: true }),
      header.getByRole("button", { name: "Account menu" }),
      header.getByRole("link", { name: "My Garden", exact: true }),
      header.getByRole("link", { name: "Today", exact: true }),
    ]) {
      await expect(async () => {
        const box = await target.boundingBox();
        expect(box?.width).toBeGreaterThanOrEqual(44);
        expect(box?.height).toBeGreaterThanOrEqual(44);
      }).toPass({ timeout: 5000 });
    }
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }

  await page.setViewportSize({ width: 320, height: 844 });
  await night.click();
  await header.getByRole("button", { name: "Auto", exact: true }).click();
  await expect(
    header.getByRole("button", { name: "Auto", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await header.getByRole("link", { name: "Today", exact: true }).click();
  await page.waitForURL("**/today");
});

test("primary pages reflow at 320px with doubled text size", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 844 });
  for (const route of [
    "/",
    "/login",
    "/signup",
    "/garden",
    "/today",
    "/habits/new",
  ]) {
    await page.goto(route);
    await page.evaluate(() => {
      document.documentElement.style.fontSize = "200%";
    });
    await page.evaluate(() => document.fonts.ready);
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth), {
        message: `The ${route} page must reflow without horizontal scrolling`,
      })
      .toBeLessThanOrEqual(320);
  }
});
