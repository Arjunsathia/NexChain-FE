import useThemeCheck from '@/hooks/useThemeCheck';
import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
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
  const { balance } = useWalletContext();
  const { groupedHoldings, portfolioSummary: initialSummary, loading: portfolioLoading } = useLivePortfolio();
  const { purchasedCoins } = usePurchasedCoins();
  
  const [livePrices, setLivePrices] = useState({});
  const ws = useRef(null);

  
  const [tradeModal, setTradeModal] = useState({
    show: false,
    coin: null,
    type: "buy",
  });

  
  const TC = useMemo(() => ({
    bgPage: isLight ? "bg-gray-50" : "bg-gray-900",
    textPrimary: isLight ? "text-gray-900" : "text-white",
    textSecondary: isLight ? "text-gray-600" : "text-gray-400",
    bgHeader: isLight ? "bg-white/80 backdrop-blur-md border-b border-gray-200" : "bg-gray-900/80 backdrop-blur-md border-b border-gray-800",
    iconBg: isLight ? "bg-blue-50 text-blue-600" : "bg-blue-500/10 text-blue-400",
  }), [isLight]);

  
  useEffect(() => {
    if (!groupedHoldings || groupedHoldings.length === 0) return;

    const symbols = groupedHoldings
      .map(coin => {
        const symbolMap = {
          bitcoin: "btcusdt", ethereum: "ethusdt", binancecoin: "bnbusdt", ripple: "xrpusdt", cardano: "adausdt", solana: "solusdt", dogecoin: "dogeusdt", polkadot: "dotusdt", "matic-network": "maticusdt", litecoin: "ltcusdt", chainlink: "linkusdt", "stellar": "xlmusdt", "cosmos": "atomusdt", "monero": "xmusdt", "ethereum-classic": "etcusdt", "bitcoin-cash": "bchusdt", "filecoin": "filusdt", "theta": "thetausdt", "vechain": "vetusdt", "tron": "trxusdt"
        };
        return symbolMap[coin.coinId] ? `${symbolMap[coin.coinId]}@ticker` : null;
      })
      .filter(Boolean);

    if (symbols.length === 0) return;

    const streams = symbols.join('/');
    let lastUpdate = 0;
    const THROTTLE_MS = 2000; 

    try {
      if (ws.current) ws.current.close();
      
      ws.current = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams}`);

      ws.current.onopen = () => { };

      ws.current.onmessage = (event) => {
        const now = Date.now();
        if (now - lastUpdate < THROTTLE_MS) return; 

        const message = JSON.parse(event.data);
        if (message.stream && message.data) {
          lastUpdate = now;
          const symbol = message.stream.replace('@ticker', '');
          const coinData = message.data;
          
          const symbolToCoinId = {
            "btcusdt": "bitcoin", "ethusdt": "ethereum", "bnbusdt": "binancecoin", "xrpusdt": "ripple", "adausdt": "cardano", "solusdt": "solana", "dogeusdt": "dogecoin", "dotusdt": "polkadot", "maticusdt": "matic-network", "ltcusdt": "litecoin", "linkusdt": "chainlink", "xlmusdt": "stellar", "atomusdt": "cosmos", "xmusdt": "monero", "etcusdt": "ethereum-classic", "bchusdt": "bitcoin-cash", "filusdt": "filecoin", "thetausdt": "theta", "vechain": "vetusdt", "tron": "trxusdt"
          };

          const coinId = symbolToCoinId[symbol];
          if (coinId) {
            setLivePrices(prev => ({
              ...prev,
              [coinId]: {
                current_price: parseFloat(coinData.c),
                price_change_percentage_24h: parseFloat(coinData.P),
                price_change_24h: parseFloat(coinData.p),
              }
            }));
          }
        }
      };

      ws.current.onerror = (error) => { console.error('Portfolio WebSocket error:', error); };

    } catch (error) { console.error('Portfolio WebSocket setup failed:', error); }

    return () => {
      if (ws.current) { ws.current.close(); }
    };
  }, [groupedHoldings]);

  
  const mergedHoldings = useMemo(() => {
    if (!groupedHoldings) return [];
    
    return groupedHoldings.map(coin => {
      const liveData = livePrices[coin.coinId];
      if (liveData) {
        const currentPrice = liveData.current_price;
        const totalCurrentValue = (coin.totalQuantity || 0) * currentPrice;
        const remainingInvestment = coin.remainingInvestment || 0;
        const profitLoss = totalCurrentValue - remainingInvestment;
        const profitLossPercentage = remainingInvestment > 0 ? (profitLoss / remainingInvestment) * 100 : 0;

        return {
          ...coin,
          currentPrice,
          priceChange24h: liveData.price_change_percentage_24h,
          totalCurrentValue,
          profitLoss,
          profitLossPercentage
        };
      }
      return coin;
    });
  }, [groupedHoldings, livePrices]);

  
  const liveSummary = useMemo(() => {
    const totalCurrentValue = mergedHoldings.reduce((sum, coin) => sum + (coin.totalCurrentValue || 0), 0);
    const totalInvested = mergedHoldings.reduce((sum, coin) => sum + (coin.remainingInvestment || 0), 0);
    const totalProfitLoss = totalCurrentValue - totalInvested;
    const totalProfitLossPercentage = totalInvested > 0 ? (totalProfitLoss / totalInvested) * 100 : 0;

    return {
      totalCurrentValue,
      remainingInvestment: totalInvested,
      totalProfitLoss,
      totalProfitLossPercentage
    };
  }, [mergedHoldings]);

  
  const topPerformer = useMemo(() => {
    if (!mergedHoldings || mergedHoldings.length === 0) return null;
    return [...mergedHoldings].sort((a, b) => (b.profitLossPercentage || 0) - (a.profitLossPercentage || 0))[0];
  }, [mergedHoldings]);

  const handleTrade = useCallback((coin) => {
    setTradeModal({
      show: true,
      coin: { ...coin, id: coin.coinId }, 
      type: "buy", 
    });
  }, []);

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 10);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`min-h-screen p-2 sm:p-5 transition-opacity duration-500 ${isMounted ? 'opacity-100' : 'opacity-0'}`}>

      <div className="max-w-7xl mx-auto px-0 sm:px-4 lg:px-6 pb-8 space-y-8">
        
        {}
        <div className="fade-in" style={{ animationDelay: "0.1s" }}>
          <PortfolioHeader 
            isLight={isLight} 
            portfolioSummary={liveSummary} 
            balance={balance} 
            loading={portfolioLoading}
            topPerformer={topPerformer}
          />
        </div>

        {}
        <div className="space-y-4 fade-in" style={{ animationDelay: "0.2s" }}>
          <HoldingsTable 
            isLight={isLight} 
            holdings={mergedHoldings} 
            loading={portfolioLoading} 
            onTrade={handleTrade} 
          />
        </div>

        {}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 fade-in" style={{ animationDelay: "0.3s" }}>
          <div className="lg:col-span-2">
            <PerformanceChart 
              isLight={isLight} 
              groupedHoldings={mergedHoldings} 
              balance={balance} 
              loading={portfolioLoading} 
            />
          </div>
          <div className="lg:col-span-1">
            <PortfolioDistribution 
              isLight={isLight} 
              groupedHoldings={mergedHoldings} 
              balance={balance} 
              loading={portfolioLoading} 
            />
          </div>
        </div>

        {}
        <div className="fade-in" style={{ animationDelay: "0.35s" }}>
           <OpenOrders isLight={isLight} livePrices={livePrices} />
        </div>



        {}
        <div className="pt-8 border-t border-gray-200/10 fade-in" style={{ animationDelay: "0.4s" }}>
           <TransactionHistory />
        </div>

      </div>

      {}
      <TradeModal
        show={tradeModal.show}
        onClose={() => setTradeModal({ ...tradeModal, show: false })}
        coin={tradeModal.coin}
        type={tradeModal.type}
        purchasedCoins={purchasedCoins}
      />
    </div>
  );
};

export default PortfolioPage;