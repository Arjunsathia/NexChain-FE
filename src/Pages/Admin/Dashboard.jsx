import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from "react-router-dom";
import UserLineChart from "@/Components/Admin/Dashboard/LineChart";
import StatCard from "@/Components/Admin/Dashboard/StatCard";
import RecentReports from "@/Components/Admin/Dashboard/RecentReports";
import LatestUsers from "@/Components/Admin/Dashboard/LatestUsers";
import PlatformHealth from "@/Components/Admin/Dashboard/PlatformHealth";
import QuickActions from "@/Components/Admin/Dashboard/QuickActions";
import { getData, default as api } from "@/api/axiosConfig";
import MarketCoinDetailsModal from "@/Components/Admin/MarketInsights/MarketCoinDetailsModal";
import { getTrendingCoinMarketData } from "@/api/coinApis";


import {
  FaUsers,
  FaCoins,
  FaChartLine,
  FaStar,
  FaTimes,
} from "react-icons/fa";
import useThemeCheck from "@/hooks/useThemeCheck";


const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
const formatCompactNumber = (number) => new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(number);

function AdminDashboard() {
  const navigate = useNavigate();
  const isLight = useThemeCheck();

  const TC = useMemo(
    () => ({
      textPrimary: isLight ? "text-gray-900" : "text-white",
      textSecondary: isLight ? "text-gray-500" : "text-gray-400",
      textTertiary: isLight ? "text-gray-400" : "text-gray-500",

      // Chromium Compositor Fix: Disable heavy backdrop-blur in dark mode to stop 1px pixel-snapping flicker
      // Premium Glassmorphism Cards - Optimized for stability
      bgCard: isLight
        ? "bg-white/70 backdrop-blur-xl shadow-[0_6px_25px_rgba(0,0,0,0.12),0_0_10px_rgba(0,0,0,0.04)] border border-gray-100 glass-card"
        : "bg-gray-900/95 backdrop-blur-none shadow-xl border border-gray-700/50 ring-1 ring-white/5 glass-card",

      bgStatsCard: isLight
        ? "bg-white/70 backdrop-blur-xl shadow-[0_6px_25px_rgba(0,0,0,0.12),0_0_10px_rgba(0,0,0,0.04)] border border-gray-100 glass-card hover:bg-white/80"
        : "bg-gray-900/95 backdrop-blur-none shadow-xl border border-gray-700/50 ring-1 ring-white/5 glass-card hover:bg-gray-800/80",

      // bgItem: Transparent in dark mode with refined hover for cleaner look
      bgItem: isLight
        ? "bg-gray-50/50 hover:bg-gray-100/50 border border-gray-100 isolation-isolate"
        : "bg-transparent hover:bg-white/5 border border-white/5 isolation-isolate",

      modalOverlay: "bg-black/40 backdrop-blur-sm",
      modalContent: isLight ? "bg-white" : "bg-[#0B0E11] border border-gray-800 prevent-seam force-layer glass-card",

      cardHover: isLight ? "hover:shadow-blue-500/20" : "hover:shadow-cyan-500/20",

      headerGradient: "from-blue-600 to-cyan-500",
    }),
    [isLight]
  );

  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [trendingCoinData, setTrendingCoinData] = useState(null);

  // Granular loading states
  const [isUsersLoading, setIsUsersLoading] = useState(true);
  const [isReportsLoading, setIsReportsLoading] = useState(true);
  const [isActivityLoading, setIsActivityLoading] = useState(true);
  const [isTrendingLoading, setIsTrendingLoading] = useState(true);
  const [isStatsLoading, setIsStatsLoading] = useState(true);


  const [timeRange, setTimeRange] = useState("Month");
  const [platformStats, setPlatformStats] = useState({ tradesToday: 0 });
  const [isTradesModalOpen, setIsTradesModalOpen] = useState(false);
  const [todayTransactions, setTodayTransactions] = useState([]);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [selectedCoinDetails, setSelectedCoinDetails] = useState(null);

  useEffect(() => {
    let mounted = true;
    let pollInterval;

    const fetchUsers = async () => {
      // Don't set loading on updates to prevent UI flash
      if (users.length === 0) setIsUsersLoading(true);
      try {
        const res = await getData("/users");
        const payload = res?.data ?? res;
        const usersList = payload?.users ?? payload ?? [];
        if (mounted) {
          const newList = Array.isArray(usersList) ? usersList : [];
          setUsers(prev => {
            if (JSON.stringify(prev) === JSON.stringify(newList)) return prev;
            return newList;
          });
        }
      } catch (err) {
        console.error("Failed to fetch users:", err);
        if (mounted && users.length === 0) setUsers([]);
      } finally {
        if (mounted) setIsUsersLoading(false);
      }
    };

    const fetchReports = async () => {
      if (reports.length === 0) setIsReportsLoading(true);
      try {
        const res = await getData("/feedback");
        const feedbackData = res?.data ?? res ?? [];
        const reportsFromFeedback = Array.isArray(feedbackData)
          ? feedbackData
            .filter((fb) => fb && (fb.type === "bug" || fb.type === "issue"))
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

        if (mounted) {
          setReports(prev => {
            if (JSON.stringify(prev) === JSON.stringify(reportsFromFeedback)) return prev;
            return reportsFromFeedback;
          });
        }
      } catch (err) {
        console.error("Failed to fetch feedback reports:", err);
        if (mounted && reports.length === 0) setReports([]);
      } finally {
        if (mounted) setIsReportsLoading(false);
      }
    };

    const fetchRecentActivity = async () => {
      if (recentActivity.length === 0) setIsActivityLoading(true);
      try {
        const res = await getData("/activity");
        const activityData = res?.data ?? res ?? [];
        const newList = Array.isArray(activityData) ? activityData : [];
        if (mounted) {
          setRecentActivity(prev => {
            if (JSON.stringify(prev) === JSON.stringify(newList)) return prev;
            return newList;
          });
        }
      } catch {
        // Fallback mock data if endpoint fails
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
        if (mounted) {
          setRecentActivity(prev => {
            if (JSON.stringify(prev) === JSON.stringify(mockActivity)) return prev;
            return mockActivity;
          });
        }
      } finally {
        if (mounted) setIsActivityLoading(false);
      }
    };

    const fetchTrendingCoin = async () => {
      if (!trendingCoinData) setIsTrendingLoading(true);
      try {
        const res = await getData("/watchlist/trending");
        const data = res?.data ?? res;
        if (mounted) {
          setTrendingCoinData(prev => {
            if (JSON.stringify(prev) === JSON.stringify(data)) return prev;
            return data;
          });
        }
      } catch (err) {
        console.error("Failed to fetch trending coin:", err);
      } finally {
        if (mounted) setIsTrendingLoading(false);
      }
    };

    const fetchPlatformStats = async () => {
      if (platformStats.tradesToday === 0) setIsStatsLoading(true);
      try {
        const res = await api.get('/purchases/platform-stats');
        if (res.data.success && mounted) {
          const newStats = { tradesToday: res.data.stats.tradesToday };
          setPlatformStats(prev => {
            if (prev.tradesToday === newStats.tradesToday) return prev;
            return newStats;
          });
        }
      } catch (err) {
        console.error("Failed to fetch platform stats:", err);
      } finally {
        if (mounted) setIsStatsLoading(false);
      }
    };

    fetchUsers();
    fetchReports();
    fetchRecentActivity();
    fetchTrendingCoin();
    fetchPlatformStats();



    pollInterval = setInterval(() => {
      if (mounted) {
        fetchUsers();
        fetchReports();
        fetchRecentActivity();
        fetchTrendingCoin();
        fetchPlatformStats();
      }
    }, 30000);

    return () => {
      mounted = false;
      if (pollInterval) clearInterval(pollInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const adminStats = useMemo(() => {
    const totalUsers = users.length;
    const totalCoins = 150;
    const trending = trendingCoinData || { symbol: "BTC", price_change_percentage_24h: 2.45 };

    return {
      totalUsers,
      totalCoins,
      tradesToday: platformStats.tradesToday,
      trendingCoin: trending
    };
  }, [users, trendingCoinData, platformStats]);

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

  const handleTradeCardClick = async () => {
    setIsTradesModalOpen(true);
    setIsModalLoading(true);
    try {
      const res = await api.get('/purchases/today-transactions');
      if (res.data.success) {
        setTodayTransactions(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch detailed transactions", err);
    } finally {
      setIsModalLoading(false);
    }
  };

  const handleTrendingCardClick = async () => {
    let coinId = trendingCoinData?.id || trendingCoinData?.item?.id;

    if (!coinId) {
      coinId = "bitcoin";
    }

    if (coinId) {
      try {
        const marketData = await getTrendingCoinMarketData([coinId]);
        if (marketData && marketData.length > 0) {
          setSelectedCoinDetails(marketData[0]);
        }
      } catch (error) {
        console.error("Failed to fetch trending coin details", error);
      }
    }
  };

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
    <>
      <div
        className={`min-h-screen p-2 sm:p-4 lg:p-6 ${TC.textPrimary} overflow-x-hidden`}
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="fade-in" style={{ animationDelay: "0.1s" }}>
            <h1 className={`text-2xl lg:text-3xl font-bold tracking-tight mb-1 ${TC.textPrimary}`}>
              Admin <span className="bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">Dashboard</span>
            </h1>
            <p className={`text-sm font-medium ${TC.textSecondary}`}>
              Real-time platform monitoring and management
            </p>
          </div>

          <div className="flex items-center gap-3 fade-in" style={{ animationDelay: "0.2s" }}>
            {(isUsersLoading || isStatsLoading || isActivityLoading) && (
              <div className={`flex items-center text-xs font-medium backdrop-blur-sm px-4 py-2 rounded-full border shadow-sm ${isLight ? 'bg-white/50 border-gray-100 text-gray-500' : 'bg-gray-800/50 border-gray-700 text-gray-400'}`}>
                <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2" />
                Updating live data...
              </div>
            )}
            {!isUsersLoading && !isStatsLoading && !isActivityLoading && (
              <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 text-green-400 text-xs font-medium shadow-sm border border-green-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                System Operational
              </span>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col gap-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 fade-in" style={{ animationDelay: "0.3s" }}>
            {[
              {
                label: "Total Users",
                value: adminStats.totalUsers,
                icon: FaUsers,
                color: "from-blue-500 to-cyan-400",
                badge: "+12%",
                onClick: () => navigate('/admin/users'),
                isLoading: isUsersLoading
              },
              {
                label: "Active Coins",
                value: adminStats.totalCoins,
                icon: FaCoins,
                color: "from-purple-500 to-pink-400",
                badge: "+5 new",
                onClick: () => navigate('/admin/cryptocurrencies'),
                isLoading: false
              },
              {
                label: "Trades Today",
                value: adminStats.tradesToday || 0,
                icon: FaChartLine,
                color: "from-green-500 to-emerald-400",
                badge: "+8.2%",
                onClick: handleTradeCardClick,
                isLoading: isStatsLoading
              },
              {
                label: "Trending Coin",
                value: adminStats.trendingCoin ? adminStats.trendingCoin.symbol?.toUpperCase() : "N/A",
                icon: FaStar,
                color: "from-amber-500 to-yellow-400",
                badge: (adminStats.trendingCoin && adminStats.trendingCoin.price_change_percentage_24h != null)
                  ? `${Number(adminStats.trendingCoin.price_change_percentage_24h).toFixed(2)}%`
                  : "No data",
                onClick: handleTrendingCardClick,
                isLoading: isTrendingLoading
              },
            ].map((stat, i) => (
              <StatCard key={i} {...stat} TC={TC} />
            ))}
          </div>

          {/* Charts & Actions Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 fade-in" style={{ animationDelay: "0.4s" }}>
            {/* Main Chart Card (User Registration) */}
            <div className={`lg:col-span-2 ${TC.bgCard} rounded-2xl p-5 sm:p-6 relative overflow-hidden group`}>
              {/* Background Decorative Gradient */}


              <div className="flex items-center justify-between mb-6 relative z-10">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl transition-transform duration-300 group-hover:scale-110 shadow-sm ${isLight ? 'bg-cyan-50 text-cyan-600' : 'bg-cyan-500/10 text-cyan-400'}`}>
                    <FaChartLine className="text-lg" />
                  </div>
                  <div>
                    <h2 className={`text-lg font-bold tracking-tight ${TC.textPrimary} flex items-center gap-2`}>
                      User Registration
                    </h2>
                  </div>
                </div>

                {/* Range Selector */}
                <div className={`flex items-center p-1 rounded-xl ${isLight ? 'bg-gray-100/80' : 'bg-gray-800/50 border border-white/5'}`}>
                  {['Week', 'Month'].map((range) => (
                    <button
                      key={range}
                      onClick={() => setTimeRange(range)}
                      className={`
                      px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-300
                      ${timeRange === range
                          ? (isLight ? 'bg-white text-cyan-600 shadow-sm' : 'bg-gray-700 text-white shadow-sm border border-white/5')
                          : (isLight ? 'text-gray-500 hover:text-gray-900' : 'text-gray-400 hover:text-white')}
                    `}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              </div>

              {isUsersLoading ? (
                <div className="h-[200px] sm:h-[250px] lg:h-[300px] w-full animate-pulse bg-gray-700/10 rounded-xl" />
              ) : (
                <div className="h-[200px] sm:h-[250px] lg:h-[300px] w-full relative z-10">
                  <UserLineChart users={users} timeRange={timeRange} />
                </div>
              )}
            </div>

            {/* Side Actions */}
            <div className="flex flex-col gap-6">
              <PlatformHealth isLoading={false} TC={TC} />
              <QuickActions
                isLoading={false}
                handleQuickAction={handleQuickAction}
                TC={TC}
              />
            </div>
          </div>

          {/* Bottom Reports & Users */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 fade-in" style={{ animationDelay: "0.5s" }}>
            <RecentReports reports={reports} isLoading={isReportsLoading} TC={TC} />
            <LatestUsers users={latestUsers} isLoading={isUsersLoading} TC={TC} />
          </div>
        </div>
      </div>


      {/* Market Coin Details Modal */}
      <MarketCoinDetailsModal
        selectedCoin={selectedCoinDetails}
        setSelectedCoin={setSelectedCoinDetails}
        TC={TC}
        isLight={isLight}
        formatCurrency={formatCurrency}
        formatCompactNumber={formatCompactNumber}
      />

      {/* Trades Modal */}
      {
        isTradesModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className={`w-full max-w-4xl max-h-[80vh] overflow-hidden rounded-2xl ${TC.bgCard} shadow-2xl flex flex-col slide-in`}>
              <div className="p-4 sm:p-6 border-b border-gray-200/10 flex justify-between items-center">
                <h2 className={`text-xl font-bold ${TC.textPrimary}`}>Today&apos;s Transactions</h2>
                <button onClick={() => setIsTradesModalOpen(false)} className={`p-2 rounded-lg hover:bg-gray-100/10 ${TC.textSecondary}`}>
                  <FaTimes />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
                {isModalLoading ? (
                  <div className="flex justify-center p-8">
                    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : todayTransactions.length === 0 ? (
                  <div className={`text-center py-10 ${TC.textSecondary}`}>No transactions found for today.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className={`border-b border-gray-200/10 text-xs font-semibold uppercase tracking-wider ${TC.textSecondary}`}>
                          <th className="pb-3 pl-2">Time</th>
                          <th className="pb-3">User</th>
                          <th className="pb-3">Type</th>
                          <th className="pb-3">Asset</th>
                          <th className="pb-3 text-right">Amount</th>
                          <th className="pb-3 text-right pr-2">Value (USD)</th>
                        </tr>
                      </thead>
                      <tbody className={`text-sm ${TC.textPrimary} divide-y ${isLight ? 'divide-gray-200' : 'divide-gray-700/50'}`}>
                        {todayTransactions.map((tx) => (
                          <tr key={tx._id} className="hover:bg-gray-50/5 transition-colors">
                            <td className="py-3 pl-2 whitespace-nowrap text-xs sm:text-sm">
                              {new Date(tx.transactionDate).toLocaleTimeString()}
                            </td>
                            <td className="py-3">
                              <div className="flex flex-col">
                                <span className="font-medium">{tx.userName}</span>
                                <span className={`text-xs ${TC.textSecondary}`}>{tx.userEmail}</span>
                              </div>
                            </td>
                            <td className="py-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-bold ${tx.type === 'buy' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                {tx.type.toUpperCase()}
                              </span>
                            </td>
                            <td className="py-3 flex items-center gap-2">
                              {tx.image && <img src={tx.image} alt="" className="w-5 h-5 rounded-full" />}
                              <span>{tx.coinSymbol?.toUpperCase()}</span>
                            </td>
                            <td className="py-3 text-right font-medium">{Number(tx.quantity).toFixed(4)}</td>
                            <td className="py-3 text-right pr-2 font-medium">${Number(tx.totalValue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      }

    </>
  );
}

export default AdminDashboard;
