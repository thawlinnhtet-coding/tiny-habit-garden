import { test, expect } from "@playwright/test";

test("auth fields show inline validation and clear as corrected", async ({
  page,
}) => {
  await page.goto("/signup");

  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page.locator("#auth-email-error")).toHaveText(
    "Enter your email address.",
  );
  await expect(page.locator("#auth-password-error")).toHaveText(
    "Enter your password.",
  );

  const email = page.getByLabel("Email", { exact: true });
  await email.fill("not-an-email");
  await expect(page.locator("#auth-email-error")).toHaveText(
    "Enter a valid email address.",
  );
  await email.fill("gardener@example.com");
  await expect(page.locator("#auth-email-error")).toHaveCount(0);

  const password = page.getByLabel("Password", { exact: true });
  await password.fill("short");
  await expect(page.locator("#auth-password-error")).toHaveText(
    "Choose a password with at least 8 characters.",
  );
  await password.fill("long-enough-password");
  await expect(page.locator("#auth-password-error")).toHaveCount(0);
});

test("account errors are visible and signup sends the confirmation link home", async ({
  page,
}) => {
  await page.route("**/auth/v1/token*", (route) =>
    route.fulfill({
      status: 400,
      contentType: "application/json",
      body: JSON.stringify({
        code: "invalid_credentials",
        error: "invalid_grant",
        error_description: "Invalid login credentials",
      }),
    }),
  );
  await page.route("**/auth/v1/signup*", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        id: "00000000-0000-0000-0000-000000000001",
        email: "gardener@example.com",
        identities: [],
      }),
    }),
  );
  await page.goto("/login");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Welcome back, gardener.",
  );
  await page.getByLabel("Email", { exact: true }).fill("gardener@example.com");
  await page.getByLabel("Password", { exact: true }).fill("test-password-123");
  const tokenRequest = page.waitForRequest((request) =>
    request.url().includes("/auth/v1/token"),
  );
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await tokenRequest;
  await expect(
    page.getByRole("alert").filter({ hasText: "Invalid login credentials" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Create an account" }).click();
  await expect(page).toHaveURL(/\/signup$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "A garden of your own.",
  );
  await page.getByLabel("Email", { exact: true }).fill("gardener@example.com");
  await page.getByLabel("Password", { exact: true }).fill("test-password-123");
  const signupRequest = page.waitForRequest((request) =>
    request.url().includes("/auth/v1/signup"),
  );
  await page
    .getByRole("button", { name: "Create account", exact: true })
    .click();
  const signup = await signupRequest;
  expect(new URL(signup.url()).searchParams.get("redirect_to")).toBe(
    new URL("/auth/confirm", page.url()).toString(),
  );
  await expect(page.getByRole("status")).toContainText("confirmation link");
  await expect(
    page.getByRole("link", { name: "Guest garden", exact: true }),
  ).toBeVisible();
});

test("landing page links to dedicated account pages and guest garden", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByLabel("Email", { exact: true })).toHaveCount(0);
  await page.getByRole("link", { name: "Grow your garden" }).click();
  await expect(page).toHaveURL(/\/signup$/);
  await expect(
    page.getByRole("link", { name: "Continue with a guest garden" }),
  ).toBeVisible();
});

test("an expired confirmation link points users back to sign-up", async ({
  page,
}) => {
  await page.route("**/auth/v1/verify*", (route) =>
    route.fulfill({
      status: 400,
      contentType: "application/json",
      body: JSON.stringify({
        code: "otp_expired",
        message: "Token has expired or is invalid",
      }),
    }),
  );
  await page.goto("/auth/confirm?token_hash=expired-token&type=email");
  await expect(page).toHaveURL(/\/login\?auth_error=confirmation$/);
  await expect(
    page.getByRole("alert").filter({ hasText: "That link expired" }),
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
