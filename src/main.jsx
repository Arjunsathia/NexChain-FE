import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";
import App from "./App.jsx";
import { Toaster } from "react-hot-toast";
import "react-loading-skeleton/dist/skeleton.css";

import ErrorBoundary from "./Components/Common/ErrorBoundary";

import { GoogleOAuthProvider } from "@react-oauth/google";

import { VisitedRoutesProvider } from "./context/VisitedRoutesContext";
import { BinanceTickerProvider } from "./context/BinanceTickerContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ErrorBoundary>
      <GoogleOAuthProvider
        clientId={
          import.meta.env.VITE_GOOGLE_CLIENT_ID || "PLACEHOLDER_CLIENT_ID"
        }
      >
        <BinanceTickerProvider>
          <VisitedRoutesProvider>
            <App />
            <Toaster
              position="top-right"
              containerStyle={{
                top: 40,
                left: 20,
                bottom: 20,
                right: 20,
                zIndex: 999999,
              }}
              toastOptions={{
                className:
                  "!bg-white dark:!bg-indigo-50 !text-gray-900 dark:!text-gray-900 !border !border-gray-100 dark:!border-indigo-100 !shadow-xl !rounded-full !px-4 !py-2 !text-xs !font-bold !gap-3",
                duration: 3000,
                success: {
                  iconTheme: {
                    primary: "#10B981",
                    secondary: "white",
                  },
                },
                error: {
                  iconTheme: {
                    primary: "#EF4444",
                    secondary: "white",
                  },
                },
              }}
            />
          </VisitedRoutesProvider>
        </BinanceTickerProvider>
      </GoogleOAuthProvider>
    </ErrorBoundary>
  </StrictMode>,
);
