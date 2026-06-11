/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Relative asset paths so the production build works when served from a
  // sub-path such as GitHub Pages (https://<user>.github.io/<repo>/).
  base: "./",
  server: {
    host: true, // listen on all interfaces so the app is reachable over the LAN
  },
  test: {
    environment: "jsdom",
    globals: true,
  },
});
