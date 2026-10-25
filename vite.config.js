import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "url";

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],
  esbuild: {
    // Strip debug logging but keep console.error/warn so production failures are visible
    pure: ["console.log", "console.debug", "console.info"],
    drop: ["debugger"],
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    proxy: {
      '/api/coingecko': {
        target: 'https://api.coingecko.com/api/v3',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/coingecko/, ''),
      }
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          // Chart libraries are left to load with the pages that use them
          "vendor-utils": [
            "axios",
            "@tanstack/react-query",
          ],
          "vendor-icons": ["react-icons", "lucide-react"],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.{js,jsx}"],
    restoreMocks: true,
  },
});
