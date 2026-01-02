import React, { useEffect, useState, useRef, useCallback } from 'react';
import useUserContext from '@/hooks/useUserContext';
import api from '@/api/axiosConfig';
import toast from 'react-hot-toast';
import { FaBell } from 'react-icons/fa';

const AlertChecker = () => {
  const { user } = useUserContext();
  const [alerts, setAlerts] = useState([]);
  const [livePrices, setLivePrices] = useState({});
  const ws = useRef(null);


  const fetchAlerts = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await api.get(`/alerts/${user.id}`);
      if (res.data.success) {
        setAlerts(res.data.alerts);
      }
    } catch {
      // Silent fail for background polling
    }
  }, [user?.id]);

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, [fetchAlerts]);


  useEffect(() => {
    if (!alerts.length) return;


    const symbols = [...new Set(alerts.map(a => {


      return `${a.coin_symbol.toLowerCase()}usdt@ticker`;
    }))].join('/');

    if (!symbols) return;

    try {
      if (ws.current) ws.current.close();

      ws.current = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${symbols}`);

      ws.current.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.stream && message.data) {
          const symbol = message.stream.replace('@ticker', '').replace('usdt', '');
          const price = parseFloat(message.data.c);






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

            res.data.triggered.forEach(alert => {
              toast(() => (
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="p-1.5 md:p-2 bg-yellow-100 rounded-lg shrink-0">
                    <FaBell className="text-yellow-600 w-3 h-3 md:w-4 md:h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-xs md:text-sm">Price Alert Triggered!</p>
                    <p className="text-xs md:text-sm text-gray-700 leading-tight">
                      {alert.coin_symbol.toUpperCase()} {alert.condition === 'above' ? 'passed' : 'dropped below'} ${alert.target_price.toLocaleString()}
                    </p>
                  </div>
                </div>
              ), {
                duration: 6000,
                position: 'top-right',
                className: '!max-w-[85vw] !p-2 md:!p-4 !bg-white !text-gray-900 !border !border-gray-200 !shadow-md !rounded-xl',
              });
            });



            fetchAlerts();
          }
        } catch {
          console.error("Failed to fetch alerts");
        }
      }
    };

    const timer = setInterval(checkTriggers, 10000);
    return () => clearInterval(timer);

  }, [alerts, livePrices, user?.id, fetchAlerts]);

  return null;
};

export default AlertChecker;
