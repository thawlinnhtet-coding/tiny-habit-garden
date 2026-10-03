import { test, expect } from "@playwright/test";

test("account errors are visible and signup explains email confirmation", async ({
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
  await page.goto("/");
  await page.getByLabel("Email", { exact: true }).fill("gardener@example.com");
  await page.getByLabel("Password", { exact: true }).fill("test-password-123");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(
    page.getByRole("alert").filter({ hasText: "Invalid login credentials" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Create an account", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Create account", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("Check your inbox");
  await expect(
    page.getByRole("link", { name: "Guest garden", exact: true }),
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
