import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "url";

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],
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
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          "vendor-apexcharts": ["apexcharts", "react-apexcharts"],
          "vendor-recharts": ["recharts"],
          "vendor-ui": [
            "framer-motion", 
            "react-loading-skeleton",
          ],
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
});
