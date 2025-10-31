import { useState, useEffect, useCallback } from 'react';
import { getData } from '@/api/axiosConfig';
import useUserContext from '@/Context/UserContext/useUserContext';

export const useWatchlist = () => {
  const { user } = useUserContext();
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWatchlist = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      const res = await getData('/watchlist', { user_id: user.id });
      setWatchlist(res || []);
    } catch (err) {
      console.error('Failed to fetch watchlist:', err);
      setWatchlist([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchWatchlist();
  }, [fetchWatchlist]);

  return {
    watchlist,
    loading,
    refreshWatchlist: fetchWatchlist
  };
};