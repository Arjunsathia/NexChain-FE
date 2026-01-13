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
    const interval = setInterval(fetchOrders, 10000);

    window.addEventListener("refreshOrders", fetchOrders);
    return () => {
      clearInterval(interval);
      window.removeEventListener("refreshOrders", fetchOrders);
    };
  }, [fetchOrders]);

  return { orders, loading, refetch: fetchOrders };
};
