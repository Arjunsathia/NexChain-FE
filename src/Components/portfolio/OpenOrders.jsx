import React, { useState, useEffect } from 'react';
import { FaClock, FaTimes, FaExchangeAlt } from 'react-icons/fa';
import api from '@/api/axiosConfig';
import useUserContext from '@/Context/UserContext/useUserContext';
import toast from 'react-hot-toast';

const OpenOrders = ({ isLight, livePrices }) => {
  const { user } = useUserContext();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState({}); 

  const fetchOrders = async () => {
    if (!user) return;
    try {
      const res = await api.get(`/orders/${user.id}`);
      if (res.data.success) {
        setOrders(res.data.orders);
      }
    } catch (error) {
      console.error("Failed to fetch orders", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, [user]);

  const handleExecute = async (orderId, currentPrice) => {
    if (executing[orderId]) return;
    
    setExecuting(prev => ({ ...prev, [orderId]: true }));
    try {
      const res = await api.post('/orders/execute', {
        orderId,
        current_price: currentPrice
      });
      
      if (res.data.success) {
        toast.success(`Order Executed: ${res.data.order.coin_symbol.toUpperCase()}`);
        fetchOrders();
      }
    } catch (error) {
      console.error("Failed to execute order", error);
    } finally {
       setExecuting(prev => {
           const newState = { ...prev };
           delete newState[orderId];
           return newState;
       });
    }
  };

  // Monitor Prices
  useEffect(() => {
    if (!orders.length || !livePrices) return;

    orders.forEach(order => {
      if (order.status !== 'pending') return;
      
      const priceData = livePrices[order.coin_id];
      if (priceData && priceData.current_price) {
        const currentPrice = priceData.current_price;
        
        // STOP ORDERS
        if (order.category === 'stop_limit' || order.category === 'stop_market') {
            if (order.type === 'buy' && currentPrice >= order.stop_price) {
                handleExecute(order._id, currentPrice);
            } else if (order.type === 'sell' && currentPrice <= order.stop_price) {
                handleExecute(order._id, currentPrice);
            }
        }
        // LIMIT ORDERS
        else if (order.category === 'limit') {
            if (order.type === 'buy' && currentPrice <= order.limit_price) {
                handleExecute(order._id, currentPrice);
            } else if (order.type === 'sell' && currentPrice >= order.limit_price) {
                handleExecute(order._id, currentPrice);
            }
        }
      }
    });
  }, [orders, livePrices]);

  const handleCancel = async (orderId) => {
    try {
      const res = await api.put(`/orders/cancel/${orderId}`);
      if (res.data.success) {
        toast.success("Order cancelled successfully");
        fetchOrders(); // Refresh list
      }
    } catch (error) {
      toast.error("Failed to cancel order");
    }
  };

  if (!user) return null;

  const TC = {
    bgCard: isLight ? "bg-white/60 border-gray-200 backdrop-blur-sm shadow-sm sm:shadow-[0_6px_25px_rgba(0,0,0,0.12)]" : "bg-gray-800/40 border-gray-700 shadow-xl shadow-black/20",
    textPrimary: isLight ? "text-gray-900" : "text-white",
    textSecondary: isLight ? "text-gray-500" : "text-gray-400",
    rowHover: isLight ? "hover:bg-gray-50" : "hover:bg-white/5",
  };

  if (loading && orders.length === 0) {
    return <div className="animate-pulse h-32 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>;
  }

  if (orders.length === 0) return null;

  return (
    <div className={`rounded-lg md:rounded-2xl border p-3 md:p-6 ${TC.bgCard} fade-in`}>
      <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${TC.textPrimary}`}>
        <FaClock className="text-amber-500" />
        Open Orders
      </h3>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className={`text-xs uppercase ${TC.textSecondary} border-b border-gray-200 dark:border-gray-700`}>
              <th className="pb-3 pl-2">Pair</th>
              <th className="pb-3">Type</th>
              <th className="pb-3">Stop</th>
              <th className="pb-3">Limit</th>
              <th className="pb-3">Amount</th>
              <th className="pb-3">Filled</th>
              <th className="pb-3 text-right pr-2">Action</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {orders.map((order) => (
              <tr key={order._id} className={`border-b border-gray-100 dark:border-gray-800/50 transition-colors ${TC.rowHover}`}>
                <td className="py-3 pl-2 font-medium">
                  <div className="flex items-center gap-2">
                    <img src={order.coin_image} alt={order.coin_symbol} className="w-5 h-5 rounded-full" />
                    <span className={TC.textPrimary}>{order.coin_symbol.toUpperCase()}</span>
                  </div>
                </td>
                <td className={`py-3 font-bold ${order.type === 'buy' ? 'text-green-500' : 'text-red-500'}`}>
                  {order.category === 'stop_limit' ? 'STOP LIMIT' : 
                   order.category === 'stop_market' ? 'STOP MARKET' : 
                   order.category === 'limit' ? 'LIMIT' : 'MARKET'} 
                  <span className="text-xs ml-1 opacity-70">({order.type.toUpperCase()})</span>
                </td>
                <td className={`py-3 ${TC.textPrimary}`}>
                    {order.stop_price ? `$${order.stop_price.toLocaleString()}` : '-'}
                </td>
                <td className={`py-3 ${TC.textPrimary}`}>
                    {order.limit_price ? `$${order.limit_price.toLocaleString()}` : 'Market'}
                </td>
                <td className={`py-3 ${TC.textPrimary}`}>{order.quantity}</td>
                <td className={`py-3 ${TC.textSecondary}`}>
                  {((order.filled_quantity / order.quantity) * 100).toFixed(1)}%
                </td>
                <td className="py-3 text-right pr-2">
                  <button 
                    onClick={() => handleCancel(order._id)}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 p-1.5 rounded-lg transition-colors"
                    title="Cancel Order"
                  >
                    <FaTimes />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OpenOrders;
