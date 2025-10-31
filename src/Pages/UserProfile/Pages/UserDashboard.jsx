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
    <main className="min-h-screen text-white bg-transparent">
      {/* Main Layout - Row on desktop, Column on mobile */}
      <div className="flex flex-col lg:flex-row min-h-screen gap-4 lg:gap-6 p-2 lg:p-4">
        
        {/* Desktop Sidebar - Left side on large screens */}
        <div className="hidden lg:block w-64 lg:sticky lg:top-6 lg:h-fit">
          <Sidebar onLogout={handleLogout} isLogoutLoading={isLogoutLoading} />
        </div>

        {/* Main Content Area */}
        <div className="flex-1">
          <div 
            className={`w-full max-w-7xl mx-auto space-y-4 transition-all duration-500 ease-in-out ${
              contentLoaded && !isLoading 
                ? 'opacity-100 translate-y-0 glow-fade' 
                : 'opacity-0 translate-y-4'
            }`}
            style={{ animationDelay: "0.3s" }}
          >

            {/* Header Section */}
            <header className="mb-4 p-4 bg-transparent rounded-xl">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-bold">
                  Welcome back, {currentUser?.name || 'User'} 👋
                </h1>

                {/* Loading indicator */}
                {isLoading && (
                  <div className="ml-3 flex items-center text-sm text-gray-300">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Loading...
                  </div>
                )}
              </div>

              <p className="text-gray-400 mt-1 text-sm sm:text-base">
                Here's what's happening with your assets today
              </p>
            </header>

            {/* Show loading skeleton when loading */}
            {isLoading ? (
              <div className="space-y-4">
                {/* Info Cards Skeleton */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="p-4 rounded-xl shadow-md border border-gray-700 bg-transparent">
                      <div className="animate-pulse">
                        <div className="h-4 bg-gray-700 rounded w-1/2 mb-2"></div>
                        <div className="h-6 bg-gray-700 rounded w-3/4"></div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Portfolio & Recent Activity Skeleton */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 mb-4">
                  <div className="p-4 rounded-xl shadow-md border border-gray-700 h-64 bg-transparent">
                    <div className="animate-pulse">
                      <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
                      <div className="h-40 bg-gray-700 rounded"></div>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl shadow-md border border-gray-700 h-64 bg-transparent">
                    <div className="animate-pulse">
                      <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
                      <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="h-4 bg-gray-700 rounded"></div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Watchlist & Highlights Skeleton */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl shadow-md border border-gray-700 h-64 bg-transparent">
                    <div className="animate-pulse">
                      <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
                      <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="h-4 bg-gray-700 rounded"></div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl shadow-md border border-gray-700 h-64 bg-transparent">
                    <div className="animate-pulse">
                      <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
                      <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="h-4 bg-gray-700 rounded"></div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Actual Content when loaded */
              <div className="space-y-4">
                {/* Info Cards */}
                <InfoCards />

                {/* Portfolio & Recent Activity Section */}
                <section className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                  <Portfolio />
                  <RecentActivity />
                </section>

                {/* Watchlist & Highlights Section */}
                <section className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                  <Watchlist />
                  <Highlights />
                </section>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Sidebar - Bottom on small/medium screens */}
        <div className="lg:hidden w-full">
          <Sidebar onLogout={handleLogout} isLogoutLoading={isLogoutLoading} />
        </div>
      </div>
    </main>
  );
}