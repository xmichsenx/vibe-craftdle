import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Set base to repo name for GitHub Pages (e.g., "/Craftdle/")
// Use "/" for local development or custom domain
export default defineConfig({
  plugins: [react()],
  base: "/Craftdle/",
  server: {
    port: 5173,
  },
});
