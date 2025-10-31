import { useState, useEffect, useMemo } from "react";
import UserLineChart from "@/Pages/Admin/Components/Dashboard/LineChart";
import ReportsTable from "@/Pages/Admin/Components/Dashboard/ReportsTable";
import StatCard from "@/Pages/Admin/Components/Dashboard/StatCard";
import { getData } from "@/api/axiosConfig";
import useCoinContext from "@/Context/CoinContext/useCoinContext";

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [contentLoaded, setContentLoaded] = useState(false);
  const { coins } = useCoinContext();

  useEffect(() => {
    let mounted = true;

    const fetchUsers = async () => {
      try {
        const res = await getData("/users");
        // Support both axios-style { data: { users: [...] } } and plain arrays
        const payload = res?.data ?? res;
        const usersList = payload?.users ?? payload ?? [];
        if (mounted) setUsers(Array.isArray(usersList) ? usersList : []);
      } catch (err) {
        console.error("Failed to fetch users:", err);
        if (mounted) setUsers([]);
      }
    };

    const fetchReports = async () => {
      // Mocked reports for now
      const mockReports = [
        { id: 1, type: "bug", title: "Bug in trade execution flow", status: "open", createdAt: new Date().toISOString() },
        { id: 2, type: "feature", title: "Feature request: Add SOL", status: "review", createdAt: new Date(Date.now() - 86400000).toISOString() },
        { id: 3, type: "data", title: "Inaccurate price data", status: "in-progress", createdAt: new Date(Date.now() - 172800000).toISOString() },
        { id: 4, type: "ui", title: "Mobile responsive issues", status: "open", createdAt: new Date(Date.now() - 259200000).toISOString() },
      ];
      if (mounted) setReports(mockReports);
    };

    const load = async () => {
      setIsLoading(true);
      setContentLoaded(false);
      try {
        await Promise.all([fetchUsers(), fetchReports()]);
      } catch (err) {
        console.error("Failed to fetch admin data:", err);
      } finally {
        setIsLoading(false);
        setTimeout(() => mounted && setContentLoaded(true), 300);
      }
    };

    load();
    return () => { mounted = false; };
  }, []); // run once on mount

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

  // Get latest 4 users for the table — non-mutating sort
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

  if (isLoading) {
    return (
      <main className="flex-1 p-4 sm:p-6 space-y-6 min-h-screen text-white">
        {/* Loading Skeleton */}
        <div className="space-y-6">
          {/* Stat Cards Skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="p-6 rounded-xl shadow-md border border-gray-700">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-700 rounded w-1/2 mb-2"></div>
                  <div className="h-6 bg-gray-700 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>

          {/* Chart Skeleton */}
          <div className="p-6 rounded-xl shadow-md border border-gray-700">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-700 rounded w-1/4 mb-4"></div>
              <div className="h-48 bg-gray-700 rounded"></div>
            </div>
          </div>

          {/* Reports & Users Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-xl border border-gray-700">
              <div className="animate-pulse">
                <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-4 bg-gray-700 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-6 rounded-xl border border-gray-700">
              <div className="animate-pulse">
                <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-4 bg-gray-700 rounded"></div>
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
        flex-1 p-4 sm:p-6 space-y-6 min-h-screen text-white
        transition-all duration-500 ease-in-out
        ${contentLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
      `}
      style={{ animationDelay: "0.3s" }}
    >
      {/* Header */}
      <div className="mb-2">
        <h1 className="text-2xl sm:text-3xl font-bold">Admin Panel</h1>
        <p className="text-gray-400 text-sm sm:text-base">
          Manage and oversee the platform activity
        </p>
      </div>

      {/* Stat Cards */}
      <div
        className={`
          grid grid-cols-2 md:grid-cols-4 gap-4 transition-all duration-600 ease-out
          ${contentLoaded ? 'opacity-100' : 'opacity-0'}
        `}
        style={{ animationDelay: "0.4s" }}
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
          p-4 sm:p-6 rounded-xl shadow-lg border border-gray-700
          transition-all duration-700 ease-out
          ${contentLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
        `}
        style={{ animationDelay: "0.5s" }}
      >
        <h2 className="text-lg sm:text-xl font-semibold mb-4 text-white">User Growth</h2>
        <UserLineChart users={users} />
      </div>

      {/* Reports & Latest Users */}
      <div
        className={`
          grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 transition-all duration-800 ease-out
          ${contentLoaded ? 'opacity-100' : 'opacity-0'}
        `}
        style={{ animationDelay: "0.6s" }}
      >
        {/* Latest Reports */}
        <div className="p-4 sm:p-6 rounded-xl shadow-lg border border-gray-700">
          <h2 className="text-lg sm:text-xl font-semibold mb-4 text-white">Latest Reports</h2>
          {reports.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <div className="text-4xl mb-2">📝</div>
              <p>No reports yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((report, index) => (
                <div
                  key={report.id}
                  className={`
                    p-3 bg-gray-800 rounded-lg hover:bg-gray-700 cursor-pointer
                    transition-all duration-500 ease-out
                    ${contentLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}
                  `}
                  style={{ animationDelay: `${0.7 + (index * 0.1)}s` }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-white text-sm sm:text-base">
                        {report.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
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
        <div className="p-4 sm:p-6 rounded-xl shadow-lg border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-white">Latest Users</h2>
            <span className="text-xs text-gray-400 px-2 py-1 rounded">
              {latestUsers.length} users
            </span>
          </div>
          {latestUsers.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <div className="text-4xl mb-2">👥</div>
              <p>No users yet</p>
            </div>
          ) : (
            <ReportsTable data={latestUsers} />
          )}
        </div>
      </div>

      {/* Additional Stats Section */}
      <div
        className={`
          grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mt-6 transition-all duration-900 ease-out
          ${contentLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
        `}
        style={{ animationDelay: "0.8s" }}
      >
        {/* Platform Health */}
        <div className="p-4 sm:p-6 rounded-xl shadow-lg border border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-white">Platform Health</h3>
          <div className="space-y-3">
            {[
              { label: "API Status", value: "Operational", status: "success" },
              { label: "Database", value: "Healthy", status: "success" },
              { label: "Server Load", value: "24%", status: "warning" },
              { label: "Uptime", value: "99.9%", status: "success" }
            ].map((item, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">{item.label}</span>
                <span className={`text-sm font-medium ${
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
        <div className="p-4 sm:p-6 rounded-xl shadow-lg border border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-white">Quick Actions</h3>
          <div className="space-y-2">
            {[
              { label: "Add New Coin", action: () => {}},
              { label: "View All Users", action: () => {} },
              { label: "System Settings", action: () => {} },
              { label: "Generate Report", action: () => {} }
            ].map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className="w-full text-left p-3 hover:bg-gray-700 rounded-lg transition-colors text-sm"
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>

        {/* Recent Activity Summary */}
        <div className="p-4 sm:p-6 rounded-xl shadow-lg border border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-white">Recent Activity</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-green-400">
              <span>New user registered</span>
              <span>2 min ago</span>
            </div>
            <div className="flex justify-between text-blue-400">
              <span>Trade completed</span>
              <span>5 min ago</span>
            </div>
            <div className="flex justify-between text-yellow-400">
              <span>Watchlist added</span>
              <span>10 min ago</span>
            </div>
            <div className="flex justify-between text-purple-400">
              <span>Report submitted</span>
              <span>15 min ago</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default AdminDashboard;
