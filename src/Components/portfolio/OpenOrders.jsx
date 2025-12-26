import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FaClock, FaTimes, FaLayerGroup } from 'react-icons/fa';
import api from '@/api/axiosConfig';
import useUserContext from '@/hooks/useUserContext';
import useThemeCheck from '@/hooks/useThemeCheck';
import toast from 'react-hot-toast';

const OpenOrders = ({ livePrices }) => {
  const isLight = useThemeCheck();
  const { user } = useUserContext();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState({});

  const TC = useMemo(() => ({
    bgContainer: isLight
      ? "bg-white/70 backdrop-blur-xl shadow-md border border-gray-100 glass-card rounded-xl"
      : "bg-gray-900/95 backdrop-blur-none shadow-none border border-gray-700/50 rounded-xl",
    textPrimary: isLight ? "text-gray-900" : "text-white",
    textSecondary: isLight ? "text-gray-500" : "text-gray-400",
    bgHover: isLight ? "hover:bg-blue-50/50" : "hover:bg-white/5",
    borderItem: isLight ? "border-gray-100" : "border-white/5",
  }), [isLight]);

  const fetchOrders = useCallback(async () => {
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
  }, [user]);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const handleExecute = useCallback(async (orderId, currentPrice) => {
    if (executing[orderId]) return;
    setExecuting(prev => ({ ...prev, [orderId]: true }));
    try {
      const res = await api.post('/orders/execute', { orderId, current_price: currentPrice });
      if (res.data.success) {
        toast.success(`Order Executed: ${res.data.order.coin_symbol.toUpperCase()}`);
        fetchOrders();
      }
    } catch (err) {
      console.error("Error executing order:", err);
    } finally {
      setExecuting(prev => {
        const newState = { ...prev };
        delete newState[orderId];
        return newState;
      });
    }
  }, [executing, fetchOrders]);

  useEffect(() => {
    if (!orders.length || !livePrices) return;
    orders.forEach(order => {
      if (order.status !== 'pending') return;
      const priceData = livePrices[order.coin_id];
      if (priceData && priceData.current_price) {
        const currentPrice = priceData.current_price;
        if (order.category === 'stop_limit' || order.category === 'stop_market') {
          if ((order.type === 'buy' && currentPrice >= order.stop_price) ||
            (order.type === 'sell' && currentPrice <= order.stop_price)) {
            handleExecute(order._id, currentPrice);
          }
        } else if (order.category === 'limit') {
          if ((order.type === 'buy' && currentPrice <= order.limit_price) ||
            (order.type === 'sell' && currentPrice >= order.limit_price)) {
            handleExecute(order._id, currentPrice);
          }
        }
      }
    });
  }, [orders, livePrices, handleExecute]);

  const handleCancel = async (orderId) => {
    try {
      const res = await api.put(`/orders/cancel/${orderId}`);
      if (res.data.success) {
        toast.success("Order cancelled");
        fetchOrders();
      }
    } catch {
      toast.error("Failed to cancel");
    }
  };

  if (!user || (orders.length === 0 && !loading)) return null;

  return (
    <div className={`p-1 fade-in ${TC.bgContainer}`}>
      <div className="px-4 pt-3 flex items-center justify-between mb-2">
        <h3 className="text-base font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent flex items-center gap-2 tracking-tight">
          <FaClock className="text-amber-500" size={14} />
          Open Orders
        </h3>
        {orders.length > 0 && (
          <span className={`text-[10px] ${TC.textSecondary} px-2 py-0.5 rounded-full border border-white/5 font-bold uppercase tracking-wider`}>
            {orders.length} Pending
          </span>
        )}
      </div>

      <div className={`overflow-hidden rounded-xl border ${isLight ? 'border-gray-100' : 'border-gray-700/50'} shadow-md mx-2 mb-2`}>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className={`${isLight ? "bg-gray-100/50" : "bg-white/5"} uppercase tracking-wider text-[10px] font-bold`}>
              <th className={`py-4 px-4 ${TC.textSecondary}`}>Pair</th>
              <th className={`py-4 ${TC.textSecondary}`}>Type</th>
              <th className={`py-4 ${TC.textSecondary}`}>Stop</th>
              <th className={`py-4 ${TC.textSecondary}`}>Limit</th>
              <th className={`py-4 ${TC.textSecondary}`}>Amount</th>
              <th className={`py-4 text-right pr-4 ${TC.textSecondary}`}>Action</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${isLight ? "divide-gray-100" : "divide-white/5"}`}>
            {orders.map((order) => (
              <tr key={order._id} className={`transition-colors text-sm ${TC.bgHover}`}>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <img src={order.coin_image} alt="" className="w-5 h-5 rounded-full" />
                    <span className={`font-bold ${TC.textPrimary}`}>{order.coin_symbol.toUpperCase()}</span>
                  </div>
                </td>
                <td className="py-3">
                  <span className={`text-[10px] font-bold uppercase ${order.type === 'buy' ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {order.category.replace('_', ' ')} ({order.type})
                  </span>
                </td>
                <td className={`py-3 font-bold ${TC.textPrimary}`}>{order.stop_price ? `$${order.stop_price.toLocaleString()}` : '-'}</td>
                <td className={`py-3 font-bold ${TC.textPrimary}`}>{order.limit_price ? `$${order.limit_price.toLocaleString()}` : 'MKT'}</td>
                <td className={`py-3 font-bold ${TC.textPrimary}`}>{order.quantity}</td>
                <td className="py-3 text-right pr-4">
                  <button onClick={() => handleCancel(order._id)} className="text-rose-500 hover:bg-rose-500/10 p-1.5 rounded-lg transition-colors">
                    <FaTimes size={14} />
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
