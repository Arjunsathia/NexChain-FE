import { useState, useEffect, useCallback } from "react";
import api from "@/api/axiosConfig";
import useUserContext from "@/hooks/useUserContext";

export const useOpenOrders = () => {
  const { user } = useUserContext();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    if (!user?.id) return;
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
  }, [user?.id]);

  useEffect(() => {
    fetchOrders();
    // Fills and triggers arrive over the socket ("refreshOrders"); polling is
    // only a slow fallback in case the socket is down.
    const interval = setInterval(fetchOrders, 60000);

    window.addEventListener("refreshOrders", fetchOrders);
    return () => {
      clearInterval(interval);
      window.removeEventListener("refreshOrders", fetchOrders);
    };
  }, [fetchOrders]);

  return { orders, loading, refetch: fetchOrders };
};
