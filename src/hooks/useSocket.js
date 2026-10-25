import { useEffect, useRef } from "react";
import { toast } from "react-hot-toast";
import useUserContext from "./useUserContext";
import useWalletContext from "./useWalletContext";
import { usePurchasedCoins } from "./usePurchasedCoins";
import { BACKEND_WS_URL, getAccessToken, refreshSession } from "@/api/axiosConfig";

const SOCKET_URL = BACKEND_WS_URL;

export const useSocket = () => {
  const { user } = useUserContext();
  const { refreshBalance } = useWalletContext();
  const { refetch: refreshPortfolio } = usePurchasedCoins();
  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  // Use refs for refresh functions to avoid dependency churn in useEffect
  const refreshFns = useRef({ refreshBalance, refreshPortfolio });
  useEffect(() => {
    refreshFns.current = { refreshBalance, refreshPortfolio };
  }, [refreshBalance, refreshPortfolio]);

  useEffect(() => {
    if (!user?.id) return;

    // Guard: Don't connect if already connecting or open
    if (socketRef.current && (socketRef.current.readyState === WebSocket.CONNECTING || socketRef.current.readyState === WebSocket.OPEN)) {
      return;
    }

    const connect = () => {
      // Clear any existing cleanup/reconnect timers
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);

      // Close existing if any (redundancy)
      if (socketRef.current) {
        socketRef.current.onclose = null;
        socketRef.current.close();
      }

      const token = getAccessToken();
      if (!token) return;

      // The token goes in the first message, not the URL (URLs end up in logs)
      const ws = new WebSocket(SOCKET_URL);
      socketRef.current = ws;

      ws.onopen = () => {
        ws.send(JSON.stringify({ type: "AUTH", token }));
      };

      ws.onmessage = (event) => {
        try {
          const { type, data } = JSON.parse(event.data);

          if (type === "ORDER_FILLED") {

            toast.success(`${data.type.toUpperCase()} ${data.symbol.toUpperCase()} Order Filled`, {
              duration: 4000,
              position: "top-right",
            });

            // Call the most recent versions of the refresh functions
            refreshFns.current.refreshBalance();
            refreshFns.current.refreshPortfolio();

            // Trigger global refresh for notifications and open orders
            window.dispatchEvent(new CustomEvent("refreshNotifications"));
            window.dispatchEvent(new CustomEvent("refreshOrders"));
          } else if (type === "ORDER_TRIGGERED") {

            toast(`Triggered: ${data.symbol.toUpperCase()} - Limit order active at $${data.limit_price.toLocaleString()}`, {
              duration: 6000,
              position: "top-right",
              icon: '🔔'
            });

            // Refresh portfolio to show "Triggered" badge
            refreshFns.current.refreshPortfolio();

            // Trigger global refresh for notifications and open orders
            window.dispatchEvent(new CustomEvent("refreshNotifications"));
            window.dispatchEvent(new CustomEvent("refreshOrders"));
          } else if (type === "ALERT_TRIGGERED") {
            toast.success(`🚀 Price Alert Hit!\n${data.message}`, {
              duration: 8000,
              position: "top-right",
              style: {
                background: '#fff',
                color: '#333',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                padding: '12px 16px',
                borderRadius: '12px'
              }
            });

            // Trigger global refresh for notifications
            window.dispatchEvent(new CustomEvent("refreshNotifications"));
          }
        } catch {
          // ignore malformed messages
        }
      };

      ws.onclose = async (event) => {
        // 4401: token expired or revoked. Refresh once; if that fails the
        // session-expired handler signs the user out and this effect unmounts.
        if (event.code === 4401) {
          try {
            await refreshSession();
          } catch {
            return;
          }
        }
        reconnectTimeoutRef.current = setTimeout(connect, 5000);
      };

      ws.onerror = () => {
        ws.close();
      };
    };

    connect();

    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (socketRef.current) {
        socketRef.current.onclose = null; // Prevent reconnect loop during cleanup
        socketRef.current.close();
      }
    };
  }, [user?.id]); // Only depend on User ID

  return socketRef.current;
};
