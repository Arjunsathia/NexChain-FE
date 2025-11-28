import { Routes, Route } from "react-router-dom";
import Landing from "../Pages/Landing";
import AuthPages from "../Pages/AuthPage";
import MainLayout from "@/Components/layout/MainLayout";
import Dashboard from "../Pages/Dashboard";
import CryptoList from "../Pages/CryptoList";
import PortfolioPage from "@/Pages/PortfolioPage";
import Watchlist from "@/Pages/Watchlist";
import LearningHub from "@/Pages/LearningHub";
import Admin from "@/Pages/Admin/Admin";
import AdminDashboard from "@/Pages/Admin/Dashboard";
import Users from "@/Pages/Admin/Users";
import AdminCryptocurrencies from "@/Pages/Admin/Cryptocurrencies";
import UserDashboard from "@/Pages/UserProfile/UserDashboard";
import ProtectedRoute from "./ProtectedRoute";
import AuthRoute from "./AuthRoute";
import PublicRoute from "./PublicRoute";
import CoinDetailsPage from "@/Pages/CoinDetails/CoinDetailsPage";
import CoinPageOutlet from "@/Pages/CoinDetails/CoinPageOutlet";
import AdminFeedback from "@/Pages/Admin/Feedback";
import MarketInsights from "@/Pages/Admin/MarketInsights";
import AdminSettings from "@/Pages/Admin/Settings";
import UserSettings from "@/Pages/UserProfile/Settings";

import PublicLayout from "@/Components/layout/PublicLayout";
import User from "@/Pages/UserProfile/User";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Landing Page */}
      <Route element={<PublicRoute />}>
        <Route path="/" index element={<Landing />} />
        <Route element={<PublicLayout />}>
          <Route path="/public-learning" element={<LearningHub />} />
        </Route>
      </Route>

      {/* Auth/Public Routes */}
      <Route element={<AuthRoute />}>
        <Route path="/auth" element={<AuthPages />} />
      </Route>




      {/* Protected Routes */}
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
  );
}