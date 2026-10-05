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
    page.getByText(/Account gardens are being prepared/),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Continue with a guest garden" }),
  ).toBeVisible();
  await page.goto("/signup");
  await expect(
    page.getByText(/Account gardens are being prepared/),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "Continue with a guest garden" })
    .click();
  await expect(page).toHaveURL(/\/garden$/);
  await expect(
    page.getByRole("button", { name: "Account menu" }),
  ).toContainText("Guest");
});

test("custom account forms validate each field and keep official provider artwork", async ({
  page,
}) => {
  for (const path of ["/login", "/signup"]) {
    await page.goto(path, { waitUntil: "domcontentloaded" });
    const email = page.getByLabel("Email", { exact: true });
    const password = page.getByLabel("Password", { exact: true });
    await email.fill("not-an-email");
    await password.fill("short");
    await email.blur();
    await expect(email).toHaveAttribute("aria-invalid", "true");
    await expect(
      page.getByText("Enter a valid email address.", { exact: true }),
    ).toBeVisible();
    await email.fill("gardener@example.com");
    await expect(email).toHaveAttribute("aria-invalid", "false");
    await password.blur();
    if (path === "/signup") {
      await expect(password).toHaveAttribute("aria-invalid", "true");
      await password.fill("a longer garden password");
      await expect(password).toHaveAttribute("aria-invalid", "false");
    }
    await page.getByRole("button", { name: "Show password" }).click();
    await expect(password).toHaveAttribute("type", "text");
    await page.getByRole("button", { name: "Hide password" }).click();
    await expect(password).toHaveAttribute("type", "password");
    const google = page.getByRole("button", { name: /Google/ });
    const github = page.getByRole("button", { name: /GitHub/ });
    await expect(google).toBeVisible({ timeout: 30000 });
    await expect(github).toBeVisible();
    await expect(google.locator("img,svg")).not.toHaveCount(0);
    await expect(github.locator("img,svg")).not.toHaveCount(0);
    await expect(google.locator("img")).toHaveJSProperty("complete", true);
    await expect(google.locator("img")).not.toHaveJSProperty("naturalWidth", 0);
    await expect(github.locator("img")).not.toHaveJSProperty("naturalWidth", 0);
    await page.goto(path, { waitUntil: "domcontentloaded" });
    await page.locator(".manual-auth img").evaluateAll(async (images) => {
      await Promise.all(
        images.map((image) => (image as HTMLImageElement).decode()),
      );
    });
    await page.screenshot({
      path: test.info().outputPath(path.slice(1) + "-custom.png"),
      fullPage: true,
    });
    await page.getByRole("switch", { name: "Night mode" }).check();
    await page.locator(".manual-auth").screenshot({
      path: test.info().outputPath(path.slice(1) + "-custom-night.png"),
    });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  }
});

test("account forms focus invalid fields and recovery keeps inline validation", async ({
  page,
}) => {
  await page.goto("/login", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.getByLabel("Email", { exact: true })).toBeFocused();
  await expect(
    page.getByText("Enter your email address.", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Enter your password.", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Forgot password?" }).click();
  await expect(
    page.getByRole("heading", { name: "Find your way back." }),
  ).toBeVisible();
  await expect(page.getByLabel("Password", { exact: true })).toHaveCount(0);
  await page
    .getByRole("button", { name: "Send reset code", exact: true })
    .click();
  await expect(page.getByLabel("Email", { exact: true })).toBeFocused();
  await page.getByRole("button", { name: "Back to sign in" }).click();
  await expect(page.getByLabel("Password", { exact: true })).toBeVisible();
});
