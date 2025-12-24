import { useState, useEffect, useCallback } from 'react';
import { FaBell, FaTrash } from 'react-icons/fa';
import api from '@/api/axiosConfig';
import useUserContext from '@/hooks/useUserContext';
import toast from 'react-hot-toast';

const PriceAlerts = ({ isLight }) => {
  const { user } = useUserContext();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.get(`/alerts/${user.id}`);
      if (res.data.success) {
        setAlerts(res.data.alerts);
      }
    } catch (error) {
      console.error("Failed to fetch alerts", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 15000);
    return () => clearInterval(interval);
  }, [fetchAlerts]);

  const handleDelete = async (alertId) => {
    try {
      await api.delete(`/alerts/${alertId}`);
      toast.success("Alert deleted");
      fetchAlerts();
    } catch {
      toast.error("Failed to delete alert");
    }
  };

  if (!user) return null;

  const TC = {
    bgCard: isLight ? "bg-white/70 backdrop-blur-xl shadow-[0_6px_25px_rgba(0,0,0,0.12),0_0_10px_rgba(0,0,0,0.04)] border border-gray-100 glass-card" : "bg-gray-900/95 backdrop-blur-none shadow-xl border border-gray-700/50 ring-1 ring-white/5 glass-card",
    textPrimary: isLight ? "text-gray-900" : "text-white",
    textSecondary: isLight ? "text-gray-500" : "text-gray-400",
    rowHover: isLight ? "hover:bg-gray-50" : "hover:bg-white/5",
  };

  if (loading && alerts.length === 0) return null;
  if (alerts.length === 0) return null;

  return (
    <div className={`rounded-2xl border p-6 ${TC.bgCard} shadow-sm fade-in mt-6`}>
      <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${TC.textPrimary}`}>
        <FaBell className="text-yellow-500" />
        Price Alerts
      </h3>

      <div className="space-y-3">
        {alerts.map((alert) => (
          <div key={alert._id} className={`flex items-center justify-between p-3 rounded-xl border border-transparent ${TC.rowHover} transition-all`}>
            <div className="flex items-center gap-3">
              <img src={alert.coin_image} alt={alert.coin_symbol} className="w-8 h-8 rounded-full" />
              <div>
                <div className={`font-bold ${TC.textPrimary} flex items-center gap-2`}>
                  {alert.coin_symbol.toUpperCase()}
                  <span className={`text-xs px-2 py-0.5 rounded-full ${alert.condition === 'above' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {alert.condition === 'above' ? 'Above' : 'Below'}
                  </span>
                </div>
                <div className={`text-sm ${TC.textSecondary}`}>Target: ${alert.target_price.toLocaleString()}</div>
              </div>
            </div>

            <button
              onClick={() => handleDelete(alert._id)}
              className="text-gray-400 hover:text-red-500 p-2 transition-colors"
            >
              <FaTrash />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PriceAlerts;
