import { adminTheme } from "@/Components/Admin/adminTheme";
import { formatUSD } from "@/utils/format";
import { useState, useMemo } from "react";
import { Card, CardHeader } from "@/Components/ui/card";
import { Modal, ModalHeader } from "@/Components/ui/modal";
import { Segmented } from "@/Components/ui/segmented";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Users as UsersIcon, Coins, ArrowLeftRight, Star, TrendingUp } from "lucide-react";

import UserLineChart from "@/Components/Admin/Dashboard/LineChart";
import StatCard from "@/Components/Admin/Dashboard/StatCard";
import RecentReports from "@/Components/Admin/Dashboard/RecentReports";
import LatestUsers from "@/Components/Admin/Dashboard/LatestUsers";
import PlatformHealth from "@/Components/Admin/Dashboard/PlatformHealth";
import useCoinContext from "@/hooks/useCoinContext";
import QuickActions from "@/Components/Admin/Dashboard/QuickActions";
import { getData, default as api } from "@/api/axiosConfig";
import CoinQuickView from "@/Components/Crypto/CoinQuickView";
import { getTrendingCoinMarketData } from "@/api/coinApis";

const formatCurrency = (val) => formatUSD(val);

const AdminDashboard = () => {
  // CoinGecko market list loaded by DataLoader
  const { allCoins: marketCoins = [] } = useCoinContext();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const TC = adminTheme;

  // Frozen coins come from our API; the market list is CoinGecko's top 100
  const { data: frozenIds = [] } = useQuery({
    queryKey: ["frozenCoins"],
    queryFn: async () => (await api.get("/coins/frozen")).data.frozenIds || [],
    staleTime: 30000,
  });

  // Fetch user data
  const { data: users = [], isLoading: isUsersLoading, isError: usersError } = useQuery({
    queryKey: ["adminUsers"],
    queryFn: async () => {
      const res = await getData("/users");
      const payload = res?.data ?? res;
      const rows = payload?.users ?? payload;
      if (!Array.isArray(rows)) throw new Error("Unable to load users");
      return rows;
    },
    staleTime: 30000,
    refetchInterval: 30000,
  });

  // Fetch system reports
  const { data: reports = [], isLoading: isReportsLoading, isError: reportsError } = useQuery({
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
    isLoading: isStatsLoading, isError: statsError,
  } = useQuery({
    queryKey: ["adminPlatformStats"],
    queryFn: async () => {
      const res = await api.get("/purchases/platform-stats");
      return res.data.success ? res.data.stats : { tradesToday: 0 };
    },
    staleTime: 30000,
    refetchInterval: 30000,
  });

  const adminStats = useMemo(() => {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return {
      totalUsers: users.length,
      newUsersThisWeek: users.filter((u) => new Date(u.createdAt || 0).getTime() > weekAgo).length,
      totalCoins: marketCoins.length,
      tradesToday: platformStats.tradesToday,
      activeTradersToday: platformStats.activeTradersToday,
      trendingCoin: trendingCoinData || null,
    };
  }, [users, trendingCoinData, platformStats, marketCoins.length]);

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
  const [transactionsError, setTransactionsError] = useState(false);
  const [todayTransactions, setTodayTransactions] = useState([]);
  const [selectedCoinDetails, setSelectedCoinDetails] = useState(null);
  const [coinViewOpen, setCoinViewOpen] = useState(false);
  const [timeRange, setTimeRange] = useState("Month"); // Default to 'Month'

  const handleTradeCardClick = async () => {
    setIsTradesModalOpen(true);
    setIsModalLoading(true);
    setTransactionsError(false);
    setTodayTransactions([]);
    try {
      const res = await api.get("/purchases/today-transactions");
      if (res.data.success) {
        setTodayTransactions(res.data.data);
      } else {
        throw new Error("Unable to load transactions");
      }
    } catch (err) {
      setTransactionsError(true);
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
          setCoinViewOpen(true);
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
      <div className="space-y-4 lg:space-y-5">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div><h1 className="text-xl font-semibold tracking-tight text-fg sm:text-2xl">Platform overview</h1><p className="mt-0.5 text-sm text-fg-subtle">Monitor platform activity, members, and service health.</p></div>
          <span className="rounded-lg border border-line bg-surface px-2.5 py-1.5 text-[11px] text-fg-muted">{isUsersLoading || isStatsLoading ? "Updating data…" : "Refreshes every 30 seconds"}</span>
        </header>
        {(usersError || reportsError || statsError) && <div role="alert" className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-line bg-surface p-3 text-xs text-fg-muted"><span>Some platform data could not be loaded. The overview may be incomplete.</span><button onClick={() => { ["adminUsers", "adminReports", "adminPlatformStats"].forEach(key => queryClient.invalidateQueries({ queryKey: [key] })); }} className="font-medium text-brand">Retry</button></div>}
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          <StatCard label="Total users" value={usersError ? "—" : adminStats.totalUsers.toLocaleString()} icon={UsersIcon} badge={`${adminStats.newUsersThisWeek} joined this week`} onClick={() => navigate("/admin/users")} isLoading={isUsersLoading} />
          <StatCard label="Listed coins" value={adminStats.totalCoins.toLocaleString()} icon={Coins} description={frozenIds.length ? `${frozenIds.length} frozen` : "All tradable"} onClick={() => navigate("/admin/cryptocurrencies")} />
          <StatCard label="Trades today" value={statsError ? "—" : adminStats.tradesToday ?? 0} icon={ArrowLeftRight} badge={adminStats.activeTradersToday != null ? `${adminStats.activeTradersToday} active traders` : undefined} onClick={handleTradeCardClick} isLoading={isStatsLoading} />
          <StatCard label="Most watched coin" value={adminStats.trendingCoin?.symbol?.toUpperCase() || "—"} icon={Star} description="Most added to watchlists" onClick={adminStats.trendingCoin ? handleTrendingCardClick : undefined} isLoading={isTrendingLoading} />
        </div>
        <div className="grid items-start gap-4 xl:grid-cols-12 lg:gap-5">
          <Card className="min-w-0 xl:col-span-8">
            <CardHeader icon={TrendingUp} title="User registrations" subtitle={timeRange === "Week" ? "New accounts over the last 7 days" : "New accounts over the last 12 months"} action={<Segmented label="Registration period" options={[{value:"Week",label:"7D"},{value:"Month",label:"12M"}]} value={timeRange} onChange={setTimeRange} />} />
            <div className="h-[280px] px-3 pb-4 sm:h-[310px]">{isUsersLoading ? <div className="h-full animate-pulse rounded-lg bg-surface-2" /> : <UserLineChart users={users} timeRange={timeRange} />}</div>
          </Card>
          <div className="space-y-4 xl:col-span-4"><PlatformHealth TC={TC} /><QuickActions handleQuickAction={handleQuickAction} /></div>
        </div>
        <div className="grid items-start gap-4 lg:grid-cols-2 lg:gap-5"><LatestUsers users={latestUsers} isLoading={isUsersLoading} /><RecentReports reports={reports} isLoading={isReportsLoading} /></div>
      </div>

      <CoinQuickView coin={selectedCoinDetails} open={coinViewOpen} onClose={() => setCoinViewOpen(false)} />

      <Modal open={isTradesModalOpen} onClose={() => setIsTradesModalOpen(false)} className="sm:max-w-4xl" label="Today's transactions">
        <ModalHeader title="Today's transactions" subtitle="Executed trades across the platform" onClose={() => setIsTradesModalOpen(false)} />
        <div className="overflow-x-auto border-t border-line">
          {isModalLoading ? <p role="status" className="p-12 text-center text-sm text-fg-muted">Loading transactions…</p> : transactionsError ? <div role="alert" className="p-10 text-center"><p className="text-sm text-down">Unable to load transactions.</p><button onClick={handleTradeCardClick} className="mt-2 text-xs text-brand">Try again</button></div> : todayTransactions.length === 0 ? <p className="p-12 text-center text-sm text-fg-muted">No trades have been executed today.</p> :
          <table className="w-full min-w-[620px] text-left text-xs tabular-nums">
            <thead className="bg-surface-2 text-fg-muted"><tr>{["Time", "User", "Side", "Asset", "Quantity", "Value"].map(h => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-line">{todayTransactions.map(tx => <tr key={tx._id} className="hover:bg-surface-hover">
              <td className="whitespace-nowrap px-4 py-3 text-fg-muted">{new Date(tx.transactionDate).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</td>
              <td className="px-4 py-3"><p className="font-medium text-fg">{tx.userName}</p><p className="mt-0.5 text-[11px] text-fg-subtle">{tx.userEmail}</p></td>
              <td className="px-4 py-3"><span className={tx.type === "buy" ? "text-up" : "text-down"}>{tx.type?.toUpperCase()}</span></td>
              <td className="px-4 py-3 uppercase text-fg">{tx.coinSymbol}</td><td className="px-4 py-3 text-fg">{Number(tx.quantity).toLocaleString(undefined,{maximumFractionDigits:6})}</td><td className="px-4 py-3 font-medium text-fg">{formatCurrency(tx.totalValue)}</td>
            </tr>)}</tbody>
          </table>}
        </div>
      </Modal>
    </>
  );
};
export default AdminDashboard;
