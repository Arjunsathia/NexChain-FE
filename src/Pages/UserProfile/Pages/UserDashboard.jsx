import Highlights from "../Components/Highlights";
import InfoCards from "../Components/InfoCards";
import Portfolio from "../Components/Portfolio";
import RecentActivity from "../Components/RecentActivity";
import Sidebar from "../Components/Sidebar";
import Watchlist from "../Components/Watchlist";
import { useCallback, useEffect, useState } from "react";
import { getById, logout } from "@/api/axiosConfig";
import { useParams, useNavigate } from "react-router-dom";
import useUserContext from '@/Context/UserContext/useUserContext';

export default function Dashboard() {
  const { userId } = useParams();
  const { user } = useUserContext();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLogoutLoading, setIsLogoutLoading] = useState(false);
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

  const handleLogout = async () => {
    try {
      setIsLogoutLoading(true);
      await logout();
      localStorage.removeItem("NEXCHAIN_USER_TOKEN");
      localStorage.removeItem("NEXCHAIN_USER");
      navigate("/auth");
    } catch (error) {
      console.error("Error While Logout", error);
    } finally {
      setIsLogoutLoading(false);
    }
  };

  const currentUser = data || user;

  return (
    <main className="min-h-screen text-white ">
      {/* Main Layout */}
      <div className="flex flex-col lg:flex-row min-h-screen gap-4 p-4">
        
        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-64 lg:sticky lg:top-4 lg:h-fit">
          <Sidebar onLogout={handleLogout} isLogoutLoading={isLogoutLoading} />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 min-w-0">
          <div 
            className={`w-full max-w-7xl mx-auto space-y-4 transition-all duration-500 ease-in-out ${
              contentLoaded && !isLoading 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-4'
            }`}
          >
            {/* Header Section */}
            <header className="mb-4 px-2">
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
              <div className="space-y-4 px-2">
                {/* Info Cards Skeleton */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
                      <div className="animate-pulse">
                        <div className="h-4 bg-gray-700 rounded w-1/2 mb-3"></div>
                        <div className="h-6 bg-gray-700 rounded w-3/4"></div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Portfolio & Recent Activity Skeleton */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 h-64">
                    <div className="animate-pulse">
                      <div className="h-5 bg-gray-700 rounded w-1/3 mb-4"></div>
                      <div className="h-40 bg-gray-700 rounded"></div>
                    </div>
                  </div>
                  <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 h-64">
                    <div className="animate-pulse">
                      <div className="h-5 bg-gray-700 rounded w-1/3 mb-4"></div>
                      <div className="space-y-3">
                        {[...Array(4)].map((_, i) => (
                          <div key={i} className="h-4 bg-gray-700 rounded"></div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Watchlist & Highlights Skeleton */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 h-64">
                    <div className="animate-pulse">
                      <div className="h-5 bg-gray-700 rounded w-1/3 mb-4"></div>
                      <div className="space-y-3">
                        {[...Array(4)].map((_, i) => (
                          <div key={i} className="h-4 bg-gray-700 rounded"></div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 h-64">
                    <div className="animate-pulse">
                      <div className="h-5 bg-gray-700 rounded w-1/3 mb-4"></div>
                      <div className="space-y-3">
                        {[...Array(4)].map((_, i) => (
                          <div key={i} className="h-4 bg-gray-700 rounded"></div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Actual Content when loaded */
              <div className="space-y-4 px-2">
                {/* Info Cards */}
                <InfoCards />

                {/* Portfolio & Recent Activity Section */}
                <section className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  <Portfolio />
                  <RecentActivity />
                </section>

                {/* Watchlist & Highlights Section */}
                <section className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  <Watchlist />
                  <Highlights />
                </section>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Sidebar */}
        <div className="lg:hidden w-full px-2">
          <Sidebar onLogout={handleLogout} isLogoutLoading={isLogoutLoading} />
        </div>
      </div>
    </main>
  );
}