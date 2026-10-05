import { test, expect } from "@playwright/test";

test("empty Today has one planting action and a keyboard-accessible guest menu", async ({
  page,
}) => {
  await page.goto("/today");
  await expect(
    page.getByRole("link", { name: "Plant my first habit", exact: true }),
  ).toHaveCount(1);
  await expect(
    page.getByRole("link", { name: "Plant a habit", exact: true }),
  ).toHaveCount(0);
  const account = page.getByRole("button", { name: "Account menu" });
  await expect(account).toContainText("Guest");
  await account.press("Enter");
  await expect(page.getByRole("menu")).toContainText("saved in this browser");
  await page.screenshot({
    path: test.info().outputPath("empty-today-account-menu.png"),
    fullPage: true,
  });
  await page
    .getByRole("menuitem", { name: "Sign in", exact: true })
    .press("Enter");
  await expect(page).toHaveURL(/\/login$/);
});

test("landing page links to dedicated account pages and guest garden", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByLabel("Email", { exact: true })).toHaveCount(0);
  await page.locator(".landing-world").scrollIntoViewIfNeeded();
  await page.screenshot({
    path: test.info().outputPath("landing-page.png"),
    fullPage: true,
  });
  await page.locator(".landing-world").screenshot({
    path: test.info().outputPath("landing-preview.png"),
  });
  await page.getByRole("link", { name: "Grow your garden" }).click();
  await expect(page).toHaveURL(/\/signup$/);
  await expect(
    page.getByRole("link", { name: "Continue with a guest garden" }),
  ).toBeVisible();
});

test("a damaged guest garden is preserved and explained", async ({ page }) => {
  await page.addInitScript(() =>
    localStorage.setItem("tiny-habit-garden:guest:v1", "broken original data"),
  );
  await page.goto("/garden");
  await expect(
    page.getByRole("alert").filter({ hasText: "Its data has been preserved" }),
  ).toBeVisible();
  expect(
    await page.evaluate(() =>
      localStorage.getItem("tiny-habit-garden:guest:v1"),
    ),
  ).toBe("broken original data");
});

test("missing Clerk configuration keeps account entry and the guest garden usable", async ({
  page,
}) => {
  test.skip(
    Boolean(
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
      process.env.CLERK_SECRET_KEY,
    ),
    "Clerk is configured",
  );
  await page.goto("/login");
  await expect(
    page.getByRole("heading", { name: "Account gardens are being prepared." }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Continue with a guest garden" }),
  ).toBeVisible();
  await page.goto("/signup");
  await expect(
    page.getByRole("heading", { name: "Account gardens are being prepared." }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "Continue with a guest garden" })
    .click();
  await expect(page).toHaveURL(/\/garden$/);
  await expect(
    page.getByRole("button", { name: "Account menu" }),
  ).toContainText("Guest");
});

test("Clerk account pages offer Google and GitHub with provider artwork", async ({
  page,
}) => {
  test.skip(
    !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
      !process.env.CLERK_SECRET_KEY,
    "Requires configured Clerk development keys and both providers",
  );
  for (const path of ["/login", "/signup"]) {
    await page.goto(path);
    const google = page.getByRole("button", { name: /Google/ });
    const github = page.getByRole("button", { name: /GitHub/ });
    await expect(google).toBeVisible({ timeout: 30000 });
    await expect(github).toBeVisible();
    await expect(google.locator("img,svg")).not.toHaveCount(0);
    await expect(github.locator("img,svg")).not.toHaveCount(0);
    await page.screenshot({
      path: test.info().outputPath(path.slice(1) + "-clerk.png"),
      fullPage: true,
    });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  }
});
