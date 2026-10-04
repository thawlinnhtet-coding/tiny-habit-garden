import { test, expect } from "@playwright/test";

test("Google sign-in starts a PKCE flow without requiring email fields", async ({
  page,
}) => {
  await page.route("**/auth/v1/settings", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ external: { google: true, github: true } }),
    }),
  );
  await page.route("**/auth/v1/authorize*", (route) =>
    route.fulfill({
      status: 200,
      contentType: "text/html",
      body: "<h1>Provider sign-in</h1>",
    }),
  );
  await page.goto("/signup");
  const callbackURL = new URL("/auth/callback", page.url()).toString();
  const authorize = page.waitForRequest((request) =>
    request.url().includes("/auth/v1/authorize"),
  );
  await page.getByRole("button", { name: "Continue with Google" }).click();
  const url = new URL((await authorize).url());
  expect(url.searchParams.get("provider")).toBe("google");
  expect(url.searchParams.get("redirect_to")).toBe(callbackURL);
  expect(url.searchParams.get("code_challenge_method")).toBe("s256");
  expect(url.searchParams.get("code_challenge")).toBeTruthy();
});

test("GitHub sign-in uses the same safe return path and PKCE flow", async ({
  page,
}) => {
  await page.route("**/auth/v1/settings", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ external: { google: true, github: true } }),
    }),
  );
  await page.route("**/auth/v1/authorize*", (route) =>
    route.fulfill({
      status: 200,
      contentType: "text/html",
      body: "<h1>Provider sign-in</h1>",
    }),
  );
  await page.goto("/login");
  const callbackURL = new URL("/auth/callback", page.url()).toString();
  const [authorize] = await Promise.all([
    page.waitForRequest((request) =>
      request.url().includes("/auth/v1/authorize"),
    ),
    page.getByRole("button", { name: "Continue with GitHub" }).click(),
  ]);
  const url = new URL(authorize.url());
  expect(url.searchParams.get("provider")).toBe("github");
  expect(url.searchParams.get("redirect_to")).toBe(callbackURL);
  expect(url.searchParams.get("code_challenge_method")).toBe("s256");
});

test("a disabled provider stays on the account page with a useful retry option", async ({
  page,
}) => {
  await page.route("**/auth/v1/settings", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ external: { google: false, github: false } }),
    }),
  );
  await page.goto("/login");
  await page.screenshot({
    path: test.info().outputPath("provider-sign-in.png"),
    fullPage: true,
  });
  await page.getByRole("button", { name: "Continue with Google" }).click();
  await expect(
    page
      .getByRole("alert")
      .filter({ hasText: "Google sign-in isn't available" }),
  ).toContainText("Google sign-in isn't available right now");
  await expect(page).toHaveURL(/\/login$/);
  await expect(
    page.getByRole("button", { name: "Sign in", exact: true }),
  ).toBeEnabled();
  await expect(
    page.getByRole("button", { name: "Continue with Google" }),
  ).toBeEnabled();
});

test("cancelled social sign-in explains how to retry without email-link instructions", async ({
  page,
}) => {
  await page.goto(
    "/auth/callback?error=access_denied&error_description=User+cancelled",
  );
  await expect(page).toHaveURL(/\/login\?auth_error=oauth$/);
  await expect(
    page
      .getByRole("alert")
      .filter({ hasText: "Social sign-in wasn't completed" }),
  ).toContainText("Social sign-in wasn't completed");
  await expect(
    page.getByRole("button", { name: "Continue with GitHub" }),
  ).toBeEnabled();
});
