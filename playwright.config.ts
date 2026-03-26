import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 60000,
  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.01,
    },
  },
  snapshotPathTemplate: "{testDir}/__screenshots__/{testFilePath}/{arg}{ext}",
  use: {
    baseURL:
      (
        (globalThis as Record<string, unknown>).process as
          | { env: Record<string, string | undefined> }
          | undefined
      )?.env.PLAYWRIGHT_BASE_URL || "http://localhost:5173",
    headless: true,
    launchOptions: {
      executablePath: (globalThis as Record<string, unknown>).process
        ? (
            (globalThis as Record<string, unknown>).process as {
              env: Record<string, string | undefined>;
            }
          ).env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
        : undefined,
      args: ["--no-sandbox"],
    },
  },
  webServer: {
    command: "pnpm exec vp preview --port 5173",
    url: "http://localhost:5173",
    reuseExistingServer: true,
    timeout: 60000,
    stdout: "pipe",
  },
});
