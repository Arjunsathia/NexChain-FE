import Highlights from "@/Components/UserProfile/Highlights";
import InfoCards from "@/Components/UserProfile/InfoCards";
import Portfolio from "@/Components/UserProfile/Portfolio";
import RecentActivity from "@/Components/UserProfile/RecentActivity";
import Watchlist from "@/Components/UserProfile/Watchlist";
import { useCallback, useEffect, useState } from "react";
import { getById } from "@/api/axiosConfig";
import { useParams } from "react-router-dom";
import useUserContext from "@/hooks/useUserContext";
import useThemeCheck from "@/hooks/useThemeCheck";

export default function Dashboard() {
  const { userId } = useParams();
  const { user } = useUserContext();
  const isLight = useThemeCheck();

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

  // Theme constants
  const textPrimary = isLight ? "text-gray-900" : "text-white";
  const textSecondary = isLight ? "text-gray-500" : "text-gray-400";
  const bgBadge = isLight
    ? "bg-white/50 border-gray-100 text-gray-500"
    : "bg-gray-800/50 border-gray-700 text-gray-400";

  // Skeleton constants
  const skelCardBg = isLight
    ? "bg-white/50 border-gray-100"
    : "bg-gray-800/50 border-gray-700";
  const skelShapeBg = isLight ? "bg-gray-200" : "bg-gray-700";

  return (
    <div className="w-full max-w-7xl mx-auto p-2 sm:p-4 lg:p-6 space-y-6">
      <style>{`
        @keyframes wave {
          0% { transform: rotate(0.0deg) }
          10% { transform: rotate(14.0deg) }
          20% { transform: rotate(-8.0deg) }
          30% { transform: rotate(14.0deg) }
          40% { transform: rotate(-4.0deg) }
          50% { transform: rotate(10.0deg) }
          60% { transform: rotate(0.0deg) }
          100% { transform: rotate(0.0deg) }
        }
        .animate-wave {
          animation-name: wave;
          animation-duration: 2.5s;
          animation-iteration-count: infinite;
          transform-origin: 70% 70%;
          display: inline-block;
        }
      `}</style>

      <div
        className={`transition-all duration-500 ease-in-out ${
          contentLoaded && !isLoading
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4"
        }`}
      >
        {/* Header Section */}
        <header className="mb-8 py-2 px-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1
                className={`text-2xl lg:text-3xl font-bold tracking-tight mb-1 ${textPrimary}`}
              >
                Welcome back,{" "}
                <span className="bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">
                  {currentUser?.name || "User"}
                </span>{" "}
                <span className="animate-wave">👋</span>
              </h1>
              <p className={`text-sm font-medium ${textSecondary}`}>
                Here&apos;s what&apos;s happening with your portfolio today.
              </p>
            </div>

            {isLoading && (
              <div
                className={`flex items-center self-start sm:self-auto text-xs font-medium backdrop-blur-sm px-4 py-2 rounded-full border shadow-sm ${bgBadge}`}
              >
                <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2" />
                Updating live data...
              </div>
            )}
          </div>
        </header>

        {/* Dashboard Content */}
        {isLoading ? (
          <div className="space-y-6">
            {/* Top Cards Skeleton */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className={`${skelCardBg} backdrop-blur-sm rounded-2xl p-4 border`}
                >
                  <div className="animate-pulse space-y-3">
                    <div className="flex items-center justify-between">
                      <div
                        className={`w-10 h-10 ${skelShapeBg} rounded-xl`}
                      ></div>
                      <div
                        className={`w-12 h-4 ${skelShapeBg} rounded-md`}
                      ></div>
                    </div>
                    <div className="space-y-2">
                      <div className={`h-6 ${skelShapeBg} rounded w-2/3`}></div>
                      <div className={`h-3 ${skelShapeBg} rounded w-1/2`}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Main Cards Skeleton */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {[...Array(2)].map((_, i) => (
                <div
                  key={i}
                  className={`${skelCardBg} backdrop-blur-sm rounded-2xl p-6 h-[380px] border`}
                >
                  <div className="animate-pulse h-full flex flex-col">
                    <div className="flex items-center gap-4 mb-6">
                      <div
                        className={`w-12 h-12 ${skelShapeBg} rounded-xl`}
                      ></div>
                      <div className="space-y-2 flex-1">
                        <div
                          className={`h-5 ${skelShapeBg} rounded w-1/3`}
                        ></div>
                        <div
                          className={`h-4 ${skelShapeBg} rounded w-1/4`}
                        ></div>
                      </div>
                    </div>
                    <div className="flex-1 space-y-3">
                      {[...Array(5)].map((_, j) => (
                        <div
                          key={j}
                          className={`h-12 ${skelShapeBg} rounded-xl w-full`}
                        ></div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Top Stats */}
            <InfoCards />

            {/* Row 1: Financial Overview */}
            <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <Portfolio />{" "}
              {/* View details and history of your recent transactions. You can also view your account&apos;s activity. */}
              <Watchlist />
            </section>

            {/* Row 2: Activity & Market */}
            <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <RecentActivity />
              <Highlights />
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
