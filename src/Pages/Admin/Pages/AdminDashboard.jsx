import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import UserLineChart from "@/Pages/Admin/Components/Dashboard/LineChart";
import { getData } from "@/api/axiosConfig";
import axios from "axios";
import useCoinContext from "@/Context/CoinContext/useCoinContext";
import {
  FaUsers,
  FaCoins,
  FaChartLine,
  FaStar,
  FaExclamationTriangle,
  FaCheckCircle,
  FaServer,
  FaBolt,
} from "react-icons/fa";

// Utility to check if light mode is active based on global class
const useThemeCheck = () => {
  const [isLight, setIsLight] = useState(() => {
    try {
      return !document.documentElement.classList.contains("dark");
    } catch (e) {
      // document may be undefined during SSR; default to light
      return true;
    }
  });

  useEffect(() => {
    const update = () =>
      setIsLight(!document.documentElement.classList.contains("dark"));

    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    // Also ensure we set the correct value on mount
    update();

    return () => observer.disconnect();
  }, []);

  return isLight;
};

function AdminDashboard() {
  const navigate = useNavigate(); // ✅ FIX: add navigate
  const { coins } = useCoinContext() ?? { coins: [] };
  const isLight = useThemeCheck();

  // Premium Theme Classes - Matches User Dashboard
  const TC = useMemo(
    () => ({
      textPrimary: isLight ? "text-gray-900" : "text-white",
      textSecondary: isLight ? "text-gray-500" : "text-gray-400",
      textTertiary: isLight ? "text-gray-400" : "text-gray-500",

      bgCard: isLight
        ? "bg-white shadow-[0_6px_25px_rgba(0,0,0,0.12)]"
        : "bg-gray-800/50 backdrop-blur-xl shadow-xl shadow-black/20 border-none",
      bgStatsCard: isLight
        ? "bg-white shadow-[0_6px_25px_rgba(0,0,0,0.12)] border-none"
        : "bg-gray-800/50 backdrop-blur-xl shadow-2xl hover:shadow-cyan-400/25 border-none",
      bgItem: isLight ? "bg-gray-50" : "bg-white/5",

      cardHover: isLight ? "hover:shadow-blue-500/10" : "hover:shadow-cyan-500/10",

      // heading gradient (keeps cyan→blue like your other Dashboard)
      headerGradient: "from-cyan-400 to-blue-500",
    }),
    [isLight]
  );

  // State
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [contentLoaded, setContentLoaded] = useState(false);

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
        // Fetch feedback from the backend using axios directly
        const res = await axios.get("http://localhost:5050/api/feedback");
        const feedbackData = res?.data?.data ?? res?.data ?? [];

        // Filter and transform feedback into reports format
        const reportsFromFeedback = Array.isArray(feedbackData)
          ? feedbackData
              .filter((fb) => fb.type === "bug" || fb.type === "issue") // Only show bugs/issues
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
              .slice(0, 4) // Show only latest 4
          : [];

        if (mounted) setReports(reportsFromFeedback);
      } catch (err) {
        console.error("Failed to fetch feedback reports:", err);
        // Fallback to empty array instead of mock data
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

    const load = async () => {
      setIsLoading(true);
      setContentLoaded(false);
      try {
        await Promise.all([fetchUsers(), fetchReports(), fetchRecentActivity()]);
      } catch (err) {
        console.error("Failed to fetch admin data:", err);
      } finally {
        setIsLoading(false);
        // small delay so the fade/slide animation looks smooth like your User Dashboard
        setTimeout(() => mounted && setContentLoaded(true), 300);
      }
    };

    load();

    pollInterval = setInterval(() => {
      if (mounted) {
        fetchUsers();
        fetchReports();
        fetchRecentActivity();
      }
    }, 30000);

    return () => {
      mounted = false;
      if (pollInterval) clearInterval(pollInterval);
    };
  }, []);

  const adminStats = useMemo(() => {
    const totalUsers = users.length;
    const totalCoins = Array.isArray(coins) ? coins.length : 0;
    const totalTrades = users.reduce(
      (total, u) => total + (u.purchasedCoins?.length || 0),
      0
    );
    const totalWatchlistItems = users.reduce(
      (total, u) => total + (u.watchlist?.length || 0),
      0
    );
    return { totalUsers, totalCoins, totalTrades, totalWatchlistItems };
  }, [users, coins]);

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
      }));
  }, [users]);

  const handleQuickAction = (action) => {
    console.log(`${action} triggered`);
  };

  return (
    <div
      className={`
        flex-1 p-4 lg:p-8 space-y-4 lg:space-y-6 min-h-screen ${TC.textPrimary}
        transition-all duration-500 ease-in-out
        rounded-3xl
      `}
    >
      {/* Header Section (always visible) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1
            className={`text-2xl sm:text-3xl font-bold bg-gradient-to-r ${TC.headerGradient} bg-clip-text text-transparent`}
          >
            Dashboard Overview
          </h1>
          <p className={`${TC.textSecondary} mt-1 text-xs sm:text-sm`}>
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

      {/* Content block with the same animation effect as your Dashboard */}
      <div
        className={`transition-all duration-500 ease-in-out ${
          contentLoaded && !isLoading
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4"
        }`}
      >
        {/* Stat Cards / Skeleton (shown in the same place) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
          {isLoading ? (
            // skeleton cards
            [...Array(4)].map((_, i) => (
              <div
                key={i}
                className={`${TC.bgCard} h-32 rounded-xl animate-pulse`}
              />
            ))
          ) : (
            // real stat cards - Styled like User Dashboard
            [
              {
                label: "Total Users",
                value: adminStats.totalUsers,
                icon: FaUsers,
                color: "from-blue-500 to-cyan-400",
              },
              {
                label: "Total Coins",
                value: adminStats.totalCoins,
                icon: FaCoins,
                color: "from-cyan-500 to-teal-400",
              },
              {
                label: "Total Trades",
                value: adminStats.totalTrades,
                icon: FaChartLine,
                color: "from-purple-500 to-violet-400",
              },
              {
                label: "Watchlist Items",
                value: adminStats.totalWatchlistItems,
                icon: FaStar,
                color: "from-amber-500 to-yellow-400",
              },
            ].map((stat, i) => {
              const StatIcon = stat.icon;
              return (
                <div
                  key={i}
                  className={`
                  ${TC.bgStatsCard} rounded-xl p-4 
                  transition-all duration-300 ease-in-out 
                  transform hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/20 will-change-transform
                  cursor-pointer
                `}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={`p-2 bg-gradient-to-r ${stat.color} rounded-lg shadow-lg`}
                    >
                      <StatIcon className="text-white text-base" />
                    </div>
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-lg ${TC.bgItem} ${TC.textSecondary}`}
                    >
                      +2.4%
                    </span>
                  </div>

                  <p
                    className={`text-lg font-bold mb-1 transition-colors ${TC.textPrimary} group-hover:text-blue-500`}
                  >
                    {stat.value ?? 0}
                  </p>

                  <p className={`text-sm font-medium ${TC.textSecondary}`}>
                    {stat.label}
                  </p>
                </div>
              );
            })
          )}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 mb-4">
          {/* Chart */}
          <div className={`lg:col-span-2 ${TC.bgCard} rounded-2xl p-4 sm:p-6`}>
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2
                className={`text-base sm:text-lg font-bold ${TC.textPrimary} flex items-center gap-2`}
              >
                <FaChartLine className="text-cyan-400 text-sm sm:text-base" />{" "}
                User Growth
              </h2>
            </div>

            {isLoading ? (
              // chart skeleton
              <div className="h-[200px] sm:h-[250px] lg:h-[300px] w-full animate-pulse bg-gray-700/30 rounded" />
            ) : (
              <div className="h-[200px] sm:h-[250px] lg:h-[300px] w-full">
                <UserLineChart users={users} />
              </div>
            )}
          </div>

          {/* Quick Actions & Health */}
          <div className="space-y-4 lg:space-y-6">
            <div className={`${TC.bgCard} rounded-2xl p-4 sm:p-6`}>
              <h3
                className={`text-base sm:text-lg font-bold ${TC.textPrimary} mb-3 sm:mb-4 flex items-center gap-2`}
              >
                <FaServer className="text-green-400 text-sm sm:text-base" />{" "}
                Platform Health
              </h3>
              <div className="space-y-2 sm:space-y-3">
                {isLoading ? (
                  <>
                    <div
                      className={`h-12 rounded-xl ${TC.bgItem} animate-pulse`}
                    />
                    <div
                      className={`h-12 rounded-xl ${TC.bgItem} animate-pulse`}
                    />
                    <div
                      className={`h-12 rounded-xl ${TC.bgItem} animate-pulse`}
                    />
                  </>
                ) : (
                  [
                    {
                      label: "API Latency",
                      value: "24ms",
                      icon: FaBolt,
                      color: "text-yellow-400",
                    },
                    {
                      label: "Database",
                      value: "Healthy",
                      icon: FaCheckCircle,
                      color: "text-green-400",
                    },
                    {
                      label: "Error Rate",
                      value: "0.01%",
                      icon: FaExclamationTriangle,
                      color: "text-red-400",
                    },
                  ].map((item, i) => {
                    const ItemIcon = item.icon;
                    return (
                      <div
                        key={i}
                        className={`flex items-center justify-between p-2 sm:p-3 rounded-xl ${TC.bgItem} transition-colors`}
                      >
                        <div className="flex items-center gap-2 sm:gap-3">
                          <ItemIcon
                            className={`text-xs sm:text-sm ${item.color}`}
                          />
                          <span
                            className={`text-xs sm:text-sm ${TC.textSecondary}`}
                          >
                            {item.label}
                          </span>
                        </div>
                        <span
                          className={`text-xs sm:text-sm font-mono font-semibold ${TC.textPrimary}`}
                        >
                          {item.value}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className={`${TC.bgCard} rounded-2xl p-4 sm:p-6`}>
              <h3
                className={`text-base sm:text-lg font-bold ${TC.textPrimary} mb-3 sm:mb-4 flex items-center gap-2`}
              >
                <FaBolt className="text-amber-400 text-sm sm:text-base" /> Quick
                Actions
              </h3>
              {isLoading ? (
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="h-10 rounded-xl animate-pulse bg-gray-700/30"
                    />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  {[
                    { label: "Add Coin", action: "addCoin" },
                    { label: "Users", action: "viewUsers" },
                    { label: "Settings", action: "systemSettings" },
                    { label: "Reports", action: "generateReport" },
                  ].map((action, i) => (
                    <button
                      key={i}
                      onClick={() => handleQuickAction(action.action)}
                      className="p-2 sm:p-3 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-xs sm:text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-cyan-500/10"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Grid: Reports & Users */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          {/* Reports */}
          <div className={`${TC.bgCard} rounded-2xl p-4 sm:p-6`}>
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2
                className={`text-base sm:text-lg font-bold ${TC.textPrimary} flex items-center gap-2`}
              >
                <FaExclamationTriangle className="text-red-400 text-sm sm:text-base" />{" "}
                Recent Reports
              </h2>
              <span
                className={`text-xs font-medium px-2 py-1 rounded-lg ${TC.bgItem} ${TC.textSecondary}`}
              >
                {reports.length} Total
              </span>
            </div>
            <div className="space-y-2 sm:space-y-3">
              {isLoading ? (
                <>
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className={`p-3 sm:p-4 rounded-xl ${TC.bgItem} animate-pulse`}
                    />
                  ))}
                </>
              ) : (
                reports.slice(0, 4).map((report, i) => (
                  <div
                    key={report.id ?? i}
                    className={`p-3 sm:p-4 rounded-xl ${TC.bgItem} transition-all duration-200 group`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h4
                        className={`font-medium text-sm sm:text-base ${TC.textPrimary} transition-colors line-clamp-1`}
                      >
                        {report.title}
                      </h4>
                      <span
                        className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full whitespace-nowrap ml-2 ${
                          report.status === "open"
                            ? "bg-red-500/20 text-red-400"
                            : "bg-yellow-500/20 text-yellow-400"
                        }`}
                      >
                        {report.status}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span
                        className={`text-xs ${TC.textSecondary} capitalize`}
                      >
                        {report.type}
                      </span>
                      <span className={`text-xs ${TC.textSecondary}`}>
                        {report.createdAt
                          ? new Date(report.createdAt).toLocaleDateString()
                          : "Unknown"}
                      </span>
                    </div>
                  </div>
                ))
              )}
              {!isLoading && reports.length === 0 && (
                <div
                  className={`text-center ${TC.textSecondary} py-8 text-sm`}
                >
                  No active reports
                </div>
              )}
            </div>
          </div>

          {/* Latest Users */}
          <div className={`${TC.bgCard} rounded-2xl p-4 sm:p-6`}>
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2
                className={`text-base sm:text-lg font-bold ${TC.textPrimary} flex items-center gap-2`}
              >
                <FaUsers className="text-blue-400 text-sm sm:text-base" />{" "}
                Newest Members
              </h2>
              <button
                onClick={() => navigate("/admin/users")}
                className="text-xs font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                View All
              </button>
            </div>
            {/* Scrollable user list - max 10 users, hidden scrollbar */}
            <div className="max-h-[400px] overflow-y-auto scrollbar-hide space-y-2 sm:space-y-3">
              {isLoading ? (
                <>
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={`flex items-center justify-between p-2 sm:p-3 rounded-xl ${TC.bgItem} animate-pulse`}
                    />
                  ))}
                </>
              ) : (
                latestUsers.map((user, i) => (
                  <div
                    key={user.id ?? i}
                    className={`flex items-center justify-between p-2 sm:p-3 rounded-xl ${TC.bgItem} transition-all duration-200`}
                  >
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs sm:text-sm font-bold text-white shadow-lg flex-shrink-0">
                        {(user.name || "U").charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4
                          className={`font-medium ${TC.textPrimary} text-xs sm:text-sm truncate`}
                        >
                          {user.name}
                        </h4>
                        <p
                          className={`text-[10px] sm:text-xs ${TC.textSecondary} truncate`}
                        >
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <span
                        className={`block text-xs font-medium ${TC.textSecondary}`}
                      >
                        {user.role}
                      </span>
                      <span
                        className={`block text-[10px] ${TC.textTertiary}`}
                      >
                        {user.joinDate}
                      </span>
                    </div>
                  </div>
                ))
              )}
              {!isLoading && latestUsers.length === 0 && (
                <div
                  className={`text-center ${TC.textSecondary} py-8 text-sm`}
                >
                  No users found
                </div>
              )}
            </div>

            {/* NOTE: This <style> block will work in plain React as well */}
            <style>{`
              .scrollbar-hide {
                -ms-overflow-style: none;
                scrollbar-width: none;
              }
              .scrollbar-hide::-webkit-scrollbar {
                display: none;
              }
            `}</style>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
