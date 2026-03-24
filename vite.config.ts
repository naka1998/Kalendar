import { defineConfig } from "vite-plus";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  base: "/kalendar/",
  lint: { options: { typeAware: true, typeCheck: true } },
  plugins: [tailwindcss(), react()],
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: [],
    exclude: ["tests/e2e/**", "node_modules/**"],
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/main.tsx",
        "src/vite-env.d.ts",
        "src/**/*.test.{ts,tsx}",
        "src/components/ui/**",
        "src/lib/html/index.ts",
        "src/lib/htmlGenerator.ts",
      ],
      thresholds: {
        "src/lib/**": { statements: 90, branches: 90, functions: 90, lines: 90 },
        "src/stores/**": { statements: 85, branches: 85, functions: 85, lines: 85 },
        "src/hooks/**": { statements: 80, branches: 80, functions: 80, lines: 80 },
        "src/components/**": { statements: 70, branches: 70, functions: 70, lines: 70 },
      },
    },
  },
});
