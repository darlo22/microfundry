import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  root: path.resolve(__dirname, "client"), // Entry root is /client
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client/src"),
      "@assets": path.resolve(__dirname, "client/src/assets"),
    },
  },
  build: {
    outDir: path.resolve(__dirname, "dist"), // Output folder at root
    emptyOutDir: true, // Clean output before building
  },
});
