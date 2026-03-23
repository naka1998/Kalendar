import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 60000,
  use: {
    baseURL: "http://localhost:5173",
    headless: true,
  },
  webServer: {
    command: "pnpm exec vp dev",
    url: "http://localhost:5173",
    reuseExistingServer: true,
    timeout: 60000,
    stdout: "pipe",
  },
});
