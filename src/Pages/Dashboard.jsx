import React, { useEffect, useState, useRef, useMemo } from "react";
import ChartSection from "@/Components/Dashboard/ChartSection";
import NewsPanel from "@/Components/Dashboard/NewsPanel";
import TrendingCoins from "@/Components/Dashboard/TrendingCoins";
import LearningHub from "@/Components/Dashboard/LearningHubWidget";
import { getCoins } from "@/api/coinApis";
import "react-loading-skeleton/dist/skeleton.css";
import WatchlistPreview from "@/Components/Dashboard/WatchlistPreview";
import TopCoins from "@/Components/Dashboard/TopCoins";
import UserProfileCard from "@/Components/Dashboard/UserProfileCard";
import PortfolioCard from "@/Components/Dashboard/PortfolioCard";
import RecentTradesCard from "@/Components/Dashboard/RecentTradesCard";
import DashboardSkeleton from "@/Components/Dashboard/DashboardSkeleton";

import useThemeCheck from "@/hooks/useThemeCheck";


const coinToSymbol = {
  bitcoin: "btcusdt",
  ethereum: "ethusdt",
  "usd-coin": "usdcusdt",
  binancecoin: "bnbusdt",
  ripple: "xrpusdt",
  cardano: "adausdt",
  solana: "solusdt",
  dogecoin: "dogeusdt",
};

