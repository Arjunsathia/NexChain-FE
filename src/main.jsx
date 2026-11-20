import { MotionConfig } from "framer-motion";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { AppToaster } from "./Components/ui/toaster";
import "react-loading-skeleton/dist/skeleton.css";

import ErrorBoundary from "./Components/Common/ErrorBoundary";

import { VisitedRoutesProvider } from "./context/VisitedRoutesContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <MotionConfig reducedMotion="user">
    <ErrorBoundary>
      {/* Google sign-in is provided by the auth page only, so its script doesn't load on every page */}
      <VisitedRoutesProvider>
        <App />
        <AppToaster />
      </VisitedRoutesProvider>
    </ErrorBoundary>
    </MotionConfig>
  </StrictMode>,
);
