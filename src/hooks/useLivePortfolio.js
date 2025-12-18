import { useMemo } from 'react';
import useCoinContext from '@/hooks/useCoinContext';
import { usePurchasedCoins } from './usePurchasedCoins';

export const useLivePortfolio = () => {
  const { coins: liveCoins } = useCoinContext();
  const { purchasedCoins, loading, error, refetch } = usePurchasedCoins();

  // Merge purchased coins with live market data
  const livePortfolio = useMemo(() => {
    // 🛡️ Safety Guard: Ensure both inputs are valid arrays
    if (!Array.isArray(purchasedCoins) || !Array.isArray(liveCoins)) {
      return [];
    }
    
    if (purchasedCoins.length === 0 || liveCoins.length === 0) {
      return [];
    }

    return purchasedCoins.map(purchasedCoin => {
      const liveCoin = liveCoins.find(coin => 
        coin.id === purchasedCoin.coinId || 
        coin.id === purchasedCoin.coin_id
      );
      
      if (!liveCoin) {
        console.warn(`No live data found for coin: ${purchasedCoin.coinName || purchasedCoin.coin_name}`);
        return {
          ...purchasedCoin,
          currentPrice: purchasedCoin.coinPriceUSD || purchasedCoin.coin_price_usd || 0,
          priceChange24h: 0,
          marketData: null,
          totalCurrentValue: (purchasedCoin.totalQuantity || purchasedCoin.quantity || 0) * (purchasedCoin.coinPriceUSD || purchasedCoin.coin_price_usd || 0),
          profitLoss: 0,
          profitLossPercentage: 0
        };
      }

      const totalQuantity = purchasedCoin.totalQuantity || purchasedCoin.quantity || 0;
      const remainingInvestment = purchasedCoin.remainingInvestment || purchasedCoin.totalCost || purchasedCoin.total_cost || 0;
      const totalCurrentValue = totalQuantity * (liveCoin.current_price || 0);
      const profitLoss = totalCurrentValue - remainingInvestment;
      const profitLossPercentage = remainingInvestment > 0 ? (profitLoss / remainingInvestment) * 100 : 0;

      return {
        ...purchasedCoin,
        coinId: purchasedCoin.coinId || purchasedCoin.coin_id,
        coinName: purchasedCoin.coinName || purchasedCoin.coin_name,
        coinSymbol: purchasedCoin.coinSymbol || purchasedCoin.coin_symbol,
        totalQuantity,
        remainingInvestment,
        currentPrice: liveCoin.current_price,
        priceChange24h: liveCoin.price_change_percentage_24h || 0,
        priceChange7d: liveCoin.price_change_percentage_7d_in_currency || 0,
        marketCap: liveCoin.market_cap,
        volume: liveCoin.total_volume,
        sparkline: liveCoin.sparkline_in_7d,
        totalCurrentValue,
        profitLoss,
        profitLossPercentage,
        marketData: liveCoin
      };
    });
  }, [purchasedCoins, liveCoins]);

  // Group holdings by coin (aggregate same coins)
  const groupedHoldings = useMemo(() => {
    if (!livePortfolio || livePortfolio.length === 0) return [];
    
    const holdingsMap = {};
    
    livePortfolio.forEach(coin => {
      const coinId = coin.coinId;
      
      if (!coinId) {
        console.warn('Coin without ID found:', coin);
        return;
      }
      
      if (!holdingsMap[coinId]) {
        holdingsMap[coinId] = {
          ...coin,
          totalQuantity: 0,
          remainingInvestment: 0,
          totalCurrentValue: 0,
          totalFees: 0,
          transactionCount: 0
        };
      }
      
      holdingsMap[coinId].totalQuantity += coin.totalQuantity || coin.quantity || 0;
      holdingsMap[coinId].remainingInvestment += coin.remainingInvestment || coin.totalCost || 0;
      holdingsMap[coinId].totalCurrentValue += coin.totalCurrentValue || 0;
      holdingsMap[coinId].totalFees += coin.fees || 0;
      holdingsMap[coinId].transactionCount += coin.transactionCount || 1;
    });

    return Object.values(holdingsMap).map(coin => ({
      ...coin,
      profitLoss: coin.totalCurrentValue - coin.remainingInvestment,
      profitLossPercentage: coin.remainingInvestment > 0 ? 
        ((coin.totalCurrentValue - coin.remainingInvestment) / coin.remainingInvestment) * 100 : 0
    }));
  }, [livePortfolio]);

  const portfolioSummary = useMemo(() => {
    const remainingInvestment = livePortfolio.reduce((sum, coin) => sum + (coin.remainingInvestment || coin.totalCost || 0), 0);
    const totalCurrentValue = livePortfolio.reduce((sum, coin) => sum + (coin.totalCurrentValue || 0), 0);
    const totalProfitLoss = totalCurrentValue - remainingInvestment;
    const totalProfitLossPercentage = remainingInvestment > 0 ? (totalProfitLoss / remainingInvestment) * 100 : 0;

    return {
      remainingInvestment,
      totalInvested: remainingInvestment,
      totalCurrentValue,
      totalProfitLoss,
      totalProfitLossPercentage,
      totalCoins: groupedHoldings.length
    };
  }, [livePortfolio, groupedHoldings]);

  return {
    livePortfolio,
    groupedHoldings,
    portfolioSummary,
    loading,
    error,
    refetch
  };
};