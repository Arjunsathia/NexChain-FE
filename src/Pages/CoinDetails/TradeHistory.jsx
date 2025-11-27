import React, { useState, useEffect, useRef, useCallback, memo, useMemo } from 'react';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';

// Utility to check if light mode is active based on global class
const useThemeCheck = () => {
    const [isLight, setIsLight] = useState(!document.documentElement.classList.contains('dark'));

    useEffect(() => {
        const observer = new MutationObserver(() => {
            setIsLight(!document.documentElement.classList.contains('dark'));
        });

        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

        return () => observer.disconnect();
    }, []);

    return isLight;
};

const TradeHistory = memo(({ symbol = 'btcusdt' }) => {
  const isLight = useThemeCheck();
  const [trades, setTrades] = useState([]);
  const ws = useRef(null);
  const tradesRef = useRef([]);

  // 💡 Theme Classes Helper
  const TC = useMemo(() => ({
    textPrimary: isLight ? "text-gray-900" : "text-white",
    textSecondary: isLight ? "text-gray-600" : "text-gray-400",
    textTertiary: isLight ? "text-gray-500" : "text-gray-400", // Used for time

    bgCard: isLight ? "bg-white shadow-[0_6px_25px_rgba(0,0,0,0.12)] border-none" : "bg-gray-800/50 backdrop-blur-xl shadow-xl shadow-black/20 border-none",
    borderHeader: isLight ? "border-gray-300/50" : "border-gray-700/50",

    // Header/Title
    headerGradient: "bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent",
    
    // Live Indicator
    bgLive: isLight ? "bg-green-100 border-none text-green-700" : "bg-green-400/10 border-none text-green-400",
    textLiveDot: isLight ? "bg-green-700" : "bg-green-400",

    // Trade Colors
    textBuy: isLight ? "text-green-700" : "text-green-400",
    textSell: isLight ? "text-red-700" : "text-red-400",
    
    bgBuyHover: isLight ? 'hover:bg-green-500/10' : 'hover:bg-green-500/5',
    bgSellHover: isLight ? 'hover:bg-red-500/10' : 'hover:bg-red-500/5',

    // Row Text
    textAmount: isLight ? "text-gray-800" : "text-gray-300",
    
    // Empty State Text
    textEmpty: isLight ? "text-gray-500" : "text-gray-400",
    
  }), [isLight]);


  useEffect(() => {
    const connectWebSocket = () => {
      const wsUrl = `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@trade`;
      ws.current = new WebSocket(wsUrl);

      ws.current.onmessage = (event) => {
        const trade = JSON.parse(event.data);
        const newTrade = {
          id: trade.t,
          price: parseFloat(trade.p),
          volume: parseFloat(trade.q),
          time: new Date(trade.T).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit',
            hour12: false 
          }),
          isBuyerMaker: trade.m,
        };

        tradesRef.current = [newTrade, ...tradesRef.current].slice(0, 30);
        setTrades([...tradesRef.current]);
      };

      ws.current.onerror = (error) => {
        console.error('TradeHistory WebSocket error:', error);
      };
    };

    connectWebSocket();

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [symbol]);

  const renderTrade = useCallback((trade, index) => {
    const isBuy = !trade.isBuyerMaker;
    const priceColor = isBuy ? TC.textBuy : TC.textSell;
    const bgColor = isBuy ? TC.bgBuyHover : TC.bgSellHover;
    const arrowColor = priceColor; // Use the same color for the arrow as the price
    
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
            {trade.price.toLocaleString('en-US', { 
              minimumFractionDigits: 2, 
              maximumFractionDigits: 2 
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
  }, [TC]);

  return (
    <div className={`${TC.bgCard} rounded-xl overflow-hidden h-full flex flex-col`}>
      <div className={`p-3 border-b ${TC.borderHeader} flex-shrink-0`}>
        <div className="flex items-center justify-between mb-2">
          <h3 className={`text-base font-bold ${TC.headerGradient}`}>
            Trade History
          </h3>
          <div className={`flex items-center gap-2 text-xs px-2 py-0.5 rounded-full ${TC.bgLive}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${TC.textLiveDot}`}></div>
            <span className="font-semibold">Live</span>
          </div>
        </div>

        <div className={`grid grid-cols-3 gap-2 px-3 text-xs font-semibold ${TC.textSecondary}`}>
          <span>Price</span>
          <span className="text-right">Amount</span>
          <span className="text-right">Time</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide min-h-0">
        {trades.length === 0 ? (
          <div className={`flex items-center justify-center h-full ${TC.textEmpty}`}>
            <div className="text-center">
              <div className="text-2xl mb-2">📊</div>
              <p className="text-sm">Waiting for trades...</p>
            </div>
          </div>
        ) : (
          <div>
            {trades.map((trade, index) => renderTrade(trade, index))}
          </div>
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

TradeHistory.displayName = 'TradeHistory';

export default TradeHistory;