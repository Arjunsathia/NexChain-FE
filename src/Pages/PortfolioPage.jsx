import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
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
import OpenOrders from "@/Components/portfolio/OpenOrders";

import { FaChartLine, FaLayerGroup } from "react-icons/fa";

const PortfolioPage = () => {
  const isLight = useThemeCheck();
  // Freeze validated state on mount so animations play fully on first visit

  const { balance } = useWalletContext();
  const { groupedHoldings, loading: portfolioLoading } = useLivePortfolio();
  const { purchasedCoins } = usePurchasedCoins();

  const [livePrices, setLivePrices] = useState({});
  const ws = useRef(null);

  // Defer heavy connections until after page transition (approx 350ms)
  const [transitionComplete, setTransitionComplete] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setTransitionComplete(true);
    }, 350);
    return () => clearTimeout(timer);
  }, []);

  const [tradeModal, setTradeModal] = useState({
    show: false,
    coin: null,
    type: "buy",
  });

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

  const bufferRef = useRef({});

  useEffect(() => {
    if (!transitionComplete) return; // Wait for transition
    if (!groupedHoldings || groupedHoldings.length === 0) return;

    const symbols = groupedHoldings
      .map((coin) => {
        const symbolMap = {
          bitcoin: "btcusdt",
          ethereum: "ethusdt",
          binancecoin: "bnbusdt",
          ripple: "xrpusdt",
          cardano: "adausdt",
          solana: "solusdt",
          dogecoin: "dogeusdt",
          polkadot: "dotusdt",
          "matic-network": "maticusdt",
          litecoin: "ltcusdt",
          chainlink: "linkusdt",
          stellar: "xlmusdt",
          cosmos: "atomusdt",
          monero: "xmusdt",
          "ethereum-classic": "etcusdt",
          "bitcoin-cash": "bchusdt",
          filecoin: "filusdt",
          theta: "thetausdt",
          vechain: "vetusdt",
          tron: "trxusdt",
        };
        return symbolMap[coin.coinId]
          ? `${symbolMap[coin.coinId]}@ticker`
          : null;
      })
      .filter(Boolean);

    if (symbols.length === 0) return;

    const streams = symbols.join("/");

    const intervalId = setInterval(() => {
      if (Object.keys(bufferRef.current).length > 0) {
        setLivePrices((prev) => ({
          ...prev,
          ...bufferRef.current,
        }));
        bufferRef.current = {};
      }
    }, 1000); // Update UI every 1s

    try {
      if (ws.current) ws.current.close();

      ws.current = new WebSocket(
        `wss://stream.binance.com:9443/stream?streams=${streams}`,
      );

      ws.current.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.stream && message.data) {
          const symbol = message.stream.replace("@ticker", "");
          const coinData = message.data;

          const symbolToCoinId = {
            btcusdt: "bitcoin",
            ethusdt: "ethereum",
            bnbusdt: "binancecoin",
            xrpusdt: "ripple",
            adausdt: "cardano",
            solusdt: "solana",
            dogeusdt: "dogecoin",
            dotusdt: "polkadot",
            maticusdt: "matic-network",
            ltcusdt: "litecoin",
            linkusdt: "chainlink",
            xlmusdt: "stellar",
            atomusdt: "cosmos",
            xmusdt: "monero",
            etcusdt: "ethereum-classic",
            bchusdt: "bitcoin-cash",
            filusdt: "filecoin",
            thetausdt: "theta",
            vechain: "vetusdt",
            tron: "trxusdt",
          };

          const coinId = symbolToCoinId[symbol];
          if (coinId) {
            bufferRef.current[coinId] = {
              current_price: parseFloat(coinData.c),
              price_change_percentage_24h: parseFloat(coinData.P),
              price_change_24h: parseFloat(coinData.p),
            };
          }
        }
      };

      ws.current.onerror = (error) => {
        console.error("Portfolio WebSocket error:", error);
      };
    } catch (error) {
      console.error("Portfolio WebSocket setup failed:", error);
    }

    return () => {
      clearInterval(intervalId);
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [groupedHoldings]); // Re-run if holdings change

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
          priceChange24h: liveData.price_change_percentage_24h,
          totalCurrentValue,
          profitLoss,
          profitLossPercentage,
        };
      }
      return coin;
    });
  }, [groupedHoldings, livePrices]);

  const liveSummary = useMemo(() => {
    const totalCurrentValue = mergedHoldings.reduce(
      (sum, coin) => sum + (coin.totalCurrentValue || 0),
      0,
    );
    const totalInvested = mergedHoldings.reduce(
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
  }, [mergedHoldings]);

  const topPerformer = useMemo(() => {
    if (!mergedHoldings || mergedHoldings.length === 0) return null;
    return [...mergedHoldings].sort(
      (a, b) => (b.profitLossPercentage || 0) - (a.profitLossPercentage || 0),
    )[0];
  }, [mergedHoldings]);

  const topLoser = useMemo(() => {
    if (!mergedHoldings || mergedHoldings.length === 0) return null;
    return [...mergedHoldings].sort(
      (a, b) => (a.profitLossPercentage || 0) - (b.profitLossPercentage || 0),
    )[0];
  }, [mergedHoldings]);

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
              loading={portfolioLoading}
              topPerformer={topPerformer}
              topLoser={topLoser}
              TC={TC}
            />
          </div>

          <div className="space-y-4">
            <HoldingsTable
              isLight={isLight}
              holdings={mergedHoldings}
              loading={portfolioLoading}
              onTrade={handleTrade}
              TC={TC}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <PerformanceChart
                isLight={isLight}
                groupedHoldings={mergedHoldings}
                balance={balance}
                loading={portfolioLoading}
                TC={TC}
              />
            </div>
            <div className="lg:col-span-1">
              <PortfolioDistribution
                isLight={isLight}
                groupedHoldings={mergedHoldings}
                balance={balance}
                loading={portfolioLoading}
                TC={TC}
              />
            </div>
          </div>

          <div className="">
            <OpenOrders isLight={isLight} livePrices={livePrices} TC={TC} />
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
    </>
  );
};

export default PortfolioPage;
