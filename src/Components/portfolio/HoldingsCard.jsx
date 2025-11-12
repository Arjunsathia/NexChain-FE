import React, { useState, useEffect, useMemo } from "react";
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

const HoldingsCard = () => {
  const { balance } = useWalletContext();
  const { groupedHoldings, portfolioSummary, loading } = useLivePortfolio();
  const { purchasedCoins } = usePurchasedCoins();
  const [isMounted, setIsMounted] = useState(false);
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [showTradeModal, setShowTradeModal] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const sortedHoldings = useMemo(() => {
    return [...(groupedHoldings || [])].sort(
      (a, b) => (b.totalCurrentValue || 0) - (a.totalCurrentValue || 0)
    );
  }, [groupedHoldings]);

  const totalPortfolioValue =
    (portfolioSummary?.totalCurrentValue || 0) + (balance || 0);

  const handleCoinClick = (coin) => {
    const mappedCoin = {
      id: coin.coinId || coin.id,
      coinId: coin.coinId || coin.id,
      name: coin.coinName || coin.name,
      coinName: coin.coinName || coin.name,
      symbol: coin.coinSymbol || coin.symbol,
      coinSymbol: coin.coinSymbol || coin.symbol,
      image: coin.image,
      current_price: coin.currentPrice || coin.current_price,
      currentPrice: coin.currentPrice || coin.current_price,
      price_change_percentage_24h: coin.priceChange24h || coin.price_change_24h,
      priceChange24h: coin.priceChange24h || coin.price_change_24h,
      sparkline: coin.sparkline,
      totalQuantity: coin.totalQuantity,
      remainingInvestment: coin.remainingInvestment,
      totalCurrentValue: coin.totalCurrentValue,
      documentId: coin.id,
      ...coin,
    };

    setSelectedCoin(mappedCoin);
    setShowTradeModal(true);
  };

  if (loading) {
    return <LoadingState />;
  }

  return (
    <>
      <div className="p-4">
        <div className={`bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4 shadow-2xl fade-in ${
          isMounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
        }`}>
          <Header />
          <PortfolioValue
            totalValue={totalPortfolioValue}
            profitLoss={portfolioSummary?.totalProfitLoss || 0}
            profitLossPercentage={portfolioSummary?.totalProfitLossPercentage || 0}
          />
          <div className="grid grid-cols-2 gap-3 mb-4 fade-in" style={{ animationDelay: "0.1s" }}>
            <MetricCard
              icon={FaWallet}
              label="Cash Balance"
              value={balance}
              color="green"
            />
            <MetricCard
              icon={FaCoins}
              label="Total Investment"
              value={portfolioSummary?.remainingInvestment || 0}
              color="cyan"
            />
          </div>
          <HoldingsList
            holdings={sortedHoldings}
            onCoinClick={handleCoinClick}
          />
        </div>
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
    </>
  );
};

