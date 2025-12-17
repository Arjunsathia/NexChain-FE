import { useState, useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./Routes/AppRoutes";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import { AnimatePresence } from "framer-motion";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import AlertChecker from "./Components/Common/AlertChecker";
import Preloader from "./Components/Common/Preloader";
import DataLoader from "./Components/Common/DataLoader";
import { initTheme } from "@/utils/theme-manager";

// Initialize theme as early as possible
initTheme();

function App() {
  const [isLoading, setIsLoading] = useState(() => {
    // Check if we've already shown the preloader in this session
    return !sessionStorage.getItem("hasVisited");
  });

  useEffect(() => {
    if (isLoading) {
      // Simulate initial loading time
      const timer = setTimeout(() => {
        setIsLoading(false);
        // Mark as visited so it doesn't show again on refresh
        sessionStorage.setItem("hasVisited", "true");
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60,
        gcTime: 1000 * 60 * 10,
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <DataLoader />
        <AnimatePresence mode="wait">
          {isLoading && <Preloader key="preloader" />}
        </AnimatePresence>
        <AlertChecker />
        <BrowserRouter>
          <div className="min-h-screen bg-background text-foreground">
            <AppRoutes />
          </div>
        </BrowserRouter>
      </QueryClientProvider>
    </Provider>
  );
}

export default App;