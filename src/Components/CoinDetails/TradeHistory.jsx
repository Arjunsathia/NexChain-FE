import useThemeCheck from "@/hooks/useThemeCheck";
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  memo,
  useMemo,
} from "react";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";
import useBinanceStream from "@/hooks/useBinanceStream";

const FLUSH_MS = 250;
const STATUS_LABELS = { live: "Live", connecting: "Connecting", reconnecting: "Reconnecting", unavailable: "Unavailable" };

const TradeHistory = memo(({ symbol }) => {
  const isLight = useThemeCheck();
  const [trades, setTrades] = useState([]);
  const tradesRef = useRef([]);
  const dirtyRef = useRef(false);

  const TC = useMemo(
    () => ({
      textPrimary: isLight ? "text-gray-900" : "text-white",
      textSecondary: isLight ? "text-gray-600" : "text-gray-400",
      textTertiary: isLight ? "text-gray-500" : "text-gray-400",

      bgCard: isLight
        ? "bg-white/70 backdrop-blur-xl shadow-md border border-gray-100 glass-card"
        : "bg-gray-900/95 backdrop-blur-none shadow-none border border-gray-700/50 glass-card",
      borderHeader: isLight ? "border-gray-100" : "border-gray-700/50",

      headerGradient:
        "bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent",

      bgLive: isLight
        ? "bg-green-100 border-none text-green-700"
        : "bg-green-400/10 border-none text-green-400",
      textLiveDot: isLight ? "bg-green-700" : "bg-green-400",

      textBuy: isLight ? "text-green-700" : "text-green-400",
      textSell: isLight ? "text-red-700" : "text-red-400",

      bgBuyHover: isLight ? "hover:bg-green-500/10" : "hover:bg-green-500/5",
      bgSellHover: isLight ? "hover:bg-red-500/10" : "hover:bg-red-500/5",

      textAmount: isLight ? "text-gray-800" : "text-gray-300",

      textEmpty: isLight ? "text-gray-500" : "text-gray-400",
    }),
    [isLight],
  );

  const status = useBinanceStream(symbol ? `${symbol.toLowerCase()}@trade` : null, (trade) => {
    if (!trade.t) return;
    const newTrade = {
      id: trade.t,
      price: parseFloat(trade.p),
      volume: parseFloat(trade.q),
      time: new Date(trade.T).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }),
      isBuyerMaker: trade.m,
    };
    tradesRef.current = [newTrade, ...tradesRef.current].slice(0, 30);
    dirtyRef.current = true;
  });

  // Reset when switching coins; busy pairs trade many times a second, so render in batches
  useEffect(() => {
    tradesRef.current = [];
    setTrades([]);
    const timer = setInterval(() => {
      if (!dirtyRef.current) return;
      dirtyRef.current = false;
      setTrades(tradesRef.current);
    }, FLUSH_MS);
    return () => clearInterval(timer);
  }, [symbol]);

  const renderTrade = useCallback(
    (trade, index) => {
      const isBuy = !trade.isBuyerMaker;
      const priceColor = isBuy ? TC.textBuy : TC.textSell;
      const bgColor = isBuy ? TC.bgBuyHover : TC.bgSellHover;
      const arrowColor = priceColor;

      return (
        <div
          key={`${trade.id}-${index}`}
          className={`grid grid-cols-3 gap-2 px-3 py-1 text-xs ${bgColor} transition-colors`}
        >
          <div className="flex items-center gap-1">
            {isBuy ? (
              <FaArrowUp className={`${arrowColor} text-xs flex-shrink-0`} />
            ) : (
              <FaArrowDown className={`${arrowColor} text-xs flex-shrink-0`} />
            )}
            <span className={`${priceColor} font-mono font-medium`}>
              {trade.price.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
          <span className={`${TC.textAmount} text-right font-mono`}>
            {trade.volume.toFixed(5)}
          </span>
          <span className={`${TC.textTertiary} text-right font-mono text-xs`}>
            {trade.time}
          </span>
        </div>
      );
    },
    [TC],
  );

  return (
    <div
      className={`${TC.bgCard} rounded-lg md:rounded-2xl overflow-hidden h-full flex flex-col`}
    >
      <div className={`p-3 border-b ${TC.borderHeader} flex-shrink-0`}>
        <div className="flex items-center justify-between mb-2">
          <h3 className={`text-base font-bold ${TC.headerGradient}`}>
            Trade History
          </h3>
          <div
            className={`flex items-center gap-2 text-xs px-2 py-0.5 rounded-full ${status === "live" ? TC.bgLive : isLight ? "bg-gray-100 text-gray-500" : "bg-white/5 text-gray-400"}`}
            role="status"
          >
            <div
              className={`w-1.5 h-1.5 rounded-full ${status === "live" ? TC.textLiveDot : "bg-gray-400"}`}
            ></div>
            <span className="font-semibold">{STATUS_LABELS[status]}</span>
          </div>
        </div>

        <div
          className={`grid grid-cols-3 gap-2 px-3 text-xs font-semibold ${TC.textSecondary}`}
        >
          <span>Price</span>
          <span className="text-right">Amount</span>
          <span className="text-right">Time</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide min-h-0">
        {trades.length === 0 ? (
          <div
            className={`flex items-center justify-center h-full ${TC.textEmpty}`}
          >
            <div className="text-center">
              <div className="text-2xl mb-2">📊</div>
              <p className="text-sm">Waiting for trades...</p>
            </div>
          </div>
        ) : (
          <div>{trades.map((trade, index) => renderTrade(trade, index))}</div>
        )}
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
});

TradeHistory.displayName = "TradeHistory";

export default TradeHistory;
