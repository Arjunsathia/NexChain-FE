import { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { FaUsers, FaCoins, FaChartLine, FaStar, FaTimes, FaArrowUp, FaArrowDown } from "react-icons/fa";

import UserLineChart from "@/Components/Admin/Dashboard/LineChart";
import StatCard from "@/Components/Admin/Dashboard/StatCard";
import RecentReports from "@/Components/Admin/Dashboard/RecentReports";
import LatestUsers from "@/Components/Admin/Dashboard/LatestUsers";
import PlatformHealth from "@/Components/Admin/Dashboard/PlatformHealth";
import QuickActions from "@/Components/Admin/Dashboard/QuickActions";
import { getData, default as api } from "@/api/axiosConfig";
import MarketCoinDetailsModal from "@/Components/Admin/MarketInsights/MarketCoinDetailsModal";
import { getTrendingCoinMarketData } from "@/api/coinApis";
import useThemeCheck from "@/hooks/useThemeCheck";
import useTransitionDelay from "@/hooks/useTransitionDelay";
import { useLocation } from "react-router-dom";
import { useVisitedRoutes } from "@/hooks/useVisitedRoutes";

const formatCurrency = (val) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    val,
  );
const formatCompactNumber = (number) =>
  new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(number);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const isLight = useThemeCheck();
  const { isVisited, markVisited } = useVisitedRoutes();
  const location = useLocation();
  const isReady = useTransitionDelay(350, isVisited(location.pathname));
  const [isFirstVisit] = useState(!isVisited(location.pathname));

  useEffect(() => {
    markVisited(location.pathname);
  }, [location.pathname, markVisited]);

  const TC = useMemo(
    () => ({
      textPrimary: isLight ? "text-gray-900" : "text-white",
      textSecondary: isLight ? "text-gray-500" : "text-gray-400",
      textTertiary: isLight ? "text-gray-400" : "text-gray-500",

      // Optimized for Chromium browsers to prevent flickering in dark mode
      // Premium Glassmorphism Cards - Optimized for stability
      bgCard: isLight
        ? "bg-white/70 backdrop-blur-xl shadow-md border border-gray-100 glass-card"
        : "bg-gray-900/95 backdrop-blur-none shadow-none border border-gray-700/50",

      bgStatsCard: isLight
        ? "bg-white/70 backdrop-blur-xl shadow-md border border-gray-100 glass-card hover:bg-white/80 hover:shadow-lg"
        : "bg-gray-900/95 backdrop-blur-none shadow-none border border-gray-700/50 hover:bg-gray-800/80",

      // bgItem: Transparent in dark mode with refined hover for cleaner look
      bgItem: isLight
        ? "bg-gray-50/50 hover:bg-gray-100/50 border border-gray-100 isolation-isolate"
        : "bg-transparent hover:bg-white/5 isolation-isolate",

      modalOverlay: "bg-black/40 backdrop-blur-sm",
      modalContent: isLight
        ? "bg-white"
        : "bg-[#0B0E11] border border-gray-800 prevent-seam force-layer glass-card",

      cardHover: isLight
        ? "hover:shadow-blue-500/20"
        : "hover:shadow-cyan-500/20",

      headerGradient: "from-blue-600 to-cyan-500",
    }),
    [isLight],
  );

  // Fetch user data
  const { data: users = [], isLoading: isUsersLoading } = useQuery({
    queryKey: ["adminUsers"],
    queryFn: async () => {
      const res = await getData("/users");
      const payload = res?.data ?? res;
      return payload?.users ?? payload ?? [];
    },
    staleTime: 30000,
    refetchInterval: 30000,
  });

  // Fetch system reports
  const { data: reports = [], isLoading: isReportsLoading } = useQuery({
    queryKey: ["adminReports"],
    queryFn: async () => {
      const res = await getData("/feedback");
      const feedbackData = res?.data ?? res ?? [];
      return Array.isArray(feedbackData)
        ? feedbackData
          .filter((fb) => fb && (fb.type === "bug" || fb.type === "issue"))
          .map((fb) => {
            /* ... mapping logic ... */
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
              createdAt:
                fb.createdAt || fb.timestamp || new Date().toISOString(),
            };
          })
          .slice(0, 4)
        : [];
    },
    staleTime: 30000,
    refetchInterval: 30000,
  });

  // Fetch recent platform activity
  const { isLoading: isActivityLoading } = useQuery({
    queryKey: ["adminActivity"],
    queryFn: async () => {
      const res = await getData("/activity");
      return res?.data ?? res ?? [];
    },
    staleTime: 30000,
    refetchInterval: 30000,
    retry: false,
  });

  // Fetch trending coin data
  const { data: trendingCoinData, isLoading: isTrendingLoading } = useQuery({
    queryKey: ["adminTrending"],
    queryFn: async () => {
      const res = await getData("/watchlist/trending");
      return res?.data ?? res;
    },
    staleTime: 60000, // 1 min for trending
    refetchInterval: 60000,
  });

  // Fetch platform statistics
  const {
    data: platformStats = { tradesToday: 0 },
    isLoading: isStatsLoading,
  } = useQuery({
    queryKey: ["adminPlatformStats"],
    queryFn: async () => {
      const res = await api.get("/purchases/platform-stats");
      return res.data.success
        ? { tradesToday: res.data.stats.tradesToday }
        : { tradesToday: 0 };
    },
    staleTime: 30000,
    refetchInterval: 30000,
  });

  const adminStats = useMemo(() => {
    const totalUsers = users.length;
    const totalCoins = 150;
    const trending = trendingCoinData || {
      symbol: "BTC",
      price_change_percentage_24h: 2.45,
    };

    return {
      totalUsers,
      totalCoins,
      tradesToday: platformStats.tradesToday,
      trendingCoin: trending,
    };
  }, [users, trendingCoinData, platformStats]);

  const latestUsers = useMemo(() => {
    return [...users]
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
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

  const [isTradesModalOpen, setIsTradesModalOpen] = useState(false);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [todayTransactions, setTodayTransactions] = useState([]);
  const [selectedCoinDetails, setSelectedCoinDetails] = useState(null);
  const [timeRange, setTimeRange] = useState("Month"); // Default to 'Month'

  const handleTradeCardClick = async () => {
    setIsTradesModalOpen(true);
    setIsModalLoading(true);
    try {
      const res = await api.get("/purchases/today-transactions");
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
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
          <div
            className={`w-full md:w-auto text-center md:text-left ${isFirstVisit ? "fade-in" : ""}`}
            style={{ animationDelay: "0.1s" }}
          >
            <h1
              className={`text-2xl lg:text-3xl font-bold tracking-tight mb-1 ${TC.textPrimary}`}
            >
              Admin{" "}
              <span className="bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">
                Dashboard
              </span>
            </h1>
            <p className={`text-sm font-medium ${TC.textSecondary}`}>
              Real-time platform monitoring and management
            </p>
          </div>

          <div
            className="flex items-center justify-center gap-3 fade-in w-full md:w-auto"
            style={{ animationDelay: "0.2s" }}
          >
            {(!isReady ||
              isUsersLoading ||
              isStatsLoading ||
              isActivityLoading) && (
                <div
                  className={`flex items-center text-xs font-medium backdrop-blur-sm px-4 py-2 rounded-full border shadow-sm ${isLight ? "bg-white/50 border-gray-100 text-gray-500" : "bg-gray-800/50 border-gray-700 text-gray-400"}`}
                >
                  <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2" />
                  Updating live data...
                </div>
              )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col gap-4 lg:gap-6">
          {/* Stats Grid */}
          <div
            className={`grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 ${isFirstVisit ? "fade-in" : ""}`}
            style={{ animationDelay: "0.3s" }}
          >
            {[
              {
                label: "Total Users",
                value: adminStats.totalUsers,
                icon: FaUsers,
                color: "from-blue-500 to-cyan-400",
                badge: "+12%",
                onClick: () => navigate("/admin/users"),
                isLoading: isUsersLoading,
              },
              {
                label: "Active Coins",
                value: adminStats.totalCoins,
                icon: FaCoins,
                color: "from-purple-500 to-pink-400",
                badge: "+5 new",
                onClick: () => navigate("/admin/cryptocurrencies"),
                isLoading: false,
              },
              {
                label: "Trades Today",
                value: adminStats.tradesToday || 0,
                icon: FaChartLine,
                color: "from-green-500 to-emerald-400",
                badge: "+8.2%",
                onClick: handleTradeCardClick,
                isLoading: isStatsLoading,
              },
              {
                label: "Trending Coin",
                value: adminStats.trendingCoin
                  ? adminStats.trendingCoin.symbol?.toUpperCase()
                  : "N/A",
                icon: FaStar,
                color: "from-amber-500 to-yellow-400",
                badge:
                  adminStats.trendingCoin &&
                    adminStats.trendingCoin.price_change_percentage_24h != null
                    ? `${Number(adminStats.trendingCoin.price_change_percentage_24h).toFixed(2)}%`
                    : "No data",
                onClick: handleTrendingCardClick,
                isLoading: isTrendingLoading,
              },
            ].map((stat, i) => (
              <StatCard
                key={i}
                {...stat}
                isLoading={!isReady || stat.isLoading}
                TC={TC}
              />
            ))}
          </div>

          {/* Charts & Actions Row */}
          <div
            className={`grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 ${isFirstVisit ? "fade-in" : ""}`}
            style={{ animationDelay: "0.4s" }}
          >
            {/* Main Chart Card (User Registration) */}
            <div
              className={`lg:col-span-2 ${TC.bgCard} rounded-2xl p-4 sm:p-6 relative overflow-hidden group`}
            >
              {/* Background Decorative Gradient */}

              <div className="flex items-center justify-between mb-4 sm:mb-6 relative z-10">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2.5 rounded-xl transition-transform duration-300 group-hover:scale-110 shadow-sm ${isLight ? "bg-cyan-50 text-cyan-600" : "bg-cyan-500/10 text-cyan-400"}`}
                  >
                    <FaChartLine className="text-lg" />
                  </div>
                  <div>
                    <h2
                      className={`text-base sm:text-lg font-bold tracking-tight ${TC.textPrimary} flex items-center gap-2`}
                    >
                      User Registration
                    </h2>
                  </div>
                </div>

                {/* Range Selector */}
                <div
                  className={`flex items-center p-1 rounded-xl ${isLight ? "bg-gray-100/80" : "bg-gray-800/50 border border-white/5"}`}
                >
                  {["Week", "Month"].map((range) => (
                    <button
                      key={range}
                      onClick={() => setTimeRange(range)}
                      className={`
                      px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-semibold rounded-lg transition-all duration-300
                      ${timeRange === range
                          ? isLight
                            ? "bg-white text-cyan-600 shadow-sm"
                            : "bg-gray-700 text-white shadow-sm border border-white/5"
                          : isLight
                            ? "text-gray-500 hover:text-gray-900"
                            : "text-gray-400 hover:text-white"
                        }
                    `}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              </div>

              {!isReady || isUsersLoading ? (
                <div className="h-[220px] sm:h-[250px] lg:h-[300px] w-full animate-pulse bg-gray-700/10 rounded-xl" />
              ) : (
                <div className="h-[220px] sm:h-[250px] lg:h-[300px] w-full relative z-10">
                  <UserLineChart users={users} timeRange={timeRange} />
                </div>
              )}
            </div>

            {/* Side Actions */}
            <div className="flex flex-col gap-4 lg:gap-6">
              <PlatformHealth isLoading={false} TC={TC} />
              <QuickActions
                isLoading={false}
                handleQuickAction={handleQuickAction}
                TC={TC}
              />
            </div>
          </div>

          {/* Bottom Reports & Users */}
          <div
            className={`grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 ${isFirstVisit ? "fade-in" : ""}`}
            style={{ animationDelay: "0.5s" }}
          >
            <RecentReports
              reports={reports}
              isLoading={isReportsLoading}
              TC={TC}
            />
            <LatestUsers
              users={latestUsers}
              isLoading={isUsersLoading}
              TC={TC}
            />
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
      {isTradesModalOpen && createPortal(
        <div className="fixed inset-0 z-[2005] flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div
            className={`w-full max-w-4xl max-h-[85vh] sm:max-h-[90vh] overflow-hidden rounded-2xl sm:rounded-3xl ${TC.bgCard} shadow-2xl flex flex-col border ${isLight ? "border-gray-100" : "border-gray-800"} animate-in zoom-in duration-300`}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-6 border-b border-gray-200/10 flex justify-between items-center bg-gradient-to-r from-blue-500/5 to-cyan-500/5 backdrop-blur-md">
              <div className="min-w-0">
                <h2 className={`text-lg sm:text-2xl font-bold tracking-tight ${TC.textPrimary} truncate`}>
                  Today&apos;s Transactions
                </h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <p className={`text-[10px] sm:text-xs font-medium ${TC.textSecondary}`}>
                    Live platform activity
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsTradesModalOpen(false)}
                className={`p-2 sm:p-2.5 rounded-xl transition-all duration-300 flex-shrink-0 ${isLight ? "bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-500" : "bg-white/5 text-gray-400 hover:bg-red-500/20 hover:text-white"}`}
              >
                <FaTimes className="text-sm sm:text-base" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-6 custom-scrollbar scroll-smooth">
              {isModalLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin shadow-lg shadow-blue-500/10"></div>
                  <p className={`text-xs sm:text-sm font-bold ${TC.textSecondary} animate-pulse tracking-wide`}>
                    FETCHING TRANSACTIONS...
                  </p>
                </div>
              ) : todayTransactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 sm:py-20 gap-4 text-center px-4">
                  <div className={`p-4 sm:p-6 rounded-3xl ${isLight ? "bg-gray-50" : "bg-gray-800/40"} border border-dashed ${isLight ? "border-gray-200" : "border-gray-700"}`}>
                    <FaChartLine className={`text-4xl sm:text-5xl ${TC.textTertiary} opacity-30`} />
                  </div>
                  <div>
                    <h3 className={`text-lg font-bold ${TC.textPrimary}`}>No trades today</h3>
                    <p className={`text-xs sm:text-sm ${TC.textSecondary} max-w-[200px] mx-auto`}>
                      Platform activity logs will appear here as orders execute.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Desktop Table View */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr
                          className={`border-b border-gray-200/10 text-[10px] font-black uppercase tracking-[0.15em] ${TC.textSecondary}`}
                        >
                          <th className="pb-4 pl-4">Time</th>
                          <th className="pb-4">User</th>
                          <th className="pb-4">Type</th>
                          <th className="pb-4">Asset</th>
                          <th className="pb-4 text-right">Amount</th>
                          <th className="pb-4 text-right pr-4">Value (USD)</th>
                        </tr>
                      </thead>
                      <tbody
                        className={`text-sm ${TC.textPrimary} divide-y ${isLight ? "divide-gray-100" : "divide-white/5"}`}
                      >
                        {todayTransactions.map((tx) => (
                          <tr
                            key={tx._id}
                            className={`group transition-all duration-300 ${isLight ? "hover:bg-blue-50/30" : "hover:bg-white/5"}`}
                          >
                            <td className="py-4 pl-4 whitespace-nowrap text-xs font-mono font-medium opacity-70">
                              {new Date(tx.transactionDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </td>
                            <td className="py-4">
                              <div className="flex flex-col min-w-0 pr-4">
                                <span className="font-bold text-sm truncate">{tx.userName}</span>
                                <span className={`text-[10px] ${TC.textSecondary} truncate opacity-70`}>
                                  {tx.userEmail}
                                </span>
                              </div>
                            </td>
                            <td className="py-4">
                              <span
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-black tracking-wide inline-flex items-center gap-1.5 ${tx.type === "buy" ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"}`}
                              >
                                <span className={`w-1 h-1 rounded-full ${tx.type === "buy" ? "bg-emerald-500" : "bg-rose-500"}`} />
                                {tx.type.toUpperCase()}
                              </span>
                            </td>
                            <td className="py-4">
                              <div className="flex items-center gap-3">
                                {tx.image && (
                                  <div className={`p-1 rounded-lg ${isLight ? "bg-gray-100/50" : "bg-white/5"} border border-white/5 shadow-sm`}>
                                    <img
                                      src={tx.image}
                                      alt=""
                                      className="w-7 h-7 rounded-md object-contain"
                                    />
                                  </div>
                                )}
                                <span className="font-black tracking-tight text-xs uppercase">{tx.coinSymbol}</span>
                              </div>
                            </td>
                            <td className="py-4 text-right font-mono text-xs font-bold">
                              {Number(tx.quantity).toLocaleString(undefined, { maximumFractionDigits: 6 })}
                            </td>
                            <td className="py-4 text-right pr-4 font-black text-sm">
                              <span className="text-[10px] font-bold mr-0.5 opacity-50">$</span>
                              {Number(tx.totalValue).toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Card View */}
                  <div className="md:hidden flex flex-col gap-4">
                    {todayTransactions.map((tx) => (
                      <div
                        key={tx._id}
                        className={`group p-4 rounded-2xl border transition-all duration-300 ${isLight ? 'bg-white border-gray-100 hover:border-blue-200' : 'bg-white/5 border-gray-800 hover:border-gray-700'} flex flex-col gap-4 relative overflow-hidden`}
                      >
                        {/* Accent line for transaction type */}
                        <div className={`absolute top-0 left-0 bottom-0 w-1 ${tx.type === "buy" ? "bg-emerald-500" : "bg-rose-500"} opacity-30`} />

                        <div className="flex justify-between items-start gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`relative flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center p-1 border shadow-inner ${isLight ? "bg-gray-50 border-gray-100" : "bg-gray-800/50 border-gray-700"}`}>
                              {tx.image ? (
                                <img
                                  src={tx.image}
                                  alt=""
                                  className="w-full h-full object-contain"
                                />
                              ) : (
                                <FaCoins className="text-gray-500 text-lg" />
                              )}
                              <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900 ${tx.type === "buy" ? "bg-emerald-500" : "bg-rose-500"}`}>
                                {tx.type === "buy" ? <FaArrowUp className="text-white text-[6px]" /> : <FaArrowDown className="text-white text-[6px]" />}
                              </div>
                            </div>
                            <div className="min-w-0">
                              <h3 className={`font-black text-sm ${TC.textPrimary} truncate`}>
                                {tx.userName}
                              </h3>
                              <p className={`text-[10px] ${TC.textSecondary} truncate font-medium opacity-70`}>
                                {tx.userEmail}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end flex-shrink-0">
                            <span className={`text-[11px] font-mono font-bold ${TC.textSecondary}`}>
                              {new Date(tx.transactionDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <span
                              className={`mt-1.5 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider ${tx.type === "buy" ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"}`}
                            >
                              {tx.type}
                            </span>
                          </div>
                        </div>

                        <div className={`grid grid-cols-2 gap-4 p-3 rounded-xl ${isLight ? 'bg-gray-50/50' : 'bg-black/20'} border ${isLight ? 'border-gray-100' : 'border-white/5'}`}>
                          <div className="min-w-0">
                            <p className={`text-[9px] uppercase font-black tracking-widest ${TC.textSecondary} opacity-50`}>Asset Info</p>
                            <p className={`text-xs font-bold ${TC.textPrimary} mt-1 truncate`}>
                              {Number(tx.quantity).toLocaleString(undefined, { maximumFractionDigits: 4 })}
                              <span className="ml-1 text-[10px] text-blue-500 uppercase font-black">{tx.coinSymbol}</span>
                            </p>
                          </div>
                          <div className="text-right">
                            <p className={`text-[9px] uppercase font-black tracking-widest ${TC.textSecondary} opacity-50`}>Total Value</p>
                            <p className={`text-sm font-black ${TC.textPrimary} mt-0.5`}>
                              <span className="text-[10px] font-bold mr-0.5 opacity-50">$</span>
                              {Number(tx.totalValue).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer (Optional but adds premium look) */}
            <div className={`p-4 border-t ${isLight ? "bg-gray-50/50 border-gray-100" : "bg-white/5 border-gray-800"} flex justify-center`}>
              <p className={`text-[10px] font-bold uppercase tracking-[0.2em] ${TC.textTertiary} opacity-60`}>
                NEXCHAIN SYSTEM MONITORING
              </p>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default AdminDashboard;
