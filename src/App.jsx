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
import Admin2FAModal from "./Components/Admin/Security/Admin2FAModal";
import { initTheme } from "@/utils/theme-manager";

initTheme();

function App() {
  const [isLoading, setIsLoading] = useState(() => {
    return !sessionStorage.getItem("hasVisited");
  });

  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        setIsLoading(false);
        sessionStorage.setItem("hasVisited", "true");
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5,
            gcTime: 1000 * 60 * 10,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <DataLoader />
        <Admin2FAModal />
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