export default function Dashboard() {
  const isLight = useThemeCheck();
  const [selectedCoinId, setSelectedCoinId] = useState("bitcoin");
  const [topCoins, setTopCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [liveData, setLiveData] = useState({});
  const ws = useRef(null);
  const liveDataRef = useRef({});

  
  const handleCoinClick = (coinId) => {
    setSelectedCoinId(coinId);
  };

  
  useEffect(() => {
    liveDataRef.current = liveData;
  }, [liveData]);

  useEffect(() => {
    const fetchTopCoins = async () => {
      
      const cachedData = localStorage.getItem("dashboardTopCoins");
      if (cachedData) {
        try {
           const parsed = JSON.parse(cachedData);
           if (Array.isArray(parsed) && parsed.length > 0) {
             setTopCoins(parsed);
             setSelectedCoinId(parsed[0].id);
             setLoading(false); 
           }
        } catch (e) { console.error("Cache parse error", e); }
      }

      try {
        if (!cachedData) setLoading(true);
        
        
        const data = await getCoins({ per_page: 5 });
        
        if (Array.isArray(data)) {
          const topThree = data.slice(0, 3);
          setTopCoins(topThree);
          localStorage.setItem("dashboardTopCoins", JSON.stringify(topThree)); 
          
          if (topThree.length > 0) {
             
             
             if (!cachedData) setSelectedCoinId(topThree[0].id);
          }
        } else {
           console.warn("Top coins data is not an array:", data);
           if (!cachedData) setTopCoins([]);
        }
      } catch (error) {
        console.error("Failed to load coins", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopCoins();
  }, []);

  
  const bufferRef = useRef({});

  
  useEffect(() => {
    if (topCoins.length === 0) return;

    const symbols = topCoins
      .map((coin) => coinToSymbol[coin.id])
      .filter(Boolean)
      .map((symbol) => `${symbol}@ticker`)
      .join("/");

    if (!symbols) return;

    
    const intervalId = setInterval(() => {
      if (Object.keys(bufferRef.current).length > 0) {
        setLiveData((prev) => ({
          ...prev,
          ...bufferRef.current,
        }));
        bufferRef.current = {}; 
        
        
        
        
      }
    }, 1500);

    try {
      ws.current = new WebSocket(
        `wss://stream.binance.com:9443/stream?streams=${symbols}`
      );

      ws.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.stream && data.data) {
          const symbol = data.stream.replace("@ticker", "");
          const coinId = Object.keys(coinToSymbol).find(
            (key) => coinToSymbol[key] === symbol
          );

          if (coinId) {
            const newPrice = parseFloat(data.data.c);
            const newChange = parseFloat(data.data.P);

            
            bufferRef.current[coinId] = {
              price: newPrice,
              change: newChange,
              isPositive: newChange >= 0,
            };
          }
        }
      };

      ws.current.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

    } catch (error) {
      console.error("WebSocket setup failed:", error);
    }

    return () => {
      clearInterval(intervalId);
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [topCoins]);

  

  
  const USERDATA_HEIGHT = "h-[150px]";

  
  const CHART_HEIGHT = "h-[620px]"; 

  
  const PORTFOLIO_HEIGHT = "h-[300px]";
  const TRADES_HEIGHT = "h-[266px]";

  
  const WATCHLIST_HEIGHT = "h-[280px]";
  const TRENDING_HEIGHT = "h-[250px]";
  const LEARNING_HUB_HEIGHT = "h-[186px]";

  if (loading && topCoins.length === 0) {
    return <DashboardSkeleton />;
  }

  return (
    <div
      className={`min-h-screen p-2 sm:p-4 lg:p-6 fade-in ${
        isLight ? "text-gray-900" : "text-white"
      }`}
      style={{ animationDelay: "0.1s" }}
    >
      {}
      <div className="xl:hidden flex flex-col gap-4">
        {}
        <div
          className="fade-in"
          style={{ animationDelay: "0s" }}
        >
          <UserProfileCard />
        </div>

        {}
        <div className="fade-in" style={{ animationDelay: "0.05s" }}>
          <div className="space-y-1">
            <h2
              className={`text-lg font-bold mb-3 px-1 ${
                isLight ? "text-gray-900" : "text-white"
              }`}
            >
              Top Cryptos
            </h2>
            <TopCoins
              topCoins={topCoins}
              selectedCoinId={selectedCoinId}
              setSelectedCoinId={handleCoinClick}
              isMobile={true}
              liveData={liveData}
              loading={loading}
            />
          </div>
        </div>

        {}
        <div className="fade-in" style={{ animationDelay: "0.1s" }}>
          <ChartSection coinId={selectedCoinId} />
        </div>

        {}
        <div className="fade-in" style={{ animationDelay: "0.15s" }}>
          <PortfolioCard />
        </div>

        {}
        <div className="flex flex-col gap-4">
          <div className="fade-in" style={{ animationDelay: "0.2s" }}>
            <WatchlistPreview />
          </div>
          <div className="fade-in" style={{ animationDelay: "0.25s" }}>
            <TrendingCoins />
          </div>
        </div>

        {}
        <div className="fade-in" style={{ animationDelay: "0.3s" }}>
          <NewsPanel />
        </div>

        {}
        <div className="fade-in" style={{ animationDelay: "0.35s" }}>
          <RecentTradesCard />
        </div>

        {}
        <div className="fade-in" style={{ animationDelay: "0.4s" }}>
          <LearningHub />
        </div>
      </div>

      {}
      <div className="hidden xl:flex flex-col gap-6">
        <div className="grid grid-cols-12 gap-6 items-start">
          {}
          <div className="col-span-3 flex flex-col gap-6">
            <div
              className={`fade-in ${USERDATA_HEIGHT}`}
              style={{ animationDelay: "0s" }}
            >
              <UserProfileCard />
            </div>
            <div
              className={`fade-in ${PORTFOLIO_HEIGHT}`}
              style={{ animationDelay: "0.05s" }}
            >
              <PortfolioCard />
            </div>
            <div
              className={`fade-in ${TRADES_HEIGHT}`}
              style={{ animationDelay: "0.1s" }}
            >
              <RecentTradesCard />
            </div>
          </div>

          {}
          <div className="col-span-6 flex flex-col gap-6">
            {}
            <div className="fade-in" style={{ animationDelay: "0.1s" }}>
              <TopCoins
                topCoins={topCoins}
                selectedCoinId={selectedCoinId}
                setSelectedCoinId={handleCoinClick}
                isMobile={false}
                liveData={liveData}
                loading={loading}
              />
            </div>

            {}
            <div
              className={`fade-in ${CHART_HEIGHT}`}
              style={{ animationDelay: "0.15s" }}
            >
              <ChartSection coinId={selectedCoinId} />
            </div>
          </div>

          {}
          <div className="col-span-3 flex flex-col gap-6">
            <div
              className={`fade-in ${WATCHLIST_HEIGHT}`}
              style={{ animationDelay: "0.15s" }}
            >
              <WatchlistPreview />
            </div>
            <div
              className={`fade-in ${TRENDING_HEIGHT}`}
              style={{ animationDelay: "0.2s" }}
            >
              <TrendingCoins />
            </div>
            <div
              className={`fade-in ${LEARNING_HUB_HEIGHT}`}
              style={{ animationDelay: "0.25s" }}
            >
              <LearningHub />
            </div>
          </div>
        </div>

        {}
        <div className="fade-in" style={{ animationDelay: "0.2s" }}>
          <NewsPanel />
        </div>
      </div>
    </div>
  );
}