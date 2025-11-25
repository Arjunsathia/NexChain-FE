import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  FaWallet,
  FaCoins,
  FaChartLine,
  FaArrowUp,
  FaArrowDown,
} from "react-icons/fa";
import { useWalletContext } from "@/Context/WalletContext/useWalletContext";
import { useLivePortfolio } from "@/hooks/useLivePortfolio";
import { usePurchasedCoins } from "@/hooks/usePurchasedCoins";
import SparklineChart from "@/Components/Common/SparklineChart";
import TradeModal from "@/Pages/UserProfile/Components/TradeModal";

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

const HoldingsCard = () => {
  const isLight = useThemeCheck();
  const { balance } = useWalletContext();
  const { groupedHoldings, portfolioSummary, loading } = useLivePortfolio();
  const { purchasedCoins } = usePurchasedCoins();
  const [isMounted, setIsMounted] = useState(false);
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [livePrices, setLivePrices] = useState({});

  // WebSocket ref for live updates
  const ws = useRef(null);
  const livePricesRef = useRef({});

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Update ref when livePrices changes
  useEffect(() => {
    livePricesRef.current = livePrices;
  }, [livePrices]);

  // WebSocket setup for live price updates (omitted body for brevity, assumes logic remains)
  useEffect(() => {
    if (groupedHoldings.length === 0) return;

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

    try {
      ws.current = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams}`);

      ws.current.onopen = () => { console.log('WebSocket connected for holdings live prices'); };

      ws.current.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.stream && message.data) {
          const symbol = message.stream.replace('@ticker', '');
          const coinData = message.data;
          
          const symbolToCoinId = {
            "btcusdt": "bitcoin", "ethusdt": "ethereum", "bnbusdt": "binancecoin", "xrpusdt": "ripple", "adausdt": "cardano", "solusdt": "solana", "dogeusdt": "dogecoin", "dotusdt": "polkadot", "maticusdt": "matic-network", "ltcusdt": "litecoin", "linkusdt": "chainlink", "xlmusdt": "stellar", "atomusdt": "cosmos", "xmusdt": "monero", "etcusdt": "ethereum-classic", "bchusdt": "bitcoin-cash", "filusdt": "filecoin", "thetausdt": "theta", "vetusdt": "vechain", "trxusdt": "tron"
          };

          const coinId = symbolToCoinId[symbol];
          if (coinId) {
            setLivePrices(prev => ({
              ...prev,
              [coinId]: {
                current_price: parseFloat(coinData.c),
                price_change_percentage_24h: parseFloat(coinData.P),
                price_change_24h: parseFloat(coinData.p),
                total_volume: parseFloat(coinData.v) * parseFloat(coinData.c),
              }
            }));
          }
        }
      };

      ws.current.onerror = (error) => { console.error('Holdings WebSocket error:', error); };
      ws.current.onclose = () => { console.log('Holdings WebSocket disconnected'); };

    } catch (error) { console.error('Holdings WebSocket setup failed:', error); }

    return () => {
      if (ws.current) { ws.current.close(); }
    };
  }, [groupedHoldings]);

  const sortedHoldings = useMemo(() => {
    const holdingsWithLiveData = groupedHoldings.map(coin => {
      const livePriceData = livePrices[coin.coinId];
      if (livePriceData) {
        const currentPrice = livePriceData.current_price;
        const currentValue = (coin.totalQuantity || 0) * currentPrice;
        const remainingInvestment = coin.remainingInvestment || 0;
        const profitLoss = currentValue - remainingInvestment;
        const profitLossPercentage = remainingInvestment > 0 ? (profitLoss / remainingInvestment) * 100 : 0;

        return {
          ...coin,
          currentPrice: currentPrice,
          priceChange24h: livePriceData.price_change_percentage_24h,
          totalCurrentValue: currentValue,
          profitLoss: profitLoss,
          profitLossPercentage: profitLossPercentage
        };
      }
      return coin;
    });

    return [...(holdingsWithLiveData || [])].sort(
      (a, b) => (b.totalCurrentValue || 0) - (a.totalCurrentValue || 0)
    );
  }, [groupedHoldings, livePrices]);

  const totalPortfolioValue =
    (portfolioSummary?.totalCurrentValue || 0) + (balance || 0);

  const handleCoinClick = (coin) => {
    const mappedCoin = {
      id: coin.coinId || coin.id, coinId: coin.coinId || coin.id,
      name: coin.coinName || coin.name, coinName: coin.coinName || coin.name,
      symbol: coin.coinSymbol || coin.symbol, coinSymbol: coin.coinSymbol || coin.symbol,
      image: coin.image,
      current_price: coin.currentPrice || coin.current_price, currentPrice: coin.currentPrice || coin.current_price,
      price_change_percentage_24h: coin.priceChange24h || coin.price_change_24h, priceChange24h: coin.priceChange24h || coin.price_change_24h,
      sparkline: coin.sparkline, totalQuantity: coin.totalQuantity,
      remainingInvestment: coin.remainingInvestment, totalCurrentValue: coin.totalCurrentValue,
      profitLoss: coin.profitLoss, profitLossPercentage: coin.profitLossPercentage,
      documentId: coin.id, ...coin,
    };

    setSelectedCoin(mappedCoin);
    setShowTradeModal(true);
  };

  if (loading) {
    return <LoadingState isLight={isLight} />;
  }

  return (
    <>
      {/* 💡 Main Holdings Card Container */}
      <div className={`rounded-xl p-4 shadow-2xl fade-in ${
        isLight ? "bg-white border-gray-300" : "bg-gray-800/50 backdrop-blur-sm border-gray-700"
      } ${
        isMounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
      }`}>
        <Header isLight={isLight} />
        <PortfolioValue
          isLight={isLight}
          totalValue={totalPortfolioValue}
          profitLoss={portfolioSummary?.totalProfitLoss || 0}
          profitLossPercentage={portfolioSummary?.totalProfitLossPercentage || 0}
        />
        <div className="grid grid-cols-2 gap-3 mb-4 fade-in" style={{ animationDelay: "0.1s" }}>
          <MetricCard
            isLight={isLight}
            icon={FaWallet}
            label="Cash Balance"
            value={balance}
            color="green"
          />
          <MetricCard
            isLight={isLight}
            icon={FaCoins}
            label="Total Investment"
            value={portfolioSummary?.remainingInvestment || 0}
            color="cyan"
          />
        </div>
        <HoldingsList
          isLight={isLight}
          holdings={sortedHoldings}
          onCoinClick={handleCoinClick}
          livePrices={livePrices}
        />
      </div>

      {selectedCoin && (
        <TradeModal
          show={showTradeModal}
          onClose={() => {
            setShowTradeModal(false);
            setSelectedCoin(null);
          }}
          coin={selectedCoin}
          type="buy"
          showHoldingsInfo={true}
          purchasedCoins={purchasedCoins || []}
        />
      )}

      <ScrollbarHide />
    </>
  );
};

const LoadingState = ({ isLight }) => {
  const bgClasses = isLight ? "bg-white border-gray-300" : "bg-gray-800/50 backdrop-blur-sm border-gray-700";
  const skeletonBase = isLight ? "#e5e7eb" : "#2c303a";
  const skeletonHighlight = isLight ? "#f3f4f6" : "#3a3f4d";
  const skeletonFg = isLight ? "bg-gray-200" : "bg-gray-700";

  return (
    <div className={`rounded-xl p-4 fade-in ${bgClasses}`}>
      <div className="animate-pulse space-y-4">
        <div className={`h-24 ${skeletonFg} rounded-lg mb-4`}></div>
        <div className="grid grid-cols-2 gap-3">
          <div className={`h-20 ${skeletonFg} rounded-lg`}></div>
          <div className={`h-20 ${skeletonFg} rounded-lg`}></div>
        </div>
        <div className="space-y-3 mt-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className={`h-16 ${skeletonFg} rounded-lg`}></div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Header = ({ isLight }) => {
  const textClass = isLight ? "text-gray-900" : "text-white";
  const liveBg = isLight ? "bg-green-100 border-green-300" : "bg-green-400/10 border-green-400/20";
  const liveText = isLight ? "text-green-700" : "text-green-400";

  return (
    <div className="flex items-center justify-between mb-4 fade-in">
      <div className="flex items-center gap-3">
        <div className={isLight ? "p-2 bg-cyan-100 rounded-lg" : "p-2 bg-cyan-400/10 rounded-lg"}>
          <FaChartLine className={isLight ? "text-cyan-600 text-xl" : "text-cyan-400 text-xl"} />
        </div>
        <h2 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          Portfolio Overview
        </h2>
      </div>
      <div className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-full border ${liveBg}`}>
        <div className={`w-2 h-2 ${isLight ? "bg-green-600" : "bg-green-400"} rounded-full animate-pulse`}></div>
        <span className={`font-semibold ${liveText}`}>Live</span>
      </div>
    </div>
  );
};

