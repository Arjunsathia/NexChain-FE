// hooks/usePurchasedCoins.js - FIXED VERSION
import { useState, useEffect, useCallback } from "react";
import { getData, postForm } from "@/api/axiosConfig";
import { useUserId } from "@/hooks/useUserId";

export const usePurchasedCoins = () => {
  const [purchasedCoins, setPurchasedCoins] = useState([]);
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userId = useUserId();

  const fetchPurchasedCoins = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      setPurchasedCoins([]);
      setTransactionHistory([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await getData(`/purchases/${userId}`);

      if (response?.success) {
        const purchases = response.purchases || [];

        // FIXED: Proper investment tracking with remaining investment
        const transformedData = purchases.map((coin) => {
          const totalQuantity = coin.totalQuantity || coin.quantity || 0;
          const remainingInvestment = coin.remainingInvestment || coin.totalCost || 0;
          const currentPrice = coin.currentPrice || coin.coinPriceUSD || 0;
          const totalCurrentValue = totalQuantity * currentPrice;
          const profitLoss = totalCurrentValue - remainingInvestment;
          const profitLossPercentage = remainingInvestment > 0 ? (profitLoss / remainingInvestment) * 100 : 0;

          return {
            id: coin._id,
            coinId: coin.coin_id,
            coinName: coin.coinName,
            coinSymbol: coin.coinSymbol,
            coinPriceUSD: coin.coinPriceUSD,
            quantity: coin.quantity,
            totalQuantity,
            remainingInvestment,
            totalCost: coin.totalCost,
            averagePrice: coin.averagePrice || coin.coinPriceUSD,
            currentPrice,
            totalCurrentValue,
            profitLoss,
            profitLossPercentage,
            fees: coin.fees || 0,
            image: coin.image,
            purchaseDate: coin.purchaseDate,
            transactionCount: coin.transactionCount || 1,
          };
        });

        setPurchasedCoins(transformedData);
      } else {
        console.warn("⚠️ No purchases found or API returned failure");
        setPurchasedCoins([]);
      }
    } catch (err) {
      console.error("❌ Error fetching purchased coins:", err);
      setError(err.message);
      setPurchasedCoins([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Fetch transaction history
  const fetchTransactionHistory = useCallback(async () => {
    if (!userId) {
      setTransactionHistory([]);
      return;
    }

    try {
      const response = await getData(`/purchases/transactions/${userId}`);
      
      if (response?.success) {
        setTransactionHistory(response.transactions || []);
      } else {
        setTransactionHistory([]);
      }
    } catch (err) {
      console.error("❌ Error fetching transaction history:", err);
      setTransactionHistory([]);
    }
  }, [userId]);

  // Add purchase function
  const addPurchase = useCallback(
    async (purchaseData) => {
      if (!userId) {
        throw new Error("User not authenticated");
      }

      try {
        const backendPurchaseData = {
          user_id: userId,
          coin_id: purchaseData.coin_id,
          coin_name: purchaseData.coin_name,
          coin_symbol: purchaseData.coin_symbol,
          coin_price_usd: purchaseData.coin_price_usd,
          quantity: purchaseData.quantity,
          total_cost: purchaseData.total_cost,
          fees: purchaseData.fees || 0,
          image: purchaseData.image,
        };

        const response = await postForm("/purchases/buy", backendPurchaseData);

        if (response.success) {
          await fetchPurchasedCoins();
          await fetchTransactionHistory();
          return response;
        } else {
          throw new Error(response.error || "Purchase failed");
        }
      } catch (error) {
        console.error("❌ Error adding purchase:", error);
        throw error;
      }
    },
    [userId, fetchPurchasedCoins, fetchTransactionHistory]
  );

  // Sell coins function - FIXED with proper error handling
  const sellCoins = useCallback(
    async (sellData) => {
      if (!userId) {
        throw new Error("User not authenticated");
      }

      try {
        console.log("🔄 Selling coins - Raw data:", sellData);

        const backendSellData = {
          user_id: String(userId),
          coin_id: String(sellData.coin_id),
          quantity: Number(parseFloat(sellData.quantity)),
          current_price: Number(parseFloat(sellData.current_price)),
        };

        console.log("📤 Sending sell data to backend:", backendSellData);

        const response = await postForm("/purchases/sell", backendSellData);
        console.log("✅ Backend sell response:", response);

        if (response.success) {
          await fetchPurchasedCoins();
          await fetchTransactionHistory();
          return response;
        } else {
          const errorMessage = response.error || "Sell failed";
          throw new Error(errorMessage);
        }
      } catch (error) {
        console.error("❌ Error selling coins:", error);
        console.error("❌ Error details:", error.message);
        throw error;
      }
    },
    [userId, fetchPurchasedCoins, fetchTransactionHistory]
  );

  useEffect(() => {
    fetchPurchasedCoins();
    fetchTransactionHistory();
  }, [fetchPurchasedCoins, fetchTransactionHistory]);

  return {
    purchasedCoins,
    transactionHistory,
    loading,
    error,
    refetch: fetchPurchasedCoins,
    refreshPurchasedCoins: fetchPurchasedCoins,
    refreshTransactionHistory: fetchTransactionHistory,
    addPurchase,
    sellCoins,
  };
};