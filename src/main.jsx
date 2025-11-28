import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { Toaster } from "react-hot-toast";
import 'react-loading-skeleton/dist/skeleton.css';

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        className: '',
        style: {
          background: '#333',
          color: '#fff',
          borderRadius: '10px',
          padding: '16px',
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
  </StrictMode>
);
