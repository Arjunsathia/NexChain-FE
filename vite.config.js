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
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          "vendor-apexcharts": ["apexcharts", "react-apexcharts"],
          "vendor-chartjs": ["chart.js", "react-chartjs-2"],
          "vendor-recharts": ["recharts"],
          "vendor-ui": [
            "framer-motion", 
            "lottie-react", 
            "react-confetti", 
            "react-loading-skeleton",
            "react-simple-typewriter"
          ],
          "vendor-utils": [
             "axios", 
             "zod", 
             "react-hook-form", 
             "@tanstack/react-query",
             "@stripe/stripe-js"
          ],
          "vendor-icons": ["react-icons", "lucide-react"],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
});
