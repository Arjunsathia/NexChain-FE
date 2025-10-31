import { useState, useCallback, useEffect } from 'react';
import { getData, postForm } from '@/api/axiosConfig';
import { useUserId } from '@/hooks/useUserId';
import WalletContext from './WalletContext';

const WalletProvider = ({ children }) => {
  const [balance, setBalance] = useState(10000);
  const [loading, setLoading] = useState(false);
  const userId = useUserId();

  const refreshBalance = useCallback(async () => {
    if (!userId) {
      console.warn("No user ID available for balance refresh");
      return 0;
    }

    setLoading(true);
    try {
      // console.log("🔄 Refreshing balance for user:", userId);
      const response = await getData(`/purchases/balance/${userId}`);
      
      if (response.success) {
        // console.log("💰 New balance:", response.virtualBalance);
        setBalance(response.virtualBalance);
        return response.virtualBalance;
      } else {
        console.error("❌ Balance fetch failed:", response.error);
        return balance;
      }
    } catch (error) {
      console.error("❌ Error refreshing balance:", error);
      return balance;
    } finally {
      setLoading(false);
    }
  }, [userId, balance]);

  const resetBalance = async () => {
    if (!userId) {
      alert("Please login to reset balance");
      return;
    }
    
    setLoading(true);
    try {
      const res = await postForm('/purchases/reset-balance', { user_id: userId });
      if (res.success) {
        setBalance(res.newBalance);
        alert('Balance reset to ₹10,000!');
      } else {
        alert('Failed to reset balance: ' + res.error);
      }
    } catch (err) {
      console.error('Failed to reset balance:', err);
      alert('Failed to reset balance');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      refreshBalance();
    }
  }, [userId, refreshBalance]);

  return (
    <WalletContext.Provider value={{
      balance,
      loading,
      setBalance,
      refreshBalance,
      resetBalance
    }}>
      {children}
    </WalletContext.Provider>
  );
};

export default WalletProvider;