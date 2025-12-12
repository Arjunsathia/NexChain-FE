import React, { useMemo, useState, useEffect, useRef } from "react";
import {
  FaChartLine,
  FaCoins,
  FaArrowRight,
  FaArrowUp,
  FaArrowDown,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useLivePortfolio } from "@/hooks/useLivePortfolio";

// Utility to check if light mode is active based on global class
const useThemeCheck = () => {
  const [isLight, setIsLight] = useState(
    !document.documentElement.classList.contains("dark")
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsLight(!document.documentElement.classList.contains("dark"));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  return isLight;
};

function PortfolioCard() {
  const isLight = useThemeCheck();
  const { groupedHoldings, loading: portfolioLoading } = useLivePortfolio();
  const navigate = useNavigate();

  const [livePrices, setLivePrices] = useState({});
  const ws = useRef(null);
  const livePricesRef = useRef({});

  // Fade-in mount effect
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const TC = useMemo(
    () => ({
      bgContainer: isLight
        ? "bg-white shadow-sm sm:shadow-[0_4px_15px_rgba(0,0,0,0.08)] border border-gray-100"
        : "bg-gray-800/50 backdrop-blur-xl shadow-xl shadow-black/20 border border-gray-800",
      textPrimary: isLight ? "text-gray-900" : "text-white",
      textSecondary: isLight ? "text-gray-600" : "text-gray-400",
      bgItem: isLight
        ? "bg-gray-100/50 border-gray-300 hover:bg-gray-100 hover:border-cyan-600/30"
        : "bg-gray-700/30 border-gray-600 hover:bg-gray-700/50 hover:border-cyan-400/30",
      borderItem: isLight ? "border-gray-300" : "border-gray-700/50",
      bgIcon: isLight ? "bg-cyan-100" : "bg-cyan-400/10",
      textIcon: isLight ? "text-cyan-600" : "text-cyan-400",
      textPLPositive: isLight ? "text-green-700" : "text-green-400",
      textPLNegative: isLight ? "text-red-700" : "text-red-400",
      bgPLPositive: isLight ? "bg-green-100/50" : "bg-green-500/20",
      bgPLNegative: isLight ? "bg-red-100/50" : "bg-red-500/20",
      bgLoading: isLight ? "bg-gray-200" : "bg-gray-700",
      bgEmpty: isLight
        ? "bg-gray-100/70 border-gray-300"
        : "bg-gray-700/30 border-gray-600",
      textEmpty: isLight ? "text-gray-500" : "text-gray-400",
      bgFooterButton: isLight
        ? "bg-gray-200 border-gray-300 hover:bg-cyan-100/70 hover:border-cyan-500"
        : "bg-gray-700/50 border-gray-600 hover:bg-cyan-900/40 hover:border-cyan-400",
      textFooterButton: isLight ? "text-cyan-600" : "text-cyan-400",
      textHoverAccent: isLight
        ? "group-hover:text-cyan-700"
        : "group-hover:text-cyan-300",
    }),
    [isLight]
  );

  // Update ref when livePrices changes
  useEffect(() => {
    livePricesRef.current = livePrices;
  }, [livePrices]);

  // WebSocket setup for live price updates
  useEffect(() => {
    if (groupedHoldings.length === 0) return;

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

    try {
      ws.current = new WebSocket(
        `wss://stream.binance.com:9443/stream?streams=${streams}`
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
            vetusdt: "vechain",
            trxusdt: "tron",
          };

          const coinId = symbolToCoinId[symbol];
          if (coinId) {
            setLivePrices((prev) => ({
              ...prev,
              [coinId]: {
                current_price: parseFloat(coinData.c),
                price_change_percentage_24h: parseFloat(coinData.P),
                price_change_24h: parseFloat(coinData.p),
              },
            }));
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
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [groupedHoldings]);

  // Get all coins for portfolio display with live data
  const allCoins = useMemo(() => {
    const holdingsWithLiveData = groupedHoldings.map((coin) => {
      const livePriceData = livePrices[coin.coinId];
      if (livePriceData) {
        const currentPrice = livePriceData.current_price;
        const currentValue = (coin.totalQuantity || 0) * currentPrice;
        const remainingInvestment = coin.remainingInvestment || 0;
        const profitLoss = currentValue - remainingInvestment;
        const profitLossPercentage =
          remainingInvestment > 0
            ? (profitLoss / remainingInvestment) * 100
            : 0;

        return {
          ...coin,
          currentPrice,
          priceChange24h: livePriceData.price_change_percentage_24h,
          totalCurrentValue: currentValue,
          profitLoss,
          profitLossPercentage,
          hasLiveData: true,
        };
      }

      return {
        ...coin,
        currentPrice: coin.currentPrice || coin.current_price,
        totalCurrentValue: coin.totalCurrentValue || 0,
        profitLoss: coin.profitLoss || 0,
        profitLossPercentage: coin.profitLossPercentage || 0,
        hasLiveData: false,
      };
    });

    return holdingsWithLiveData
      .sort((a, b) => (b.totalCurrentValue || 0) - (a.totalCurrentValue || 0))
      .map((coin) => ({
        ...coin,
        currentValue: coin.totalCurrentValue || 0,
        profitLoss: coin.profitLoss || 0,
        profitLossPercentage: coin.profitLossPercentage || 0,
      }));
  }, [groupedHoldings, livePrices]);

  // Portfolio summary with live data
  const livePortfolioSummary = useMemo(() => {
    const totalCurrentValue = allCoins.reduce(
      (sum, coin) => sum + (coin.totalCurrentValue || 0),
      0
    );
    const totalInvestment = allCoins.reduce(
      (sum, coin) => sum + (coin.remainingInvestment || 0),
      0
    );
    const totalProfitLoss = totalCurrentValue - totalInvestment;
    const totalProfitLossPercentage =
      totalInvestment > 0 ? (totalProfitLoss / totalInvestment) * 100 : 0;

    return {
      totalCurrentValue,
      remainingInvestment: totalInvestment,
      totalProfitLoss,
      totalProfitLossPercentage,
      hasLiveData: Object.keys(livePrices).length > 0,
    };
  }, [allCoins, livePrices]);

  const handleViewAllPortfolio = () => {
    navigate("/portfolio");
  };

  return (
    <div
      className={`
        rounded-lg md:rounded-2xl p-3 md:p-4 h-full flex flex-col gap-4 fade-in
        ${TC.bgContainer}
        ${isMounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"}
      `}
      style={{ transition: "opacity 0.3s ease, transform 0.3s ease" }}
    >
      <div className="fade-in flex-1 min-h-0 flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${TC.bgIcon}`}>
              <FaChartLine className={TC.textIcon + " text-sm"} />
            </div>
            <h2 className="text-base font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Holdings
            </h2>
          </div>
        </div>

        {portfolioLoading ? (
          <div className="space-y-2 flex-1 min-h-0 overflow-y-auto scrollbar-hide">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 fade-in"
              >
                <div className="flex items-center gap-2 flex-1">
                  <div
                    className={`w-8 h-8 rounded-lg ${TC.bgLoading} animate-pulse`}
                  ></div>
                  <div className="flex-1 space-y-1.5">
                    <div
                      className={`w-16 h-3 ${TC.bgLoading} rounded animate-pulse`}
                    ></div>
                    <div
                      className={`w-12 h-2 ${TC.bgLoading} rounded animate-pulse`}
                    ></div>
                  </div>
                </div>
                <div
                  className={`w-10 h-3 ${TC.bgLoading} rounded animate-pulse`}
                ></div>
              </div>
            ))}
          </div>
        ) : allCoins.length === 0 ? (
          <div
            className={`text-center py-4 flex flex-col items-center justify-center gap-2 rounded-xl border flex-1 fade-in ${TC.bgEmpty}`}
          >
            <div className={`p-2 rounded-full ${TC.bgIcon}`}>
              <FaCoins className={TC.textIcon + " text-base"} />
            </div>
            <p className={`text-xs ${TC.textEmpty}`}>No coins purchased yet</p>
          </div>
        ) : (
          <div className="flex-1 min-h-0 flex flex-col">
            {/* Scrollable coins list */}
            <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide space-y-2">
              {allCoins.slice(0, 6).map((coin) => (
                <div
                  key={coin.coinId || coin.id}
                  className={`flex items-center justify-between p-2 rounded-lg border hover:border-cyan-600/30 transition-all duration-200 cursor-pointer group fade-in ${TC.bgItem}`}
                  onClick={() => navigate("/portfolio")}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {coin.image ? (
                      <img
                        src={coin.image}
                        alt={coin.coinName}
                        className={`w-8 h-8 rounded-lg border ${TC.borderItem} group-hover:scale-110 transition-transform duration-200`}
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 text-xs flex items-center justify-center font-bold text-white shadow-lg group-hover:scale-110 transition-transform duration-200">
                        {coin.coinSymbol?.charAt(0)?.toUpperCase() || "C"}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1 mb-0.5">
                        <span
                          className={`font-semibold text-xs transition-colors truncate ${
                            TC.textPrimary
                          } ${
                            isLight
                              ? "group-hover:text-cyan-600"
                              : "group-hover:text-cyan-300"
                          }`}
                        >
                          {coin.coinSymbol?.toUpperCase()}
                        </span>
                        <span
                          className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                            coin.profitLoss >= 0
                              ? TC.bgPLPositive
                              : TC.bgPLNegative
                          }`}
                        >
                          {coin.profitLoss >= 0 ? "+" : ""}
                          {coin.profitLossPercentage?.toFixed(1) || "0.0"}%
                        </span>
                      </div>
                      <span
                        className={`text-xs block truncate ${TC.textSecondary}`}
                      >
                        {(coin.totalQuantity || 0).toFixed(4)}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={TC.textIcon + " font-bold text-xs"}>
                      $
                      {coin.totalCurrentValue?.toLocaleString("en-IN", {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      })}
                    </div>
                    <div
                      className={`text-xs font-medium ${
                        coin.profitLoss >= 0
                          ? TC.textPLPositive
                          : TC.textPLNegative
                      }`}
                    >
                      {coin.profitLoss >= 0 ? "+" : ""}$
                      {Math.abs(coin.profitLoss || 0).toLocaleString("en-IN", {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Portfolio Summary */}
            <div
              className={`pt-3 mt-2 border-t ${TC.borderItem} space-y-2 fade-in`}
            >
              <div
                className={`flex justify-between items-center text-xs ${TC.textSecondary}`}
              >
                <span>P&L:</span>
                <div className="flex items-center gap-1">
                  <span
                    className={`font-bold ${
                      livePortfolioSummary.totalProfitLoss >= 0
                        ? TC.textPLPositive
                        : TC.textPLNegative
                    }`}
                  >
                    {livePortfolioSummary.totalProfitLoss >= 0 ? "+" : ""}$
                    {Math.abs(
                      livePortfolioSummary.totalProfitLoss || 0
                    ).toLocaleString("en-IN", {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}
                  </span>
                  <span
                    className={`text-xs font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 ${
                      livePortfolioSummary.totalProfitLossPercentage >= 0
                        ? TC.bgPLPositive
                        : TC.bgPLNegative
                    }`}
                  >
                    {livePortfolioSummary.totalProfitLossPercentage >= 0 ? (
                      <FaArrowUp className="text-xs" />
                    ) : (
                      <FaArrowDown className="text-xs" />
                    )}
                    {livePortfolioSummary.totalProfitLossPercentage >= 0
                      ? "+"
                      : ""}
                    {livePortfolioSummary.totalProfitLossPercentage?.toFixed(
                      1
                    ) || "0.0"}
                    %
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View All Portfolio Button */}
        <button
          onClick={handleViewAllPortfolio}
          className={`
            w-full mt-3 text-xs font-semibold py-2 rounded-lg transition-all duration-200 
            flex items-center justify-center gap-1 group fade-in border 
            ${TC.bgFooterButton} 
            ${TC.textFooterButton} 
            ${TC.textHoverAccent}
          `}
        >
          View All Holdings
          <FaArrowRight className="text-xs group-hover:translate-x-0.5 transition-transform duration-200" />
        </button>
      </div>
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}

export default PortfolioCard;
