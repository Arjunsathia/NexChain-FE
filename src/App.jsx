import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./Routes/AppRoutes";
import { CoinProvider } from "./Context/CoinContext/CoinProvider";
import { UserProvider } from "./Context/UserContext/UserProvider";
import { RoleProvider } from "./Context/RoleContext/RoleProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import WalletProvider from "./Context/WalletContext/WalletProvider";
import PortfolioProvider from "./Context/PortfolioContext/PortfolioProvider";

function App() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });
  
  return (
    <UserProvider>
      <QueryClientProvider client={queryClient}>
        <RoleProvider>
          <CoinProvider>
            <WalletProvider>
              <PortfolioProvider>
                <BrowserRouter>
                  <div className="min-h-screen bg-[#0d1117] text-white">
                    <AppRoutes />
                  </div>
                </BrowserRouter>
              </PortfolioProvider>
            </WalletProvider>
          </CoinProvider>
        </RoleProvider>
      </QueryClientProvider>
    </UserProvider>
  );
}

export default App;