const LoadingState = () => (
  <div className="p-4">
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4 fade-in">
      <div className="animate-pulse space-y-4">
        <div className="h-24 bg-gradient-to-r from-gray-700 to-gray-600 rounded-lg mb-4"></div>
        <div className="grid grid-cols-2 gap-3">
          <div className="h-20 bg-gray-700 rounded-lg"></div>
          <div className="h-20 bg-gray-700 rounded-lg"></div>
        </div>
        <div className="space-y-3 mt-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-700 rounded-lg"></div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const Header = () => (
  <div className="flex items-center justify-between mb-4 fade-in">
    <div className="flex items-center gap-3">
      <div className="p-2 bg-cyan-400/10 rounded-lg">
        <FaChartLine className="text-cyan-400 text-xl" />
      </div>
      <h2 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
        Portfolio Overview
      </h2>
    </div>
    <div className="flex items-center gap-2 text-sm bg-green-400/10 px-3 py-1.5 rounded-full border border-green-400/20">
      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
      <span className="text-green-400 font-semibold">Live</span>
    </div>
  </div>
);

const PortfolioValue = ({ totalValue, profitLoss, profitLossPercentage }) => (
  <div className="mb-4 p-4 bg-gradient-to-br from-cyan-600/20 via-blue-600/20 to-purple-600/20 rounded-lg border border-cyan-400/30 transition-all duration-200 fade-in" style={{ animationDelay: "0.05s" }}>
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <p className="text-sm text-cyan-300 mb-2 font-semibold">Total Portfolio Value</p>
        <p className="text-2xl font-bold text-white mb-2">
          ${totalValue.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-full w-fit ${
            profitLoss >= 0 ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-red-500/20 text-red-400 border border-red-500/30"
          }`}>
            {profitLoss >= 0 ? <FaArrowUp className="text-sm" /> : <FaArrowDown className="text-sm" />}
            <span className="font-bold">${Math.abs(profitLoss).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div className={`text-sm font-semibold px-2 py-1 rounded-full ${
            profitLossPercentage >= 0 ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
          }`}>
            {profitLossPercentage >= 0 ? "+" : ""}{profitLossPercentage.toFixed(2)}%
          </div>
        </div>
      </div>
    </div>
  </div>
);

const MetricCard = ({ icon: Icon, label, value, color }) => {
  const colorClasses = {
    green: { icon: "text-green-400", bg: "bg-green-400/10", border: "border-green-400/20" },
    cyan: { icon: "text-cyan-400", bg: "bg-cyan-400/10", border: "border-cyan-400/20" },
  };

  const colors = colorClasses[color] || colorClasses.cyan;

  return (
    <div className={`${colors.bg} border ${colors.border} rounded-lg p-3 text-center transition-all duration-200 hover:scale-105 fade-in`}>
      {Icon && (
        <div className="flex justify-center mb-2">
          <Icon className={`${colors.icon} text-xl`} />
        </div>
      )}
      <p className="text-sm text-gray-400 mb-1 font-medium">{label}</p>
      <p className={`text-lg font-bold ${colors.icon}`}>
        ${(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </p>
    </div>
  );
};

const HoldingsList = ({ holdings, onCoinClick }) => (
  <div className="fade-in" style={{ animationDelay: "0.15s" }}>
    <div className="flex items-center justify-between mb-3 p-3 bg-gray-800/30 rounded-lg border border-gray-700">
      <h3 className="text-base font-bold text-white flex items-center gap-2">
        <FaCoins className="text-yellow-400 text-base" />
        Your Holdings
      </h3>
      <span className="text-sm font-bold text-gray-300 bg-gray-700 px-2 py-1 rounded-full">
        {holdings.length} {holdings.length === 1 ? "Coin" : "Coins"}
      </span>
    </div>

    {holdings.length === 0 ? (
      <EmptyState />
    ) : (
      <div className="space-y-3">
        {holdings.map((coin, index) => (
          <HoldingItem 
            key={coin.coinId || coin.id || index} 
            coin={coin} 
            onCoinClick={onCoinClick}
            index={index}
          />
        ))}
      </div>
    )}
  </div>
);

const EmptyState = () => (
  <div className="text-center py-8 border-2 border-dashed border-gray-700 rounded-lg bg-gray-800/20 fade-in">
    <div className="text-5xl mb-3">🪙</div>
    <p className="text-gray-300 text-base font-semibold mb-1">No holdings yet</p>
    <p className="text-gray-500 text-sm">Start buying coins to build your portfolio</p>
  </div>
);

const HoldingItem = ({ coin, onCoinClick, index }) => {
  const remainingInvestment = coin.remainingInvestment || 0;
  const currentValue = coin.totalCurrentValue || 0;
  const profitLoss = currentValue - remainingInvestment;
  const profitLossPercentage = remainingInvestment > 0 ? (profitLoss / remainingInvestment) * 100 : 0;

  return (
    <div 
      className="relative flex items-center justify-between p-3 bg-gradient-to-br from-gray-800/50 to-gray-800/30 rounded-lg border border-gray-700 transition-all duration-200 hover:border-cyan-400/50 cursor-pointer group fade-in"
      style={{ animationDelay: `${0.2 + index * 0.05}s` }}
      onClick={() => onCoinClick(coin)}
    >
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
        profitLoss >= 0 ? "bg-green-500" : "bg-red-500"
      }`}></div>

      <CoinInfo coin={coin} />
      <PriceChart coin={coin} />
      <HoldingsInfo 
        coin={coin} 
        profitLoss={profitLoss}
        profitLossPercentage={profitLossPercentage}
      />
    </div>
  );
};

const CoinInfo = ({ coin }) => (
  <div className="flex items-center gap-3 min-w-0 flex-1">
    {coin.image && (
      <div className="relative flex-shrink-0">
        <img 
          src={coin.image} 
          alt={coin.coinName || coin.name} 
          className="w-10 h-10 rounded-full border border-gray-600" 
        />
      </div>
    )}
    <div className="min-w-0 flex-1">
      <p className="font-bold text-white text-base truncate">{coin.coinName || coin.name}</p>
      <p className="text-sm text-gray-400 font-semibold truncate">{(coin.coinSymbol || coin.symbol)?.toUpperCase()}</p>
    </div>
  </div>
);

const PriceChart = ({ coin }) => {
  const priceChange = coin.priceChange24h || coin.price_change_24h || 0;

  return (
    <div className="flex items-center gap-3">
      <div className="w-20 h-10 hidden xs:block">
        {coin.sparkline ? (
          <SparklineChart data={coin.sparkline.price || coin.sparkline} change={priceChange} />
        ) : (
          <span className="text-gray-500 text-xs">No Data</span>
        )}
      </div>
      <div className="text-right min-w-[100px]">
        <p className="text-sm text-gray-400 mb-0.5">Price</p>
        <p className="text-base font-bold text-white">
          ${(coin.currentPrice || coin.current_price)?.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: (coin.currentPrice || coin.current_price) < 1 ? 6 : 2,
          })}
        </p>
        <div 
          className={`text-sm font-semibold px-2 py-1 rounded-full ${
            priceChange >= 0 ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
          }`}
        >
          <span className="text-xs">24h: </span>
          {priceChange >= 0 ? "+" : ""}{priceChange?.toFixed(2)}%
        </div>
      </div>
    </div>
  );
};

const HoldingsInfo = ({ coin, profitLoss, profitLossPercentage }) => {
  const currentValue = coin.totalCurrentValue || 0;

  return (
    <div className="text-right min-w-[120px]">
      <p className="text-sm text-gray-400 mb-0.5">Quantity</p>
      <p className="text-base font-bold text-white mb-1 truncate">
        {(coin.totalQuantity || 0).toFixed(6)}
      </p>
      
      <p className="text-sm text-gray-400 mb-0.5">Value</p>
      <p className="text-sm text-gray-300 mb-1">
        ${currentValue.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </p>
      
      <div 
        className={`text-sm font-bold px-2 py-1 rounded-full ${
          profitLoss >= 0 ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
        }`}
      >
        {profitLoss >= 0 ? "+" : ""}${Math.abs(profitLoss).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        <span className="text-xs ml-1">({profitLoss >= 0 ? "+" : ""}{profitLossPercentage.toFixed(2)}%)</span>
      </div>
    </div>
  );
};

export default HoldingsCard;