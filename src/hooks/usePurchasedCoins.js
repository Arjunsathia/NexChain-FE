import { useState, useEffect, useCallback } from 'react';
import { getData, postForm } from '@/api/axiosConfig';
import { useUserId } from '@/hooks/useUserId';

export const usePurchasedCoins = () => {
  const [purchasedCoins, setPurchasedCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userId = useUserId();

  const fetchPurchasedCoins = useCallback(async () => {
    if (!userId) {
      // console.log("No user ID, skipping purchase fetch");
      setLoading(false);
      setPurchasedCoins([]);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // console.log("🔄 Fetching purchased coins for user:", userId);
      const response = await getData(`/purchases/${userId}`);
      // console.log("📥 Purchased coins API response:", response);
      
      if (response?.success) {
        const purchases = response.purchases || [];
        // console.log("✅ Purchased coins fetched:", purchases);
        
        // Transform data to match frontend expectations
        const transformedData = purchases.map(coin => ({
          id: coin._id, // Use _id from MongoDB
          coinId: coin.coin_id,
          coinName: coin.coinName,
          coinSymbol: coin.coinSymbol,
          coinPriceUSD: coin.coinPriceUSD,
          quantity: coin.quantity,
          totalCost: coin.totalCost,
          fees: coin.fees,
          image: coin.image,
          purchaseDate: coin.purchaseDate
        }));
        
        // console.log("📊 Transformed purchased coins:", transformedData);
        setPurchasedCoins(transformedData);
      } else {
        console.warn("⚠️ No purchases found or API returned failure");
        setPurchasedCoins([]);
      }
    } catch (err) {
      console.error('❌ Error fetching purchased coins:', err);
      setError(err.message);
      setPurchasedCoins([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Add purchase function
  const addPurchase = useCallback(async (purchaseData) => {
    if (!userId) {
      throw new Error("User not authenticated");
    }

    try {
      // console.log("🔄 Adding purchase:", purchaseData);
      
      // Ensure data matches backend expectations
      const backendPurchaseData = {
        user_id: userId,
        coin_id: purchaseData.coin_id,
        coin_name: purchaseData.coin_name, // Backend expects coin_name (not coinName)
        coin_symbol: purchaseData.coin_symbol, // Backend expects coin_symbol (not coinSymbol)
        coin_price_usd: purchaseData.coin_price_usd, // Backend expects coin_price_usd (not coinPriceUSD)
        quantity: purchaseData.quantity,
        total_cost: purchaseData.total_cost, // Backend expects total_cost (not totalCost)
        fees: purchaseData.fees,
        image: purchaseData.image
      };

      // console.log("📤 Sending to backend:", backendPurchaseData);
      
      const response = await postForm('/purchases/buy', backendPurchaseData);
      // console.log("✅ Backend purchase response:", response);
      
      if (response.success) {
        await fetchPurchasedCoins(); // Refresh data
        return response;
      } else {
        throw new Error(response.error || 'Purchase failed');
      }
    } catch (error) {
      console.error('❌ Error adding purchase:', error);
      throw error;
    }
  }, [userId, fetchPurchasedCoins]);

  // Sell coins function
  const sellCoins = useCallback(async (sellData) => {
    if (!userId) {
      throw new Error("User not authenticated");
    }

    try {
      // console.log("🔄 Selling coins:", sellData);
      
      const backendSellData = {
        user_id: userId,
        coin_id: sellData.coin_id,
        quantity: sellData.quantity,
        current_price: sellData.current_price
      };

      const response = await postForm('/purchases/sell', backendSellData);
      // console.log("✅ Backend sell response:", response);
      
      if (response.success) {
        await fetchPurchasedCoins(); // Refresh data
        return response;
      } else {
        throw new Error(response.error || 'Sell failed');
      }
    } catch (error) {
      console.error('❌ Error selling coins:', error);
      throw error;
    }
  }, [userId, fetchPurchasedCoins]);

  useEffect(() => {
    fetchPurchasedCoins();
  }, [fetchPurchasedCoins]);

  return {
    purchasedCoins,
    loading,
    error,
    refetch: fetchPurchasedCoins,
    addPurchase,
    sellCoins
  };
};