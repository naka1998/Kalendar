import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 60000,
  use: {
    baseURL: "http://localhost:5173",
    headless: true,
    launchOptions: {
      executablePath: (globalThis as Record<string, unknown>).process
        ? (
            (globalThis as Record<string, unknown>).process as {
              env: Record<string, string | undefined>;
            }
          ).env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
        : undefined,
    },
  },
  webServer: {
    command: "pnpm exec vp dev",
    url: "http://localhost:5173",
    reuseExistingServer: true,
    timeout: 60000,
    stdout: "pipe",
  },
});