const PortfolioValue = ({ isLight, totalValue, profitLoss, profitLossPercentage }) => {
  const bgClasses = isLight 
    ? "bg-cyan-100/50 border-cyan-400/50" 
    : "bg-gradient-to-br from-cyan-600/20 via-blue-600/20 to-purple-600/20 border-cyan-400/30";
  const textClass = isLight ? "text-gray-900" : "text-white";
  const labelClass = isLight ? "text-cyan-700" : "text-cyan-300";
  const pillClasses = (pL) => pL >= 0 
    ? isLight ? "bg-green-100 text-green-700 border-green-300" : "bg-green-500/20 text-green-400 border-green-500/30"
    : isLight ? "bg-red-100 text-red-700 border-red-300" : "bg-red-500/20 text-red-400 border-red-500/30";
  const percentageClasses = (pL) => pL >= 0 
    ? isLight ? "bg-green-100 text-green-700" : "bg-green-500/20 text-green-400" 
    : isLight ? "bg-red-100 text-red-700" : "bg-red-500/20 text-red-400";
    
  return (
    <div className={`mb-4 p-4 rounded-lg border transition-all duration-200 fade-in ${bgClasses}`} style={{ animationDelay: "0.05s" }}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className={`text-sm mb-2 font-semibold ${labelClass}`}>Total Portfolio Value</p>
          <p className={`text-2xl font-bold mb-2 ${textClass}`}>
            ${totalValue.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-full w-fit border ${pillClasses(profitLoss)}`}>
              {profitLoss >= 0 ? <FaArrowUp className="text-sm" /> : <FaArrowDown className="text-sm" />}
              <span className="font-bold">${Math.abs(profitLoss).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className={`text-sm font-semibold px-2 py-1 rounded-full ${percentageClasses(profitLossPercentage)}`}>
              {profitLossPercentage >= 0 ? "+" : ""}{profitLossPercentage?.toFixed(2) || '0.00'}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ isLight, icon: Icon, label, value, color }) => {
  const colorClasses = {
    green: { icon: isLight ? "text-green-700" : "text-green-400", bg: isLight ? "bg-green-100" : "bg-green-400/10", border: isLight ? "border-green-300" : "border-green-400/20", text: isLight ? "text-gray-900" : "text-white" },
    cyan: { icon: isLight ? "text-cyan-700" : "text-cyan-400", bg: isLight ? "bg-cyan-100" : "bg-cyan-400/10", border: isLight ? "border-cyan-300" : "border-cyan-400/20", text: isLight ? "text-gray-900" : "text-white" },
  };

  const colors = colorClasses[color] || colorClasses.cyan;
  const labelClass = isLight ? "text-gray-600" : "text-gray-400";

  return (
    <div className={`${colors.bg} border ${colors.border} rounded-lg p-3 text-center transition-all duration-200 hover:scale-105 fade-in`}>
      {Icon && (
        <div className="flex justify-center mb-2">
          <Icon className={`${colors.icon} text-xl`} />
        </div>
      )}
      <p className={`text-sm ${labelClass} mb-1 font-medium`}>{label}</p>
      <p className={`text-lg font-bold ${colors.icon}`}>
        ${(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </p>
    </div>
  );
};

const HoldingsList = ({ isLight, holdings, onCoinClick, livePrices }) => {
  const bgHeader = isLight ? "bg-gray-100 border-gray-300" : "bg-gray-800/30 border-gray-700";
  const textHeader = isLight ? "text-gray-900" : "text-white";
  const textCount = isLight ? "text-gray-600 bg-gray-300" : "text-gray-300 bg-gray-700";

  return (
    <div className="fade-in" style={{ animationDelay: "0.15s" }}>
      <div className={`flex items-center justify-between mb-3 p-3 rounded-lg border ${bgHeader}`}>
        <h3 className={`text-base font-bold flex items-center gap-2 ${textHeader}`}>
          <FaCoins className="text-yellow-500 text-base" />
          Your Holdings
        </h3>
        <span className={`text-sm font-bold px-2 py-1 rounded-full ${textCount}`}>
          {holdings.length} {holdings.length === 1 ? "Coin" : "Coins"}
        </span>
      </div>

      {holdings.length === 0 ? (
        <EmptyState isLight={isLight} />
      ) : (
        <div className="h-64 overflow-y-auto scrollbar-hide space-y-2">
          {holdings.map((coin, index) => (
            <HoldingItem 
              key={coin.coinId || coin.id || index} 
              coin={coin} 
              onCoinClick={onCoinClick}
              index={index}
              hasLiveData={!!livePrices[coin.coinId]}
              isLight={isLight}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const EmptyState = ({ isLight }) => {
  const borderClass = isLight ? "border-2 border-dashed border-gray-300 bg-gray-50/50" : "border-2 border-dashed border-gray-700 bg-gray-800/20";
  const textPrimary = isLight ? "text-gray-700" : "text-gray-300";
  const textSecondary = isLight ? "text-gray-500" : "text-gray-500";
  
  return (
    <div className={`text-center py-8 rounded-lg fade-in ${borderClass}`}>
      <div className="text-5xl mb-3">🪙</div>
      <p className={`text-base font-semibold mb-1 ${textPrimary}`}>No holdings yet</p>
      <p className={`text-sm ${textSecondary}`}>Start buying coins to build your portfolio</p>
    </div>
  );
};

const HoldingItem = ({ coin, onCoinClick, index, hasLiveData, isLight }) => {
  const remainingInvestment = coin.remainingInvestment || 0;
  const currentValue = coin.totalCurrentValue || 0;
  const profitLoss = coin.profitLoss || (currentValue - remainingInvestment);
  const profitLossPercentage = coin.profitLossPercentage || (remainingInvestment > 0 ? (profitLoss / remainingInvestment) * 100 : 0);

  const bgItem = isLight 
    ? "bg-white border-gray-300 hover:border-cyan-600/50 hover:bg-gray-50/50" 
    : "bg-gradient-to-br from-gray-800/50 to-gray-800/30 border-gray-700 hover:border-cyan-400/50";
  const borderPill = profitLoss >= 0 ? "bg-green-600" : "bg-red-600";
  
  return (
    <div 
      className={`relative flex items-center justify-between p-3 rounded-lg border transition-all duration-200 cursor-pointer group fade-in ${bgItem}`}
      style={{ animationDelay: `${0.2 + index * 0.05}s` }}
      onClick={() => onCoinClick(coin)}
    >
      {/* Live indicator */}
      {hasLiveData && (
        <div className={`absolute -top-1 -left-1 w-2 h-2 rounded-full animate-pulse z-10 ${isLight ? "bg-green-600" : "bg-green-400"}`}></div>
      )}
      
      {/* Profit/Loss Border Indicator */}
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-lg ${borderPill}`}></div>

      <CompactCoinInfo coin={coin} hasLiveData={hasLiveData} isLight={isLight} />
      <PriceInfo coin={coin} isLight={isLight} />
      <CompactHoldingsInfo 
        coin={coin} 
        profitLoss={profitLoss}
        profitLossPercentage={profitLossPercentage}
        isLight={isLight}
      />
    </div>
  );
};

