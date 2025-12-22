import { Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import ProtectedRoute from "./ProtectedRoute";
import AuthRoute from "./AuthRoute";
import PublicRoute from "./PublicRoute";
import MainLayout from "@/Components/layout/MainLayout";
import PublicLayout from "@/Components/layout/PublicLayout";


import Dashboard from "../Pages/Dashboard";
import CryptoList from "../Pages/CryptoList";
import PortfolioPage from "@/Pages/PortfolioPage";
import Watchlist from "@/Pages/Watchlist";
import LearningHub from "@/Pages/LearningHub";
import Landing from "../Pages/Landing";
import AuthPages from "../Pages/AuthPage";


const CoinDetailsPage = lazy(() => import("@/Pages/CoinDetails/CoinDetailsPage"));
const CoinPageOutlet = lazy(() => import("@/Pages/CoinDetails/CoinPageOutlet"));
const User = lazy(() => import("@/Pages/UserProfile/User"));
const UserDashboard = lazy(() => import("@/Pages/UserProfile/UserDashboard"));
const UserSettings = lazy(() => import("@/Pages/UserProfile/Settings"));


const Admin = lazy(() => import("@/Pages/Admin/Admin"));
const AdminDashboard = lazy(() => import("@/Pages/Admin/Dashboard"));
const Users = lazy(() => import("@/Pages/Admin/Users"));
const AdminCryptocurrencies = lazy(() => import("@/Pages/Admin/Cryptocurrencies"));
const AdminFeedback = lazy(() => import("@/Pages/Admin/Feedback"));
const MarketInsights = lazy(() => import("@/Pages/Admin/MarketInsights"));
const AdminSettings = lazy(() => import("@/Pages/Admin/Settings"));




const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="w-10 h-10 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
  </div>
);

export default function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {}
        <Route element={<PublicRoute />}>
          <Route path="/" index element={<Landing />} />
          <Route element={<PublicLayout />}>
            <Route path="/public-learning" element={<LearningHub />} />
          </Route>
        </Route>

        {}
        <Route element={<AuthRoute />}>
          <Route path="/auth" element={<AuthPages />} />
        </Route>

        {}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/cryptolist" element={<CryptoList />} />
            <Route path="/portfolio" element={<PortfolioPage />} />
            <Route path="/watchlist" element={<Watchlist />}/>
            <Route path="/learning" element={<LearningHub />} />
            <Route path="/coin" element={<CoinPageOutlet />} >
              <Route path="coin-details/:coinId" element={<CoinDetailsPage />} />
            </Route>
            <Route element={<User />}>
              <Route path="/user-profile/:userId" element={<UserDashboard />} />
              <Route path="/user/settings" element={<UserSettings />} />
            </Route>
            <Route path="/admin" element={<Admin />}>
              <Route index element={<AdminDashboard />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<Users />} />
              <Route path="cryptocurrencies" element={<AdminCryptocurrencies />} />
              <Route path="feedback" element={<AdminFeedback />} />
              <Route path="insights" element={<MarketInsights />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}