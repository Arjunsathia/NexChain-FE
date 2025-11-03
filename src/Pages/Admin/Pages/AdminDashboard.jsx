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
          { id: 1, type: "bug", title: "Bug in trade execution flow", status: "open", createdAt: new Date().toISOString() },
          { id: 2, type: "feature", title: "Feature request: Add SOL", status: "review", createdAt: new Date(Date.now() - 86400000).toISOString() },
          { id: 3, type: "data", title: "Inaccurate price data", status: "in-progress", createdAt: new Date(Date.now() - 172800000).toISOString() },
          { id: 4, type: "ui", title: "Mobile responsive issues", status: "open", createdAt: new Date(Date.now() - 259200000).toISOString() },
        ];
        if (mounted) setReports(mockReports);
      }
    };

    const fetchRecentActivity = async () => {
      try {
        const res = await getData("/activity");
        const activityData = res?.data ?? res ?? [];
        if (mounted) setRecentActivity(Array.isArray(activityData) ? activityData : []);
      } catch (err) {
        console.error("Failed to fetch activity:", err);
        // Generate mock recent activity from users data
        const mockActivity = [
          { type: "user_registered", message: "New user registered", timestamp: new Date(Date.now() - 120000), color: "text-green-400" },
          { type: "trade_completed", message: "Trade completed", timestamp: new Date(Date.now() - 300000), color: "text-blue-400" },
          { type: "watchlist_added", message: "Watchlist added", timestamp: new Date(Date.now() - 600000), color: "text-yellow-400" },
          { type: "report_submitted", message: "Report submitted", timestamp: new Date(Date.now() - 900000), color: "text-purple-400" }
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
        setTimeout(() => mounted && setContentLoaded(true), 300);
      }
    };

    load();
    return () => { mounted = false; };
  }, []);

  // Calculate admin statistics
  const adminStats = useMemo(() => {
    const totalUsers = users.length;
    const totalCoins = Array.isArray(coins) ? coins.length : 0;
    const totalTrades = users.reduce((total, u) => total + (u.purchasedCoins?.length || 0), 0);
    const totalWatchlistItems = users.reduce((total, u) => total + (u.watchlist?.length || 0), 0);

    return {
      totalUsers,
      totalCoins,
      totalTrades,
      totalWatchlistItems
    };
  }, [users, coins]);

  // Get latest 4 users for the table
  const latestUsers = useMemo(() => {
    return [...users]
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 4)
      .map(u => ({
        id: u._id || u.id,
        name: u.name || 'Unknown',
        email: u.email || 'No email',
        role: u.role || 'user',
        joinDate: u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Unknown'
      }));
  }, [users]);

  // Quick Actions handlers
  const handleQuickAction = (action) => {
    switch (action) {
      case 'addCoin':
        console.log('Add New Coin action triggered');
        // navigate('/admin/cryptocurrencies/add');
        break;
      case 'viewUsers':
        console.log('View All Users action triggered');
        // navigate('/admin/users');
        break;
      case 'systemSettings':
        console.log('System Settings action triggered');
        // navigate('/admin/settings');
        break;
      case 'generateReport':
        console.log('Generate Report action triggered');
        // Implement report generation
        break;
      default:
        console.log('Unknown action:', action);
    }
  };

  if (isLoading) {
    return (
      <main className="flex-1 p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 min-h-screen text-white">
        <div className="space-y-4 sm:space-y-6">
          {/* Stat Cards Skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="p-4 sm:p-6 rounded-xl border border-gray-700">
                <div className="animate-pulse">
                  <div className="h-3 sm:h-4 bg-gray-700 rounded w-1/2 mb-2"></div>
                  <div className="h-4 sm:h-6 bg-gray-700 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>

          {/* Chart Skeleton */}
          <div className="p-4 sm:p-6 rounded-xl border border-gray-700">
            <div className="animate-pulse">
              <div className="h-4 sm:h-6 bg-gray-700 rounded w-1/4 mb-3 sm:mb-4"></div>
              <div className="h-32 sm:h-48 bg-gray-700 rounded"></div>
            </div>
          </div>

          {/* Reports & Users Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="p-4 sm:p-6 rounded-xl border border-gray-700">
              <div className="animate-pulse">
                <div className="h-4 sm:h-6 bg-gray-700 rounded w-1/3 mb-3 sm:mb-4"></div>
                <div className="space-y-2 sm:space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-3 sm:h-4 bg-gray-700 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-4 sm:p-6 rounded-xl border border-gray-700">
              <div className="animate-pulse">
                <div className="h-4 sm:h-6 bg-gray-700 rounded w-1/3 mb-3 sm:mb-4"></div>
                <div className="space-y-2 sm:space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-3 sm:h-4 bg-gray-700 rounded"></div>
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
    // In AdminDashboard.jsx, change the main element to:
<main
  className={`
    flex-1 p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 text-white
    transition-all duration-500 ease-in-out
    ${contentLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
  `}
>
      {/* Header */}
      <div className="mb-2 px-1 sm:px-2">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Admin Panel</h1>
        <p className="text-gray-400 text-xs sm:text-sm mt-1">
          Manage and oversee the platform activity
        </p>
      </div>

      {/* Stat Cards */}
      <div
        className={`
          grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 transition-all duration-600 ease-out px-1 sm:px-2
          ${contentLoaded ? 'opacity-100' : 'opacity-0'}
        `}
      >
        <StatCard
          title="Total Users"
          value={adminStats.totalUsers.toString()}
          icon="👥"
          description="Registered users"
          trend="+12%"
        />
        <StatCard
          title="Total Coins"
          value={adminStats.totalCoins.toString()}
          icon="🪙"
          description="Available cryptocurrencies"
          trend="+2"
        />
        <StatCard
          title="Total Trades"
          value={adminStats.totalTrades.toString()}
          icon="📊"
          description="Completed transactions"
          trend="+24%"
        />
        <StatCard
          title="Watchlist Items"
          value={adminStats.totalWatchlistItems.toString()}
          icon="⭐"
          description="User watchlist entries"
          trend="+18%"
        />
      </div>

      {/* Line Chart */}
      <div
        className={`
          p-3 sm:p-4 lg:p-6 rounded-xl border border-gray-700
          transition-all duration-700 ease-out mx-1 sm:mx-2
          ${contentLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
        `}
      >
        <h2 className="text-base sm:text-lg lg:text-xl font-semibold mb-3 sm:mb-4 text-white">User Growth</h2>
        <UserLineChart users={users} />
      </div>

      {/* Reports & Latest Users */}
      <div
        className={`
          grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 transition-all duration-800 ease-out px-1 sm:px-2
          ${contentLoaded ? 'opacity-100' : 'opacity-0'}
        `}
      >
        {/* Latest Reports */}
        <div className="p-3 sm:p-4 lg:p-6 rounded-xl border border-gray-700">
          <h2 className="text-base sm:text-lg lg:text-xl font-semibold mb-3 sm:mb-4 text-white">Latest Reports</h2>
          {reports.length === 0 ? (
            <div className="text-center py-6 sm:py-8 text-gray-400">
              <div className="text-3xl sm:text-4xl mb-1 sm:mb-2">📝</div>
              <p className="text-sm">No reports yet</p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {reports.slice(0, 4).map((report, index) => (
                <div
                  key={report.id}
                  className={`
                    p-2 sm:p-3 bg-gray-800 rounded-lg hover:bg-gray-700 cursor-pointer
                    transition-all duration-500 ease-out
                    ${contentLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}
                  `}
                  style={{ animationDelay: `${0.7 + (index * 0.1)}s` }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white text-sm sm:text-base truncate">
                        {report.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          report.status === 'open' ? 'bg-red-500/20 text-red-400' :
                          report.status === 'in-progress' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-green-500/20 text-green-400'
                        }`}>
                          {report.status}
                        </span>
                        <span className="text-xs text-gray-400 capitalize">
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
        <div className="p-3 sm:p-4 lg:p-6 rounded-xl border border-gray-700">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-white">Latest Users</h2>
            <span className="text-xs text-gray-400 px-2 py-1 rounded bg-gray-800/50">
              {latestUsers.length} users
            </span>
          </div>
          {latestUsers.length === 0 ? (
            <div className="text-center py-6 sm:py-8 text-gray-400">
              <div className="text-3xl sm:text-4xl mb-1 sm:mb-2">👥</div>
              <p className="text-sm">No users yet</p>
            </div>
          ) : (
            <ReportsTable data={latestUsers} />
          )}
        </div>
      </div>

      {/* Additional Stats Section */}
      <div
        className={`
          grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mt-4 sm:mt-6 transition-all duration-900 ease-out px-1 sm:px-2
          ${contentLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
        `}
      >
        {/* Platform Health */}
        <div className="p-3 sm:p-4 lg:p-6 rounded-xl border border-gray-700">
          <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-white">Platform Health</h3>
          <div className="space-y-2 sm:space-y-3">
            {[
              { label: "API Status", value: "Operational", status: "success" },
              { label: "Database", value: "Healthy", status: "success" },
              { label: "Server Load", value: "24%", status: "warning" },
              { label: "Uptime", value: "99.9%", status: "success" }
            ].map((item, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-gray-400 text-xs sm:text-sm">{item.label}</span>
                <span className={`text-xs sm:text-sm font-medium ${
                  item.status === 'success' ? 'text-green-400' :
                  item.status === 'warning' ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="p-3 sm:p-4 lg:p-6 rounded-xl border border-gray-700">
          <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-white">Quick Actions</h3>
          <div className="space-y-2">
            {[
              { label: "Add New Coin", action: () => handleQuickAction('addCoin') },
              { label: "View All Users", action: () => handleQuickAction('viewUsers') },
              { label: "System Settings", action: () => handleQuickAction('systemSettings') },
              { label: "Generate Report", action: () => handleQuickAction('generateReport') }
            ].map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className="w-full text-left p-2 sm:p-3 hover:bg-gray-700 rounded-lg transition-colors text-xs sm:text-sm border border-transparent hover:border-gray-600"
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>

        {/* Recent Activity Summary */}
        <div className="p-3 sm:p-4 lg:p-6 rounded-xl border border-gray-700">
          <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-white">Recent Activity</h3>
          <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
            {recentActivity.length === 0 ? (
              <div className="text-center py-4 text-gray-400">
                <p>No recent activity</p>
              </div>
            ) : (
              recentActivity.slice(0, 4).map((activity, index) => (
                <div key={index} className={`flex justify-between ${activity.color}`}>
                  <span className="truncate flex-1 pr-2">{activity.message}</span>
                  <span className="flex-shrink-0 text-gray-400">
                    {Math.floor((new Date() - new Date(activity.timestamp)) / 60000)} min ago
                  </span>
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