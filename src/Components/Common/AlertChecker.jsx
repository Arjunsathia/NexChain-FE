import React, { useEffect, useState, useRef } from 'react';
import useUserContext from '@/Context/UserContext/useUserContext';
import api from '@/api/axiosConfig';
import toast from 'react-hot-toast';
import { FaBell } from 'react-icons/fa';

const AlertChecker = () => {
  const { user } = useUserContext();
  const [alerts, setAlerts] = useState([]);
  const [livePrices, setLivePrices] = useState({});
  const ws = useRef(null);

  // 1. Fetch Active Alerts
  const fetchAlerts = async () => {
    if (!user?.id) return;
    try {
      const res = await api.get(`/alerts/${user.id}`);
      if (res.data.success) {
        setAlerts(res.data.alerts);
      }
    } catch (error) {
      console.error("Failed to fetch alerts for checker", error);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 30000); // Refresh alerts every 30s
    return () => clearInterval(interval);
  }, [user?.id]);

  // 2. WebSocket Connection for Alerted Coins
  useEffect(() => {
    if (!alerts.length) return;

    // Get unique symbols
    const symbols = [...new Set(alerts.map(a => {
        // Map coinId to symbol if needed, or use stored symbol
        // Assuming coin_symbol is stored as 'btc', 'eth' etc.
        return `${a.coin_symbol.toLowerCase()}usdt@ticker`; 
    }))].join('/');

    if (!symbols) return;

    try {
      if (ws.current) ws.current.close();
      
      ws.current = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${symbols}`);

      ws.current.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.stream && message.data) {
            const symbol = message.stream.replace('@ticker', '').replace('usdt', ''); // simplistic extraction
            const price = parseFloat(message.data.c);
            
            // We need to map back to coin_id for the check
            // The alert object has coin_id and coin_symbol. 
            // We can update livePrices keyed by coin_id
            
            // Find all alerts with this symbol to get their coin_ids
            const relevantAlerts = alerts.filter(a => a.coin_symbol.toLowerCase() === symbol);
            
            if (relevantAlerts.length) {
                setLivePrices(prev => {
                    const updates = {};
                    relevantAlerts.forEach(a => {
                        updates[a.coin_id] = { current_price: price };
                    });
                    return { ...prev, ...updates };
                });
            }
        }
      };

    } catch (error) {
      console.error("Alert WebSocket error", error);
    }

    return () => {
      if (ws.current) ws.current.close();
    };
  }, [alerts]);

  // 3. Check Alerts Periodically
  useEffect(() => {
    if (!alerts.length || Object.keys(livePrices).length === 0) return;

    const checkTriggers = async () => {
        const pricesToCheck = {};
        alerts.forEach(alert => {
            if (livePrices[alert.coin_id]) {
                pricesToCheck[alert.coin_id] = livePrices[alert.coin_id].current_price;
            }
        });

        if (Object.keys(pricesToCheck).length > 0) {
            try {
                const res = await api.post('/alerts/check', {
                    user_id: user.id,
                    current_prices: pricesToCheck
                });
                
                if (res.data.success && res.data.triggered.length > 0) {
                    // Alerts triggered! 
                    res.data.triggered.forEach(alert => {
                        toast((t) => (
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-yellow-100 rounded-lg">
                                    <FaBell className="text-yellow-600" size={16} />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900">Price Alert Triggered!</p>
                                    <p className="text-sm text-gray-700">
                                        {alert.coin_symbol.toUpperCase()} {alert.condition === 'above' ? 'passed' : 'dropped below'} ${alert.target_price.toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        ), { 
                            duration: 6000, 
                            position: 'top-right',
                            style: {
                                background: '#fff',
                                color: '#333',
                                border: '1px solid #e5e7eb',
                                padding: '12px 16px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            }
                        });
                    });

                    // Backend created notifications.
                    // We should refresh alerts to remove the triggered ones from our local list
                    fetchAlerts();
                }
            } catch (error) {
                console.error("Error checking alerts", error);
            }
        }
    };

    const timer = setInterval(checkTriggers, 10000); // Check every 10s
    return () => clearInterval(timer);

  }, [alerts, livePrices, user?.id]);

  return null; // Invisible component
};

export default AlertChecker;
