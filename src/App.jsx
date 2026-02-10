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
import SocketManager from "./Components/Common/SocketManager";
import Admin2FAModal from "./Components/Admin/Security/Admin2FAModal";
import { initTheme } from "@/utils/theme-manager";

initTheme();

function App() {
  const [isLoading, setIsLoading] = useState(() => {
    return !sessionStorage.getItem("hasVisited");
  });

  useEffect(() => {
    // If not visited, we might want to show a quick intro or just load.
    // Ideally, we wait for user auth check + critical data.
    // For now, let's make it instant or just wait for small delay/animation if needed.
    if (isLoading) {
      setIsLoading(false);
      sessionStorage.setItem("hasVisited", "true");
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
        <SocketManager />
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
