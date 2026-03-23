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
  },
});
