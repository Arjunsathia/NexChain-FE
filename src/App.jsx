import { useState, useEffect, lazy, Suspense } from "react";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./Routes/AppRoutes";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import SocketManager from "./Components/Common/SocketManager";
import SessionManager from "./Components/Common/SessionManager";
// Loaded after first paint: neither is needed to render the first page
const Admin2FAModal = lazy(() => import("./Components/Admin/Security/Admin2FAModal"));
const FirstVisitSplash = lazy(() => import("./Components/Common/FirstVisitSplash"));
import { initTheme } from "@/utils/theme-manager";

initTheme();

function App() {
  const [isLoading, setIsLoading] = useState(() => {
    return !sessionStorage.getItem("hasVisited");
  });

  useEffect(() => {
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
        <SessionManager />
        <SocketManager />
        <Suspense fallback={null}>
          <Admin2FAModal />
          <FirstVisitSplash show={isLoading} />
        </Suspense>
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
