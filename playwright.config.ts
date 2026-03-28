import { defineConfig } from "@playwright/test";

const getEnv = (key: string): string | undefined =>
  (
    (globalThis as Record<string, unknown>).process as
      | { env: Record<string, string | undefined> }
      | undefined
  )?.env[key];

const baseURL = getEnv("PLAYWRIGHT_BASE_URL") || "http://localhost:5173";

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
    baseURL,
    headless: true,
    launchOptions: {
      ...(getEnv("PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH")
        ? { executablePath: getEnv("PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH") }
        : {}),
      args: ["--no-sandbox"],
    },
  },
  webServer: {
    command: "pnpm exec vp preview --port 5173",
    url: baseURL,
    reuseExistingServer: true,
    timeout: 60000,
    stdout: "pipe",
  },
});
