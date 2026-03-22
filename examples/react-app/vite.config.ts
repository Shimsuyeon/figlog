import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import autoLog from "@figlog/vite-plugin";

export default defineConfig({
  plugins: [
    react(),
    autoLog({ folderDepth: 1 }),
  ],
});
