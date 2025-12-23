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
          className: '!bg-white !text-gray-900 !border !border-gray-200 !shadow-[0_8px_30px_-5px_rgba(0,0,0,0.15)] !rounded-xl !text-sm !font-semibold !px-5 !py-3 gap-3',
          duration: 4000,
          success: {
            style: {
              borderLeft: '5px solid #10B981',
            },
            iconTheme: {
              primary: '#10B981',
              secondary: 'white',
            },
          },
          error: {
            style: {
              borderLeft: '5px solid #EF4444',
            },
            iconTheme: {
              primary: '#EF4444',
              secondary: 'white',
            },
          },
        }}
      />
    </ErrorBoundary>
  </StrictMode>
);
