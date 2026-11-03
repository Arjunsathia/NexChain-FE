import { MotionConfig } from "framer-motion";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { AppToaster } from "./Components/ui/toaster";
import "react-loading-skeleton/dist/skeleton.css";

import ErrorBoundary from "./Components/Common/ErrorBoundary";

import { GoogleOAuthProvider } from "@react-oauth/google";

import { VisitedRoutesProvider } from "./context/VisitedRoutesContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <MotionConfig reducedMotion="user">
    <ErrorBoundary>
      <GoogleOAuthProvider
        clientId={
          import.meta.env.VITE_GOOGLE_CLIENT_ID || "PLACEHOLDER_CLIENT_ID"
        }
      >
          <VisitedRoutesProvider>
            <App />
            <AppToaster />
          </VisitedRoutesProvider>
      </GoogleOAuthProvider>
    </ErrorBoundary>
    </MotionConfig>
  </StrictMode>,
);
