import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import useThemeCheck from "@/hooks/useThemeCheck";
import { useLivePortfolio } from "@/hooks/useLivePortfolio";
import useWalletContext from "@/hooks/useWalletContext";
import { usePurchasedCoins } from "@/hooks/usePurchasedCoins";
import PortfolioHeader from "@/Components/portfolio/PortfolioHeader";
import PerformanceChart from "@/Components/portfolio/PerformanceChart";
import PortfolioDistribution from "@/Components/portfolio/PortfolioDistribution";
import HoldingsTable from "@/Components/portfolio/HoldingsTable";
import TradeModal from "@/Components/Common/TradeModal";
import TransactionHistory from "@/Components/portfolio/TransactionHistory";
import OpenOrdersModal from "@/Components/portfolio/OpenOrdersModal";
import { useOpenOrders } from "@/hooks/useOpenOrders";
import { useBinanceTicker } from "@/hooks/useBinanceTicker";
import { useVisitedRoutes } from "@/hooks/useVisitedRoutes";
import { useLocation } from "react-router-dom";
import { FaChartLine, FaLayerGroup } from "react-icons/fa";

const PortfolioPage = () => {
  const isLight = useThemeCheck();
  // Freeze validated state on mount so animations play fully on first visit

  const { balance } = useWalletContext();
  const { groupedHoldings, loading: portfolioLoading } = useLivePortfolio();
  const { purchasedCoins } = usePurchasedCoins();

  // Get User ID for Caching
  const userStr = localStorage.getItem("NEXCHAIN_USER");
  const userId = userStr ? JSON.parse(userStr).id : "guest";

  // Cache State
  const [cachedHoldings, setCachedHoldings] = useState(() => {
    try {
      const cached = localStorage.getItem(`portfolio_holdings_v1_${userId}`);
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  // Live Prices sourced from centralized feed
  const livePrices = useBinanceTicker();

  // Defer heavy connections until after page transition (approx 350ms)
  const location = useLocation();
  const { isVisited } = useVisitedRoutes();
  const [isReady, setIsReady] = useState(() => isVisited(location.pathname));

  useEffect(() => {
    if (isReady) return;
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 350);
    return () => clearTimeout(timer);
  }, [isReady]);

  const [tradeModal, setTradeModal] = useState({
    show: false,
    coin: null,
    type: "buy",
  });

  const [isOrdersModalOpen, setIsOrdersModalOpen] = useState(false);
  const { orders: openOrders, refetch: refetchOrders } = useOpenOrders();

  const TC = useMemo(
    () => ({
      textPrimary: isLight ? "text-gray-900" : "text-white",
      textSecondary: isLight ? "text-gray-500" : "text-gray-400",
      textTertiary: isLight ? "text-gray-400" : "text-gray-500",

      // Glassmorphism Cards - Synced with Dashboard Quality
      bgCard: isLight
        ? "bg-white/70 backdrop-blur-xl shadow-md border border-gray-100 glass-card"
        : "bg-gray-900/95 backdrop-blur-none shadow-none border border-gray-700/50",

      bgHeader: isLight
        ? "bg-gray-100/50 border-b border-gray-200 isolation-isolate"
        : "bg-gray-900/95 border-b border-gray-700/50 isolation-isolate",

      bgHover: isLight ? "hover:bg-blue-50/50" : "hover:bg-white/5",

      bgInput: isLight
        ? "bg-gray-100/50 border-gray-200 focus:bg-white focus:border-blue-500 shadow-inner"
        : "bg-white/5 border-white/5 focus:bg-white/10 focus:border-cyan-500 text-white placeholder-gray-500 shadow-inner",

      btnPrimary:
        "bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md shadow-blue-500/20 transition-all active:scale-95 text-sm font-bold",

      headerGradient: "from-blue-600 to-cyan-500",

      textPositive: isLight ? "text-emerald-600" : "text-emerald-400",
      textNegative: isLight ? "text-rose-600" : "text-rose-400",
    }),
    [isLight],
  );

  // Ticker logic removed - Now centralized in useBinanceTicker hook

  const mergedHoldings = useMemo(() => {
    if (!groupedHoldings) return [];

    return groupedHoldings.map((coin) => {
      const liveData = livePrices[coin.coinId];
      if (liveData) {
        const currentPrice = liveData.current_price;
        const totalCurrentValue = (coin.totalQuantity || 0) * currentPrice;
        const remainingInvestment = coin.remainingInvestment || 0;
        const profitLoss = totalCurrentValue - remainingInvestment;
        const profitLossPercentage =
          remainingInvestment > 0
            ? (profitLoss / remainingInvestment) * 100
            : 0;

        return {
          ...coin,
          currentPrice,
          priceChange24h: liveData.change,
          totalCurrentValue,
          profitLoss,
          profitLossPercentage,
        };
      }
      return coin;
    });
  }, [groupedHoldings, livePrices]);

  // Update Cache only when structural data changes (groupedHoldings), not prices
  useEffect(() => {
    if (groupedHoldings && groupedHoldings.length > 0) {
      // Only cache the base data, not the derived price data
      localStorage.setItem(
        `portfolio_holdings_v1_${userId}`,
        JSON.stringify(groupedHoldings)
      );
    }
  }, [groupedHoldings, userId]);

  // Use cached data if fresh data is loading or empty (flicker prevention)
  const finalHoldings = useMemo(() => {
    return mergedHoldings.length > 0 ? mergedHoldings : cachedHoldings;
  }, [mergedHoldings, cachedHoldings]);

  const liveSummary = useMemo(() => {
    // Recalculate based on finalHoldings to ensure header updates instantly
    const totalCurrentValue = finalHoldings.reduce(
      (sum, coin) => sum + (coin.totalCurrentValue || 0),
      0,
    );
    const totalInvested = finalHoldings.reduce(
      (sum, coin) => sum + (coin.remainingInvestment || 0),
      0,
    );
    const totalProfitLoss = totalCurrentValue - totalInvested;
    const totalProfitLossPercentage =
      totalInvested > 0 ? (totalProfitLoss / totalInvested) * 100 : 0;

    return {
      totalCurrentValue,
      remainingInvestment: totalInvested,
      totalProfitLoss,
      totalProfitLossPercentage,
    };
  }, [finalHoldings]); // Depend on finalHoldings

  const topPerformer = useMemo(() => {
    if (!finalHoldings || finalHoldings.length === 0) return null;
    return [...finalHoldings].sort(
      (a, b) => (b.profitLossPercentage || 0) - (a.profitLossPercentage || 0),
    )[0];
  }, [finalHoldings]);

  const handleTrade = useCallback((coin) => {
    setTradeModal({
      show: true,
      coin: { ...coin, id: coin.coinId },
      type: "buy",
    });
  }, []);

  return (
    <>
      <div className={`min-h-screen p-2 sm:p-4 lg:p-6 ${TC.textPrimary}`}>
        <div className="max-w-7xl mx-auto px-0 sm:px-4 lg:px-6 pb-8 space-y-8">
          {/* Header Section */}
          <div className="">
            <PortfolioHeader
              isLight={isLight}
              portfolioSummary={liveSummary}
              balance={balance}
              loading={portfolioLoading || !isReady}
              topPerformer={topPerformer}
              onOpenOrdersClick={() => setIsOrdersModalOpen(true)}
              openOrdersCount={openOrders.length}
              TC={TC}
            />
          </div>

          <div className="space-y-4">
            <HoldingsTable
              isLight={isLight}
              holdings={finalHoldings}
              loading={(portfolioLoading && finalHoldings.length === 0) || !isReady} // Only show loader if we truly have no data
              onTrade={handleTrade}
              TC={TC}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <PerformanceChart
                isLight={isLight}
                groupedHoldings={finalHoldings}
                balance={balance}
                loading={(portfolioLoading && finalHoldings.length === 0) || !isReady}
                TC={TC}
              />
            </div>
            <div className="lg:col-span-1">
              <PortfolioDistribution
                isLight={isLight}
                groupedHoldings={finalHoldings}
                balance={balance}
                loading={(portfolioLoading && finalHoldings.length === 0) || !isReady}
                TC={TC}
              />
            </div>
          </div>


          <div
            className={`pt-8 border-t ${isLight ? "border-gray-200" : "border-white/5"}`}
          >
            <TransactionHistory TC={TC} />
          </div>
        </div>
      </div>

      {/* Trade Modal - Moved outside transformed container to fix z-index/fixed position context */}
      <TradeModal
        show={tradeModal.show}
        onClose={() => setTradeModal({ ...tradeModal, show: false })}
        coin={tradeModal.coin}
        type={tradeModal.type}
        purchasedCoins={purchasedCoins}
      />

      <OpenOrdersModal
        isOpen={isOrdersModalOpen}
        onClose={() => setIsOrdersModalOpen(false)}
        orders={openOrders}
        livePrices={livePrices}
        onRefresh={refetchOrders}
        TC={TC}
        isLight={isLight}
      />
    </>
  );
};

export default PortfolioPage;
