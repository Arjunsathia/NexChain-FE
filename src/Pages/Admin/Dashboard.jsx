import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import UserLineChart from "@/Components/Admin/Dashboard/LineChart";
import StatCard from "@/Components/Admin/Dashboard/StatCard";
import RecentReports from "@/Components/Admin/Dashboard/RecentReports";
import LatestUsers from "@/Components/Admin/Dashboard/LatestUsers";
import PlatformHealth from "@/Components/Admin/Dashboard/PlatformHealth";
import QuickActions from "@/Components/Admin/Dashboard/QuickActions";
import { getData } from "@/api/axiosConfig";

import useCoinContext from "@/hooks/useCoinContext";
import {
  FaUsers,
  FaCoins,
  FaChartLine,
  FaStar,
} from "react-icons/fa";

import useThemeCheck from "@/hooks/useThemeCheck";

function AdminDashboard() {
  const navigate = useNavigate();
  const { coins } = useCoinContext() ?? { coins: [] };
  const isLight = useThemeCheck();

  
  const TC = useMemo(
    () => ({
      textPrimary: isLight ? "text-gray-900" : "text-white",
      textSecondary: isLight ? "text-gray-500" : "text-gray-400",
      textTertiary: isLight ? "text-gray-400" : "text-gray-500",

      bgCard: isLight
        ? "bg-white shadow-sm sm:shadow-[0_6px_25px_rgba(0,0,0,0.12)]"
        : "bg-gray-800/50 backdrop-blur-xl shadow-xl shadow-black/20 border-none",
      bgStatsCard: isLight
        ? "bg-white shadow-sm sm:shadow-[0_6px_25px_rgba(0,0,0,0.12)] border-none"
        : "bg-gray-800/50 backdrop-blur-xl shadow-2xl hover:shadow-cyan-400/25 border-none",
      bgItem: isLight ? "bg-gray-50" : "bg-white/5",

      cardHover: isLight ? "hover:shadow-blue-500/10" : "hover:shadow-cyan-500/10",

      
      headerGradient: "from-cyan-400 to-blue-500",
    }),
    [isLight]
  );

  
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [trendingCoinData, setTrendingCoinData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [contentLoaded, setContentLoaded] = useState(false);
  const [timeRange, setTimeRange] = useState("Month");

  useEffect(() => {
    let mounted = true;
    let pollInterval;

    const fetchUsers = async () => {
      try {
        const res = await getData("/users");
        const payload = res?.data ?? res;
        const usersList = payload?.users ?? payload ?? [];
        if (mounted) setUsers(Array.isArray(usersList) ? usersList : []);
      } catch (err) {
        console.error("Failed to fetch users:", err);
        if (mounted) setUsers([]);
      }
    };

    const fetchReports = async () => {
      try {
        
        const res = await getData("/feedback");
        const feedbackData = res?.data ?? res ?? [];

        
        const reportsFromFeedback = Array.isArray(feedbackData)
          ? feedbackData
              .filter((fb) => fb.type === "bug" || fb.type === "issue") 
              .map((fb) => {
                const message = fb.message || "";
                const trimmedTitle =
                  message.length > 0
                    ? message.length > 60
                      ? `${message.substring(0, 60)}...`
                      : message
                    : "No title";

                return {
                  id: fb._id || fb.id,
                  type: fb.type || "bug",
                  title: trimmedTitle,
                  status: fb.status || "new",
                  createdAt: fb.createdAt || fb.timestamp || new Date().toISOString(),
                };
              })
              .slice(0, 4) 
          : [];

        if (mounted) setReports(reportsFromFeedback);
      } catch (err) {
        console.error("Failed to fetch feedback reports:", err);
        
        if (mounted) setReports([]);
      }
    };

    const fetchRecentActivity = async () => {
      try {
        const res = await getData("/activity");
        const activityData = res?.data ?? res ?? [];
        if (mounted) setRecentActivity(Array.isArray(activityData) ? activityData : []);
      } catch (err) {
        const now = Date.now();
        const mockActivity = [
          {
            type: "user_registered",
            message: `New user registered: User${Math.floor(Math.random() * 1000)}`,
            timestamp: new Date(now - 120000).toISOString(),
            colorClass: "text-green-400",
          },
          {
            type: "trade_completed",
            message: `Trade completed: ${Math.floor(Math.random() * 10)} BTC`,
            timestamp: new Date(now - 300000).toISOString(),
            colorClass: "text-blue-400",
          },
          {
            type: "watchlist_added",
            message: "Watchlist updated",
            timestamp: new Date(now - 600000).toISOString(),
            colorClass: "text-yellow-400",
          },
          {
            type: "report_submitted",
            message: "New feedback received",
            timestamp: new Date(now - 900000).toISOString(),
            colorClass: "text-purple-400",
          },
        ];
        if (mounted) setRecentActivity(mockActivity);
      }
    };

    const fetchTrendingCoin = async () => {
      try {
        const res = await getData("/watchlist/trending");
        const data = res?.data ?? res;
        if (mounted) setTrendingCoinData(data);
      } catch (err) {
        console.error("Failed to fetch trending coin:", err);
      }
    };

    const load = async () => {
      setIsLoading(true);
      setContentLoaded(false);
      try {
        await Promise.all([
          fetchUsers(),
          fetchReports(),
          fetchRecentActivity(),
          fetchTrendingCoin(),
        ]);
      } catch (err) {
        console.error("Failed to fetch admin data:", err);
      } finally {
        setIsLoading(false);
        
        setTimeout(() => mounted && setContentLoaded(true), 300);
      }
    };

    load();

    pollInterval = setInterval(() => {
      if (mounted) {
        fetchUsers();
        fetchReports();
        fetchRecentActivity();
        fetchTrendingCoin();
      }
    }, 30000);

    return () => {
      mounted = false;
      if (pollInterval) clearInterval(pollInterval);
    };
  }, []);

  const adminStats = useMemo(() => {
    const totalUsers = users.length;
    
    const totalCoins = 150;
    const totalTrades = users.reduce(
      (total, u) => total + (u.purchasedCoins?.length || 0),
      0
    );

    
    const trending = trendingCoinData || { symbol: "BTC", price_change_percentage_24h: 2.45 };

    return {
        totalUsers,
        totalCoins,
        totalTrades,
        trendingCoin: trending
    };
  }, [users, trendingCoinData]);

  const latestUsers = useMemo(() => {
    return [...users]
      .sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      )
      .slice(0, 10)
      .map((u) => ({
        id: u._id || u.id,
        name: u.name || "Unknown",
        email: u.email || "No email",
        role: u.role || "user",
        joinDate: u.createdAt
          ? new Date(u.createdAt).toLocaleDateString()
          : "Unknown",
        image: u.image,
      }));
  }, [users]);

  const handleQuickAction = (action) => {
    switch (action) {
      case "addCoin":
        navigate("/admin/cryptocurrencies");
        break;
      case "viewUsers":
        navigate("/admin/users");
        break;
      case "systemSettings":
        navigate("/admin/settings");
        break;
      case "generateReport":
        navigate("/admin/feedback");
        break;
      default:
        console.warn("Unknown action:", action);
    }
  };

  return (
    <div
      className={`
        flex-1 p-2 sm:p-4 lg:p-8 space-y-3 sm:space-y-4 lg:space-y-6 min-h-screen ${TC.textPrimary}
        transition-all duration-500 ease-in-out
        rounded-3xl
      `}
    >
      {}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1
            className={`text-xl sm:text-3xl font-bold bg-gradient-to-r ${TC.headerGradient} bg-clip-text text-transparent`}
          >
            Dashboard Overview
          </h1>
          <p className={`${TC.textSecondary} mt-1 text-[10px] sm:text-sm`}>
            Real-time platform monitoring and management
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isLoading && (
            <div className="flex items-center text-sm text-gray-300">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Loading...
            </div>
          )}
          <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 text-green-400 text-xs font-medium shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
            System Operational
          </span>
        </div>
      </div>

      {}
      <div
        className={`transition-all duration-500 ease-in-out ${
          contentLoaded && !isLoading
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4"
        }`}
      >
        {}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-3 sm:mb-6">
          {isLoading ? (
            
            [...Array(4)].map((_, i) => (
              <div
                key={i}
                className={`${TC.bgCard} h-32 rounded-xl animate-pulse`}
              />
            ))
          ) : (
            
            [
              {
                label: "Total Users",
                value: adminStats.totalUsers,
                icon: FaUsers,
                color: "from-blue-500 to-cyan-400",
                badge: "+12%"
              },
              {
                label: "Active Coins",
                value: adminStats.totalCoins,
                icon: FaCoins,
                color: "from-purple-500 to-pink-400",
                badge: "+5 new"
              },
              {
                label: "Total Trades",
                value: adminStats.totalTrades,
                icon: FaChartLine,
                color: "from-green-500 to-emerald-400",
                badge: "+8.2%"
              },
              {
                label: "Trending Coin",
                value: adminStats.trendingCoin ? adminStats.trendingCoin.symbol?.toUpperCase() : "N/A",
                icon: FaStar,
                color: "from-amber-500 to-yellow-400",
                badge: (adminStats.trendingCoin && adminStats.trendingCoin.price_change_percentage_24h != null)
                    ? `${Number(adminStats.trendingCoin.price_change_percentage_24h).toFixed(2)}%`
                    : "No data"
              },
            ].map((stat, i) => (
              <StatCard key={i} {...stat} TC={TC} />
            ))
          )}
        </div>

        {}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-3 sm:mb-4 fade-in" style={{ animationDelay: '0.1s' }}>
          {}
          <div className={`lg:col-span-2 ${TC.bgCard} rounded-xl sm:rounded-2xl p-3 sm:p-6`}>
            <div className="flex items-center justify-between mb-2 sm:mb-6">
              <h2
                className={`text-sm sm:text-lg font-bold ${TC.textPrimary} flex items-center gap-2`}
              >
                <FaChartLine className="text-cyan-400 text-xs sm:text-base" />{" "}
                User Registration
              </h2>
              
              {}
              <div className={`flex items-center p-1 rounded-lg ${isLight ? 'bg-gray-100' : 'bg-gray-700/50'}`}>
                {['Week', 'Month'].map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`
                      px-3 py-1 text-xs font-medium rounded-md transition-all duration-200
                      ${timeRange === range 
                        ? (isLight ? 'bg-white text-gray-900 shadow-sm' : 'bg-gray-600 text-white shadow-sm') 
                        : (isLight ? 'text-gray-500 hover:text-gray-900' : 'text-gray-400 hover:text-white')}
                    `}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>

            {isLoading ? (
              
              <div className="h-[200px] sm:h-[250px] lg:h-[300px] w-full animate-pulse bg-gray-700/30 rounded" />
            ) : (
              <div className="h-[200px] sm:h-[250px] lg:h-[300px] w-full">
                <UserLineChart users={users} timeRange={timeRange} />
              </div>
            )}
          </div>

          {}
          <div className="space-y-3 sm:space-y-4 lg:space-y-6">
            <PlatformHealth isLoading={isLoading} TC={TC} />
            <QuickActions
              isLoading={isLoading}
              handleQuickAction={handleQuickAction}
              TC={TC}
            />
          </div>
        </div>

        {}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 fade-in" style={{ animationDelay: '0.15s' }}>
          {}
          <RecentReports reports={reports} isLoading={isLoading} TC={TC} />

          {}
          <LatestUsers users={latestUsers} isLoading={isLoading} TC={TC} />
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
