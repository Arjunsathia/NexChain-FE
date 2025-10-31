import React, { useCallback, useState } from 'react';
import { getData, postForm } from '../../api/axiosConfig';
import { useUserId } from '@/hooks/useUserId';
import PortfolioContext from './PortfolioContext';

const PortfolioProvider = ({ children }) => {
  const [purchasedCoins, setPurchasedCoins] = useState([]);
  const [loading, setLoading] = useState(false);
  const userId = useUserId();

  const refreshPurchasedCoins = useCallback(async () => {
    if (!userId) {
      // console.log('No user ID found, setting empty purchased coins');
      setPurchasedCoins([]);
      return;
    }

    setLoading(true);
    try {
      // console.log('🔄 Fetching purchases for user:', userId);
      const response = await getData(`/purchases/${userId}`);
      // console.log('Purchases API Response:', response);
      
      if (response.success) {
        const purchases = response.purchases || [];
        // console.log('✅ Purchases found:', purchases.length);
        
        const transformedData = purchases.map(coin => ({
          id: coin._id || coin.id,
          coinId: coin.coin_id || coin.coinId,
          coinName: coin.coinName || coin.name,
          coinSymbol: coin.coinSymbol || coin.symbol,
          coinPriceUSD: coin.coinPriceUSD || coin.currentPrice || coin.price,
          quantity: coin.quantity || coin.amount,
          totalCost: coin.totalCost || coin.total_cost,
          fees: coin.fees || 0,
          image: coin.image || coin.logo,
          purchaseDate: coin.purchaseDate || coin.createdAt
        }));
        
        // console.log('📊 Transformed purchased coins:', transformedData);
        setPurchasedCoins(transformedData);
      } else {
        // console.log('No purchases found');
        setPurchasedCoins([]);
      }
    } catch (error) {
      console.error('❌ Failed to fetch purchased coins:', error);
      setPurchasedCoins([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const addPurchase = useCallback(async (purchaseData) => {
    if (!userId) {
      throw new Error("User not authenticated");
    }

    try {
      // console.log('🔄 Adding purchase for user:', userId, purchaseData);
      
      const finalPurchaseData = {
        ...purchaseData,
        user_id: userId
      };

      const response = await postForm('/purchases/buy', finalPurchaseData);
      // console.log('✅ Backend purchase response:', response);
      
      if (response.success) {
        await refreshPurchasedCoins();
        return { 
          success: true, 
          newBalance: response.newBalance,
          purchase: response.purchase
        };
      } else {
        return { 
          success: false, 
          error: response.error 
        };
      }
    } catch (error) {
      console.error('❌ Purchase failed:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || error.message 
      };
    }
  }, [userId, refreshPurchasedCoins]);

  const sellCoins = useCallback(async (sellData) => {
    if (!userId) {
      throw new Error("User not authenticated");
    }

    try {
      // console.log('🔄 Selling coins for user:', userId, sellData);
      
      const finalSellData = {
        ...sellData,
        user_id: userId
      };

      const response = await postForm('/purchases/sell', finalSellData);
      // console.log('✅ Backend sell response:', response);
      
      if (response.success) {
        await refreshPurchasedCoins();
        return { 
          success: true, 
          newBalance: response.newBalance 
        };
      } else {
        return { 
          success: false, 
          error: response.error 
        };
      }
    } catch (error) {
      console.error('❌ Sell failed:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || error.message 
      };
    }
  }, [userId, refreshPurchasedCoins]);

  const value = {
    purchasedCoins,
    loading,
    refreshPurchasedCoins,
    addPurchase,
    sellCoins
  };

  return (
    <PortfolioContext.Provider value={value}>
      {children}
    </PortfolioContext.Provider>
  );
};

export default PortfolioProvider;