const CompactCoinInfo = ({ coin, hasLiveData, isLight }) => {
  const textPrimary = isLight ? "text-gray-900" : "text-white";
  const textSecondary = isLight ? "text-gray-600" : "text-gray-400";
  const liveIndicator = isLight ? "text-green-600" : "text-green-400";
  const imageBorder = isLight ? "border-gray-300" : "border-gray-600";

  return (
    <div className="flex items-center gap-3 min-w-0 flex-1">
      {coin.image && (
        <div className="relative flex-shrink-0">
          <img 
            src={coin.image} 
            alt={coin.coinName || coin.name} 
            className={`w-8 h-8 rounded-full border ${imageBorder} group-hover:scale-110 transition-transform duration-200`} 
          />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-0.5">
          <p className={`font-bold text-sm truncate ${textPrimary}`}>{coin.coinName || coin.name}</p>
          {hasLiveData && (
            <span className={`text-xs font-bold ${liveIndicator}`}>●</span>
          )}
        </div>
        <p className={`text-xs font-semibold truncate ${textSecondary}`}>
          {(coin.coinSymbol || coin.symbol)?.toUpperCase()}
        </p>
      </div>
    </div>
  );
};

const PriceInfo = ({ coin, isLight }) => {
  const textPrimary = isLight ? "text-gray-900" : "text-white";
  const textSecondary = isLight ? "text-gray-600" : "text-gray-400";
  const pillClasses = (change) => change >= 0 
    ? isLight ? "bg-green-100 text-green-700" : "bg-green-500/20 text-green-400"
    : isLight ? "bg-red-100 text-red-700" : "bg-red-500/20 text-red-400";

  return (
    <div className="text-center min-w-[80px] mx-2">
      <p className={`text-xs mb-0.5 ${textSecondary}`}>Price</p>
      <p className={`text-sm font-bold ${textPrimary}`}>
        ${(coin.currentPrice || coin.current_price)?.toLocaleString("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: (coin.currentPrice || coin.current_price) < 1 ? 6 : 2,
        })}
      </p>
      <div 
        className={`text-xs font-bold px-1.5 py-0.5 rounded-full mt-0.5 ${pillClasses(coin.priceChange24h || coin.price_change_24h)}`}
      >
        {(coin.priceChange24h || coin.price_change_24h) >= 0 ? "+" : ""}{(coin.priceChange24h || coin.price_change_24h)?.toFixed(1) || '0.0'}%
      </div>
    </div>
  );
};

const CompactHoldingsInfo = ({ coin, profitLoss, profitLossPercentage, isLight }) => {
  const currentValue = coin.totalCurrentValue || 0;
  const textPrimary = isLight ? "text-gray-900" : "text-white";
  const textSecondary = isLight ? "text-gray-600" : "text-gray-400";
  const pillClasses = (pL) => pL >= 0 
    ? isLight ? "bg-green-100 text-green-700" : "bg-green-500/20 text-green-400"
    : isLight ? "bg-red-100 text-red-700" : "bg-red-500/20 text-red-400";
  const accentClass = isLight ? "text-cyan-700" : "text-cyan-400";

  return (
    <div className="text-right min-w-[100px]">
      <div className="mb-1">
        <p className={`text-xs mb-0.5 ${textSecondary}`}>Qty</p>
        <p className={`text-sm font-bold truncate ${textPrimary}`}>
          {(coin.totalQuantity || 0).toFixed(4)}
        </p>
      </div>
      
      <div className="mb-1">
        <p className={`text-xs mb-0.5 ${textSecondary}`}>Value</p>
        <p className={`text-sm font-bold ${accentClass}`}>
          ${currentValue.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
        </p>
      </div>
      
      <div 
        className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${pillClasses(profitLoss)}`}
      >
        {profitLoss >= 0 ? "+" : ""}${Math.abs(profitLoss).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
        <span className="text-xs ml-0.5">({profitLoss >= 0 ? "+" : ""}{profitLossPercentage?.toFixed(1) || '0.0'}%)</span>
      </div>
    </div>
  );
};

const ScrollbarHide = () => (
  <style jsx>{`
    .scrollbar-hide {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
    .scrollbar-hide::-webkit-scrollbar {
      display: none;
    }
  `}</style>
);

export default HoldingsCard;