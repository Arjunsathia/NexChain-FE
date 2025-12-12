import { useState, useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./Routes/AppRoutes";
import { CoinProvider } from "./Context/CoinContext/CoinProvider";
import { UserProvider } from "./Context/UserContext/UserProvider";
import { RoleProvider } from "./Context/RoleContext/RoleProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import WalletProvider from "./Context/WalletContext/WalletProvider";
import PortfolioProvider from "./Context/PortfolioContext/PortfolioProvider";
import { AnimatePresence } from "framer-motion";

import { ThemeProvider } from "./Context/ThemeContext";

import AlertChecker from "./Components/Common/AlertChecker";
import LenisScroll from "./Components/Common/LenisScroll";
import Preloader from "./Components/Common/Preloader";
 
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
        staleTime: 1000 * 60, // Data remains fresh for 1 minute
        gcTime: 1000 * 60 * 10, // Cache remains for 10 minutes
        retry: 1,
        refetchOnWindowFocus: false,
        refetchOnMount: false, // Prevents refetching immediately if data is fresh
      },
    },
  }));
  
  return (
    <UserProvider>
      <LenisScroll />
      <AnimatePresence mode="wait">
        {isLoading && <Preloader key="preloader" />}
      </AnimatePresence>
      <AlertChecker />
      <QueryClientProvider client={queryClient}>
        <RoleProvider>
          <CoinProvider>
            <WalletProvider>
              <PortfolioProvider>
                <ThemeProvider>
                  <BrowserRouter>
                    <div className="min-h-screen bg-background text-foreground">
                      <AppRoutes />
                    </div>
                  </BrowserRouter>
                </ThemeProvider>
              </PortfolioProvider>
            </WalletProvider>
          </CoinProvider>
        </RoleProvider>
      </QueryClientProvider>
    </UserProvider>
  );
}

export default App;