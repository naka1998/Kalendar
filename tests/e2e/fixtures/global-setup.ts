import { test as base } from "@playwright/test";

// Block external font requests that would hang in offline/restricted environments
export const test = base.extend({
  page: async ({ page }, use) => {
    await page.route(
      (url) => url.hostname.includes("googleapis.com") || url.hostname.includes("gstatic.com"),
      (route) => route.abort(),
    );
    await use(page);
  },
});

// Mobile test fixture: touch device emulation (iPhone 14 equivalent)
export const mobileTest = base.extend({
  page: async ({ browser }, use) => {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      hasTouch: true,
      isMobile: true,
      userAgent:
        "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1",
    });
    const page = await context.newPage();
    await page.route(
      (url) => url.hostname.includes("googleapis.com") || url.hostname.includes("gstatic.com"),
      (route) => route.abort(),
    );
    await use(page);
    await context.close();
  },
});

export { expect } from "@playwright/test";
