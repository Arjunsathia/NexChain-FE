import Highlights from "@/Components/UserProfile/Highlights";
import InfoCards from "@/Components/UserProfile/InfoCards";
import Portfolio from "@/Components/UserProfile/Portfolio";
import RecentActivity from "@/Components/UserProfile/RecentActivity";
import Watchlist from "@/Components/UserProfile/Watchlist";
import { useCallback, useEffect, useState } from "react";
import { getById } from "@/api/axiosConfig";
import { useParams } from "react-router-dom";
import useUserContext from '@/Context/UserContext/useUserContext';

export default function Dashboard() {
  const { userId } = useParams();
  const { user } = useUserContext();

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [contentLoaded, setContentLoaded] = useState(false);

  const fetchData = useCallback(async () => {
    const id = userId || user?.id;
    if (!id) return;

    setIsLoading(true);
    setContentLoaded(false);
    try {
      const res = await getById("/users", id);
      setData(res?.data ?? res);
    } catch (err) {
      console.error("Failed to fetch data", err);
    } finally {
      setIsLoading(false);
      setTimeout(() => setContentLoaded(true), 300);
    }
  }, [userId, user?.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const currentUser = data || user;

  return (
    <div className="w-full max-w-7xl mx-auto p-2 sm:p-4 lg:p-6 space-y-6">
      <div 
        className={`transition-all duration-500 ease-in-out ${
          contentLoaded && !isLoading 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-4'
        }`}
      >
        {/* Header Section */}
        <header className="mb-6 py-2 px-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Welcome back, {currentUser?.name || 'User'} <span className="text-white">👋</span>
            </h1>
            {isLoading && (
              <div className="flex items-center text-sm text-gray-300">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Loading...
              </div>
            )}
          </div>
          <p className="text-gray-400 mt-2 text-sm">
            Here's what's happening with your assets today
          </p>
        </header>

        {/* Loading State */}
        {isLoading ? (
          <div className="space-y-6">
            {/* Info Cards Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-800/50 rounded-xl p-4">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-700 rounded w-1/2 mb-3"></div>
                    <div className="h-6 bg-gray-700 rounded w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Portfolio & Recent Activity Skeleton */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="bg-gray-800/50 rounded-xl p-4 h-80">
                <div className="animate-pulse">
                  <div className="h-5 bg-gray-700 rounded w-1/3 mb-4"></div>
                  <div className="h-56 bg-gray-700 rounded"></div>
                </div>
              </div>
              <div className="bg-gray-800/50 rounded-xl p-4 h-80">
                <div className="animate-pulse">
                  <div className="h-5 bg-gray-700 rounded w-1/3 mb-4"></div>
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-4 bg-gray-700 rounded"></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Actual Content when loaded */
          <div className="space-y-6">
            {/* Info Cards */}
            <InfoCards />

            {/* Portfolio & Recent Activity Section */}
            <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <Portfolio />
              <RecentActivity />
            </section>

            {/* Watchlist & Highlights Section */}
            <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <Watchlist />
              <Highlights />
            </section>
          </div>
        )}
      </div>
    </div>
  );
}