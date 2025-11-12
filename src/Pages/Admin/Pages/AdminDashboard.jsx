import { useState, useEffect, useMemo } from "react";
import UserLineChart from "@/Pages/Admin/Components/Dashboard/LineChart";
import ReportsTable from "@/Pages/Admin/Components/Dashboard/ReportsTable";
import StatCard from "@/Pages/Admin/Components/Dashboard/StatCard";
import { getData } from "@/api/axiosConfig";
import useCoinContext from "@/Context/CoinContext/useCoinContext";

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [contentLoaded, setContentLoaded] = useState(false);
  const { coins } = useCoinContext();

  useEffect(() => {
    let mounted = true;

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
        const res = await getData("/reports");
        const reportsData = res?.data ?? res ?? [];
        if (mounted) setReports(Array.isArray(reportsData) ? reportsData : []);
      } catch (err) {
        console.error("Failed to fetch reports:", err);
        // Mocked reports for fallback
        const mockReports = [
          {
            id: 1,
            type: "bug",
            title: "Bug in trade execution flow",
            status: "open",
            createdAt: new Date().toISOString(),
          },
          {
            id: 2,
            type: "feature",
            title: "Feature request: Add SOL",
            status: "review",
            createdAt: new Date(Date.now() - 86400000).toISOString(),
          },
          {
            id: 3,
            type: "data",
            title: "Inaccurate price data",
            status: "in-progress",
            createdAt: new Date(Date.now() - 172800000).toISOString(),
          },
          {
            id: 4,
            type: "ui",
            title: "Mobile responsive issues",
            status: "open",
            createdAt: new Date(Date.now() - 259200000).toISOString(),
          },
        ];
        if (mounted) setReports(mockReports);
      }
    };

    const fetchRecentActivity = async () => {
      try {
        const res = await getData("/activity");
        const activityData = res?.data ?? res ?? [];
        if (mounted)
          setRecentActivity(Array.isArray(activityData) ? activityData : []);
      } catch (err) {
        console.error("Failed to fetch activity:", err);
        // Generate mock recent activity from users data
        const mockActivity = [
          {
            type: "user_registered",
            message: "New user registered",
            timestamp: new Date(Date.now() - 120000),
            color: "text-green-400",
          },
          {
            type: "trade_completed",
            message: "Trade completed",
            timestamp: new Date(Date.now() - 300000),
            color: "text-blue-400",
          },
          {
            type: "watchlist_added",
            message: "Watchlist added",
            timestamp: new Date(Date.now() - 600000),
            color: "text-yellow-400",
          },
          {
            type: "report_submitted",
            message: "Report submitted",
            timestamp: new Date(Date.now() - 900000),
            color: "text-purple-400",
          },
        ];
        if (mounted) setRecentActivity(mockActivity);
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
        ]);
      } catch (err) {
        console.error("Failed to fetch admin data:", err);
      } finally {
        setIsLoading(false);
        setTimeout(() => mounted && setContentLoaded(true), 300);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  // Calculate admin statistics
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

    return {
      totalUsers,
      totalCoins,
      totalTrades,
      totalWatchlistItems,
    };
  }, [users, coins]);

  // Get latest 4 users for the table
  const latestUsers = useMemo(() => {
    return [...users]
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 4)
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

  // Quick Actions handlers
  const handleQuickAction = (action) => {
    switch (action) {
      case "addCoin":
        console.log("Add New Coin action triggered");
        // navigate('/admin/cryptocurrencies/add');
        break;
      case "viewUsers":
        console.log("View All Users action triggered");
        // navigate('/admin/users');
        break;
      case "systemSettings":
        console.log("System Settings action triggered");
        // navigate('/admin/settings');
        break;
      case "generateReport":
        console.log("Generate Report action triggered");
        // Implement report generation
        break;
      default:
        console.log("Unknown action:", action);
    }
  };

  if (isLoading) {
    return (
      <main className="flex-1 p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 min-h-screen text-white">
        <div className="space-y-4 sm:space-y-6">
          {/* Stat Cards Skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4 sm:p-6 shadow-xl"
              >
                <div className="animate-pulse">
                  <div className="h-3 sm:h-4 bg-gray-700 rounded w-1/2 mb-2"></div>
                  <div className="h-4 sm:h-6 bg-gray-700 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>

          {/* Chart Skeleton */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4 sm:p-6 shadow-xl">
            <div className="animate-pulse">
              <div className="h-4 sm:h-6 bg-gray-700 rounded w-1/4 mb-3 sm:mb-4"></div>
              <div className="h-32 sm:h-48 bg-gray-700 rounded-lg"></div>
            </div>
          </div>

          {/* Reports & Users Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4 sm:p-6 shadow-xl">
              <div className="animate-pulse">
                <div className="h-4 sm:h-6 bg-gray-700 rounded w-1/3 mb-3 sm:mb-4"></div>
                <div className="space-y-2 sm:space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="h-3 sm:h-4 bg-gray-700 rounded"
                    ></div>
                  ))}
                </div>
              </div>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4 sm:p-6 shadow-xl">
              <div className="animate-pulse">
                <div className="h-4 sm:h-6 bg-gray-700 rounded w-1/3 mb-3 sm:mb-4"></div>
                <div className="space-y-2 sm:space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="h-3 sm:h-4 bg-gray-700 rounded"
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main
      className={`
        flex-1 p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 text-white
        transition-all duration-500 ease-in-out
        ${
          contentLoaded
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4"
        }
      `}
    >
      {/* Header */}
      <div className="mb-2 px-1 sm:px-2 text-center sm:text-left">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-t from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          Admin Panel
        </h1>

        <p className="text-gray-400 mt-1 sm:mt-2 text-xs sm:text-sm">
          Manage and oversee the platform activity
        </p>
      </div>

      {/* Stat Cards */}
      <div
        className={`
    grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 transition-all duration-600 ease-out
    ${contentLoaded ? "opacity-100" : "opacity-0"}
  `}
      >
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4 shadow-xl transition-all duration-300 hover:scale-105 group cursor-pointer">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-lg shadow-lg">
              <span className="text-white text-base">👥</span>
            </div>
            {/* <div className="flex items-center gap-1 text-xs font-semibold text-green-400">
              <span>+12%</span>
            </div> */}
          </div>

          <p className="text-lg font-bold text-white mb-1 group-hover:text-cyan-300 transition-colors">
            {adminStats.totalUsers.toString()}
          </p>

          <p className="text-sm text-gray-400 font-medium">Total Users</p>
          <p className="text-xs text-gray-500 mt-1">Registered users</p>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4 shadow-xl transition-all duration-300 hover:scale-105 group cursor-pointer">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-400 rounded-lg shadow-lg">
              <span className="text-white text-base">🪙</span>
            </div>
            {/* <div className="flex items-center gap-1 text-xs font-semibold text-green-400">
              <span>+2</span>
            </div> */}
          </div>

          <p className="text-lg font-bold text-white mb-1 group-hover:text-cyan-300 transition-colors">
            {adminStats.totalCoins.toString()}
          </p>

          <p className="text-sm text-gray-400 font-medium">Total Coins</p>
          <p className="text-xs text-gray-500 mt-1">
            Available cryptocurrencies
          </p>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4 shadow-xl transition-all duration-300 hover:scale-105 group cursor-pointer">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-violet-400 rounded-lg shadow-lg">
              <span className="text-white text-base">📊</span>
            </div>
            {/* <div className="flex items-center gap-1 text-xs font-semibold text-green-400">
              <span>+24%</span>
            </div> */}
          </div>

          <p className="text-lg font-bold text-white mb-1 group-hover:text-cyan-300 transition-colors">
            {adminStats.totalTrades.toString()}
          </p>

          <p className="text-sm text-gray-400 font-medium">Total Trades</p>
          <p className="text-xs text-gray-500 mt-1">Completed transactions</p>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4 shadow-xl transition-all duration-300 hover:scale-105 group cursor-pointer">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-gradient-to-r from-amber-500 to-yellow-400 rounded-lg shadow-lg">
              <span className="text-white text-base">⭐</span>
            </div>
            {/* <div className="flex items-center gap-1 text-xs font-semibold text-green-400">
              <span>+18%</span>
            </div> */}
          </div>

          <p className="text-lg font-bold text-white mb-1 group-hover:text-cyan-300 transition-colors">
            {adminStats.totalWatchlistItems.toString()}
          </p>

          <p className="text-sm text-gray-400 font-medium">Watchlist Items</p>
          <p className="text-xs text-gray-500 mt-1">User watchlist entries</p>
        </div>
      </div>

      {/* Line Chart */}
      <div
        className={`
          bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4 sm:p-6 shadow-xl
          transition-all duration-700 ease-out
          ${
            contentLoaded
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-4"
          }
        `}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <div className="p-2 bg-cyan-400/10 rounded-lg">
              <span className="text-cyan-400">📈</span>
            </div>
            User Growth
          </h2>
          <div className="flex items-center gap-2 text-sm bg-green-400/10 px-3 py-1.5 rounded-full border border-green-400/20">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-green-400 font-semibold">Live</span>
          </div>
        </div>
        <UserLineChart users={users} />
      </div>

      {/* Reports & Latest Users */}
      <div
        className={`
          grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 transition-all duration-800 ease-out
          ${contentLoaded ? "opacity-100" : "opacity-0"}
        `}
      >
        {/* Latest Reports */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4 sm:p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <div className="p-2 bg-red-400/10 rounded-lg">
                <span className="text-red-400">📝</span>
              </div>
              Latest Reports
            </h2>
            <span className="text-xs font-bold text-gray-300 bg-gray-700 px-2 py-1 rounded-full">
              {reports.length} {reports.length === 1 ? "Report" : "Reports"}
            </span>
          </div>
          {reports.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-gray-700 rounded-lg bg-gray-800/20">
              <div className="text-5xl mb-3">📝</div>
              <p className="text-gray-300 text-base font-semibold mb-1">
                No reports yet
              </p>
              <p className="text-gray-500 text-sm">All systems operational</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reports.slice(0, 4).map((report, index) => (
                <div
                  key={report.id}
                  className={`
                    p-3 bg-gradient-to-br from-gray-800/50 to-gray-800/30 rounded-lg border border-gray-700 
                    hover:border-cyan-400/50 cursor-pointer transition-all duration-200 group
                    ${
                      contentLoaded
                        ? "opacity-100 translate-x-0"
                        : "opacity-0 -translate-x-4"
                    }
                  `}
                  style={{ animationDelay: `${0.7 + index * 0.1}s` }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white text-sm sm:text-base group-hover:text-cyan-300 transition-colors truncate">
                        {report.title}
                      </p>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-semibold ${
                            report.status === "open"
                              ? "bg-red-500/20 text-red-400 border border-red-500/30"
                              : report.status === "in-progress"
                              ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                              : "bg-green-500/20 text-green-400 border border-green-500/30"
                          }`}
                        >
                          {report.status}
                        </span>
                        <span className="text-xs text-gray-400 capitalize bg-gray-700 px-2 py-1 rounded-full">
                          {report.type}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(report.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Latest Users */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4 sm:p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <div className="p-2 bg-blue-400/10 rounded-lg">
                <span className="text-blue-400">👥</span>
              </div>
              Latest Users
            </h2>
            <span className="text-xs font-bold text-gray-300 bg-gray-700 px-2 py-1 rounded-full">
              {latestUsers.length} users
            </span>
          </div>
          {latestUsers.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-gray-700 rounded-lg bg-gray-800/20">
              <div className="text-5xl mb-3">👥</div>
              <p className="text-gray-300 text-base font-semibold mb-1">
                No users yet
              </p>
              <p className="text-gray-500 text-sm">Users will appear here</p>
            </div>
          ) : (
            <ReportsTable data={latestUsers} />
          )}
        </div>
      </div>

      {/* Additional Stats Section */}
      <div
        className={`
          grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 transition-all duration-900 ease-out
          ${
            contentLoaded
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-4"
          }
        `}
      >
        {/* Platform Health */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4 sm:p-6 shadow-xl">
          <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
            <div className="p-2 bg-green-400/10 rounded-lg">
              <span className="text-green-400">💚</span>
            </div>
            Platform Health
          </h3>
          <div className="space-y-3">
            {[
              { label: "API Status", value: "Operational", status: "success" },
              { label: "Database", value: "Healthy", status: "success" },
              { label: "Server Load", value: "24%", status: "warning" },
              { label: "Uptime", value: "99.9%", status: "success" },
            ].map((item, index) => (
              <div
                key={index}
                className="flex justify-between items-center p-2 bg-gray-800/30 rounded-lg border border-gray-700"
              >
                <span className="text-gray-400 text-sm">{item.label}</span>
                <span
                  className={`text-sm font-bold px-2 py-1 rounded-full ${
                    item.status === "success"
                      ? "bg-green-500/20 text-green-400 border border-green-500/30"
                      : item.status === "warning"
                      ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                      : "bg-red-500/20 text-red-400 border border-red-500/30"
                  }`}
                >
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4 sm:p-6 shadow-xl">
          <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
            <div className="p-2 bg-purple-400/10 rounded-lg">
              <span className="text-purple-400">⚡</span>
            </div>
            Quick Actions
          </h3>
          <div className="space-y-2">
            {[
              {
                label: "Add New Coin",
                action: () => handleQuickAction("addCoin"),
                icon: "🪙",
              },
              {
                label: "View All Users",
                action: () => handleQuickAction("viewUsers"),
                icon: "👥",
              },
              {
                label: "System Settings",
                action: () => handleQuickAction("systemSettings"),
                icon: "⚙️",
              },
              {
                label: "Generate Report",
                action: () => handleQuickAction("generateReport"),
                icon: "📊",
              },
            ].map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className="w-full text-left p-3 bg-gradient-to-br from-gray-800/50 to-gray-800/30 hover:from-cyan-500/10 hover:to-blue-500/10 rounded-lg transition-all duration-200 text-sm border border-gray-700 hover:border-cyan-400/50 group flex items-center gap-3"
              >
                <span className="text-base">{action.icon}</span>
                <span className="text-white group-hover:text-cyan-300 transition-colors font-medium">
                  {action.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Activity Summary */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4 sm:p-6 shadow-xl">
          <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
            <div className="p-2 bg-yellow-400/10 rounded-lg">
              <span className="text-yellow-400">🔔</span>
            </div>
            Recent Activity
          </h3>
          <div className="space-y-3">
            {recentActivity.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-gray-700 rounded-lg bg-gray-800/20">
                <div className="text-4xl mb-3">🔔</div>
                <p className="text-gray-300 text-sm font-semibold mb-1">
                  No recent activity
                </p>
                <p className="text-gray-500 text-xs">
                  Activity will appear here
                </p>
              </div>
            ) : (
              recentActivity.slice(0, 4).map((activity, index) => (
                <div
                  key={index}
                  className={`p-3 bg-gradient-to-br from-gray-800/50 to-gray-800/30 rounded-lg border border-gray-700 transition-all duration-200 hover:scale-105 ${activity.color}`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-sm truncate flex-1 pr-2">
                      {activity.message}
                    </span>
                    <span className="text-xs text-gray-400 flex-shrink-0 bg-gray-700 px-2 py-1 rounded-full">
                      {Math.floor(
                        (new Date() - new Date(activity.timestamp)) / 60000
                      )}{" "}
                      min ago
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default AdminDashboard;
