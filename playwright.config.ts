import { defineConfig, devices } from "@playwright/test";
const port = process.env.E2E_PORT ?? "3000";
const baseURL = `http://127.0.0.1:${port}`;
const distDir = process.env.NEXT_DIST_DIR ?? ".next";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  use: { baseURL, trace: "retain-on-failure" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: `npm run dev -- --hostname 127.0.0.1 --port ${port}`,
    url: baseURL,
    env: { NEXT_DIST_DIR: distDir },
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
