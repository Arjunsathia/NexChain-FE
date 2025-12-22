import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { Toaster } from "react-hot-toast";
import 'react-loading-skeleton/dist/skeleton.css';

import ErrorBoundary from "./Components/Common/ErrorBoundary";


createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
      <Toaster
        position="top-right"
        containerStyle={{
            top: 20,
            left: 20,
            bottom: 20,
            right: 20,
        }}
        toastOptions={{
            className: '!max-w-[85vw] !text-[11px] sm:!text-xs md:!text-base font-medium shadow-xl !px-3 !py-2 md:!px-4 md:!py-3',
            style: {
            background: '#333',
            color: '#fff',
            borderRadius: '12px',
            },
            success: {
            style: {
                background: 'rgba(16, 185, 129, 0.9)',
                color: '#fff',
            },
            iconTheme: {
                primary: '#fff',
                secondary: 'rgba(16, 185, 129, 0.9)',
            },
            },
            error: {
            style: {
                background: 'rgba(239, 68, 68, 0.9)',
                color: '#fff',
            },
            iconTheme: {
                primary: '#fff',
                secondary: 'rgba(239, 68, 68, 0.9)',
            },
            },
        }}
      />
    </ErrorBoundary>
  </StrictMode>
);
