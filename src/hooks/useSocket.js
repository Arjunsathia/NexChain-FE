import { useEffect, useRef } from "react";
import { toast } from "react-hot-toast";
import useUserContext from "./useUserContext";
import useWalletContext from "./useWalletContext";
import { usePurchasedCoins } from "./usePurchasedCoins";

const SOCKET_URL = import.meta.env.VITE_WS_URL || "ws://localhost:5050";

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

      console.log("🌐 [Real-time] Connecting to NexChain Server...");
      const ws = new WebSocket(SOCKET_URL);
      socketRef.current = ws;

      ws.onopen = () => {
        console.log("✅ [Real-time] Connected!");
      };

      ws.onmessage = (event) => {
        try {
          const { type, data } = JSON.parse(event.data);

          if (type === "ORDER_FILLED") {
            if (data.targetUserId === user.id) {
              console.log("💰 [Real-time] Order Filled:", data.symbol);
              
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
            }
          } else if (type === "ORDER_TRIGGERED") {
            if (data.targetUserId === user.id) {
              console.log("🔔 [Real-time] Order Triggered:", data.symbol);
              
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
            }
          }
        } catch (error) {
          console.error("❌ [Real-time] Error parsing message:", error);
        }
      };

      ws.onclose = () => {
        console.log("🔌 [Real-time] Connection closed. Retrying in 5s...");
        reconnectTimeoutRef.current = setTimeout(connect, 5000);
      };

      ws.onerror = (err) => {
        console.error("⚠️ [Real-time] Socket error:", err);
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
