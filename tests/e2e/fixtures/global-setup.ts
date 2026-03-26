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

export { expect } from "@playwright/test";
