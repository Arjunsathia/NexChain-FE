import React, { useState, useEffect, useMemo } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import NewsPanel from "./NewsPanel";

// Utility to check if light mode is active based on global class
const useThemeCheck = () => {
  const [isLight, setIsLight] = useState(
    !document.documentElement.classList.contains("dark")
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsLight(!document.documentElement.classList.contains("dark"));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  return isLight;
};

const DashboardSkeleton = () => {
  const isLight = useThemeCheck();

  // 💡 Theme Classes for Skeleton
  const TC = useMemo(
    () => ({
      skeletonBase: isLight ? "#e5e7eb" : "#2d3748",
      skeletonHighlight: isLight ? "#f3f4f6" : "#374151",
      bgSkeletonItem: isLight
        ? "bg-white/90 shadow-[0_6px_25px_rgba(0,0,0,0.12)]"
        : "bg-gray-800/50 backdrop-blur-xl shadow-xl shadow-black/20",
    }),
    [isLight]
  );

  // --- Large Screen Sidebar Item Heights (Perfectly Aligned with Compact Chart) ---

  // FIX: Compact Profile
  const USERDATA_HEIGHT = "h-[150px]";

  // FIX: Redistribute remaining space (Total Target Height: ~764px)
  const CHART_HEIGHT = "h-[620px]"; // Restored to original, more compact height

  // New height calculations to balance the 764px middle column height
  const PORTFOLIO_HEIGHT = "h-[300px]";
  const TRADES_HEIGHT = "h-[266px]";

  // Right sidebar balancing the left side
  const WATCHLIST_HEIGHT = "h-[280px]";
  const TRENDING_HEIGHT = "h-[250px]";
  const LEARNING_HUB_HEIGHT = "h-[186px]";

  return (
    <div
      className={`min-h-screen p-2 sm:p-4 lg:p-6 fade-in ${
        isLight ? "text-gray-900" : "text-white"
      }`}
    >
      {/* Mobile & Medium Layout Skeleton (Same as before) */}
      <div className="xl:hidden flex flex-col gap-4">
        {/* Compact Profile Skeleton for Small Screens */}
        <div className="sm:hidden fade-in" style={{ animationDelay: "0.2s" }}>
          <div className={`rounded-xl p-4 h-20 ${TC.bgSkeletonItem}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton
                  circle
                  width={40}
                  height={40}
                  baseColor={TC.skeletonBase}
                  highlightColor={TC.skeletonHighlight}
                />
                <div>
                  <Skeleton
                    width={80}
                    height={16}
                    baseColor={TC.skeletonBase}
                    highlightColor={TC.skeletonHighlight}
                    className="mb-1"
                  />
                  <Skeleton
                    width={120}
                    height={12}
                    baseColor={TC.skeletonBase}
                    highlightColor={TC.skeletonHighlight}
                  />
                </div>
              </div>
              <div>
                <Skeleton
                  width={40}
                  height={12}
                  baseColor={TC.skeletonBase}
                  highlightColor={TC.skeletonHighlight}
                  className="mb-1"
                />
                <Skeleton
                  width={60}
                  height={16}
                  baseColor={TC.skeletonBase}
                  highlightColor={TC.skeletonHighlight}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Top Coins Skeleton - Single column bento style */}
        <div className="fade-in" style={{ animationDelay: "0.5s" }}>
          <div className="space-y-1">
            <Skeleton
              width={100}
              height={20}
              baseColor={TC.skeletonBase}
              highlightColor={TC.skeletonHighlight}
              className="mb-3 ml-1"
            />
            <div className="grid grid-cols-1 gap-3">
              {[1, 2, 3].map((_, i) => (
                <div
                  key={i}
                  className={`rounded-xl p-4 h-24 ${TC.bgSkeletonItem}`}
                >
                  <div className="flex items-center justify-between h-full">
                    <div className="flex items-center gap-3">
                      <Skeleton
                        circle
                        width={40}
                        height={40}
                        baseColor={TC.skeletonBase}
                        highlightColor={TC.skeletonHighlight}
                      />
                      <div>
                        <Skeleton
                          width={60}
                          height={16}
                          baseColor={TC.skeletonBase}
                          highlightColor={TC.skeletonHighlight}
                          className="mb-1"
                        />
                        <Skeleton
                          width={40}
                          height={12}
                          baseColor={TC.skeletonBase}
                          highlightColor={TC.skeletonHighlight}
                        />
                      </div>
                    </div>
                    <div className="text-right">
                      <Skeleton
                        width={80}
                        height={16}
                        baseColor={TC.skeletonBase}
                        highlightColor={TC.skeletonHighlight}
                        className="mb-1"
                      />
                      <Skeleton
                        width={50}
                        height={12}
                        baseColor={TC.skeletonBase}
                        highlightColor={TC.skeletonHighlight}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Profile sections for Medium screens */}
        <div className="hidden sm:grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((_, i) => (
            <div
              key={i}
              className="fade-in"
              style={{ animationDelay: `${0.2 + i * 0.1}s` }}
            >
              <div className={`rounded-xl p-6 h-48 ${TC.bgSkeletonItem}`}>
                <Skeleton
                  height={24}
                  width={120}
                  baseColor={TC.skeletonBase}
                  highlightColor={TC.skeletonHighlight}
                  className="mb-4"
                />
                <Skeleton
                  height={16}
                  baseColor={TC.skeletonBase}
                  highlightColor={TC.skeletonHighlight}
                  className="mb-2"
                  count={3}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Chart Skeleton - Visible on all screens */}
        <div className="fade-in" style={{ animationDelay: "0.6s" }}>
          <div className={`rounded-xl p-6 h-96 ${TC.bgSkeletonItem}`}>
            <Skeleton
              height={28}
              width={150}
              baseColor={TC.skeletonBase}
              highlightColor={TC.skeletonHighlight}
              className="mb-4"
            />
            <Skeleton
              height={280}
              baseColor={TC.skeletonBase}
              highlightColor={TC.skeletonHighlight}
            />
          </div>
        </div>

        {/* Widgets Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((_, i) => (
            <div
              key={i}
              className="fade-in"
              style={{ animationDelay: `${0.7 + i * 0.1}s` }}
            >
              <div className={`rounded-xl p-6 h-64 ${TC.bgSkeletonItem}`}>
                <Skeleton
                  height={24}
                  width={100}
                  baseColor={TC.skeletonBase}
                  highlightColor={TC.skeletonHighlight}
                  className="mb-4"
                />
                <Skeleton
                  height={16}
                  baseColor={TC.skeletonBase}
                  highlightColor={TC.skeletonHighlight}
                  count={4}
                />
              </div>
            </div>
          ))}
        </div>

        {/* News Skeleton */}
        <div className="fade-in" style={{ animationDelay: "1.0s" }}>
          <div className={`rounded-xl p-6 h-64 ${TC.bgSkeletonItem}`}>
            <Skeleton
              height={28}
              width={120}
              baseColor={TC.skeletonBase}
              highlightColor={TC.skeletonHighlight}
              className="mb-4"
            />
            <Skeleton
              height={16}
              baseColor={TC.skeletonBase}
              highlightColor={TC.skeletonHighlight}
              count={5}
            />
          </div>
        </div>
      </div>

      {/* Large Screen Layout Skeleton */}
      <div className="hidden xl:flex flex-col gap-6">
        <div className="grid grid-cols-12 gap-6 items-stretch">
          {/* Left Sidebar Skeleton (Normalized Heights) */}
          <div className="col-span-3 flex flex-col gap-6">
            <div
              className={`fade-in ${USERDATA_HEIGHT}`}
              style={{ animationDelay: "0.2s" }}
            >
              <div className={`rounded-xl p-6 h-full ${TC.bgSkeletonItem}`}>
                <Skeleton
                  height={24}
                  width={120}
                  baseColor={TC.skeletonBase}
                  highlightColor={TC.skeletonHighlight}
                  className="mb-4"
                />
                <Skeleton
                  height={16}
                  baseColor={TC.skeletonBase}
                  highlightColor={TC.skeletonHighlight}
                  count={2}
                />
              </div>
            </div>
            <div
              className={`fade-in ${PORTFOLIO_HEIGHT}`}
              style={{ animationDelay: "0.3s" }}
            >
              <div className={`rounded-xl p-6 h-full ${TC.bgSkeletonItem}`}>
                <Skeleton
                  height={24}
                  width={120}
                  baseColor={TC.skeletonBase}
                  highlightColor={TC.skeletonHighlight}
                  className="mb-4"
                />
                <Skeleton
                  height={16}
                  baseColor={TC.skeletonBase}
                  highlightColor={TC.skeletonHighlight}
                  count={4}
                />
              </div>
            </div>
            <div
              className={`fade-in ${TRADES_HEIGHT}`}
              style={{ animationDelay: "0.4s" }}
            >
              <div className={`rounded-xl p-6 h-full ${TC.bgSkeletonItem}`}>
                <Skeleton
                  height={24}
                  width={120}
                  baseColor={TC.skeletonBase}
                  highlightColor={TC.skeletonHighlight}
                  className="mb-4"
                />
                <Skeleton
                  height={16}
                  baseColor={TC.skeletonBase}
                  highlightColor={TC.skeletonHighlight}
                  count={4}
                />
              </div>
            </div>
          </div>

          {/* Middle Section Skeleton */}
          <div className="col-span-6 flex flex-col gap-6">
            {/* Top Coins Skeleton */}
            <div className="fade-in" style={{ animationDelay: "0.5s" }}>
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3].map((_, i) => (
                  <div
                    key={i}
                    className={`rounded-xl p-6 h-32 ${TC.bgSkeletonItem}`}
                  >
                    <Skeleton
                      height={20}
                      width={80}
                      baseColor={TC.skeletonBase}
                      highlightColor={TC.skeletonHighlight}
                      className="mb-3"
                    />
                    <Skeleton
                      height={16}
                      baseColor={TC.skeletonBase}
                      highlightColor={TC.skeletonHighlight}
                      className="mb-2"
                    />
                    <Skeleton
                      height={14}
                      baseColor={TC.skeletonBase}
                      highlightColor={TC.skeletonHighlight}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Chart Skeleton */}
            <div
              className={`fade-in ${CHART_HEIGHT}`}
              style={{ animationDelay: "0.6s" }}
            >
              <div className={`rounded-xl p-6 h-full ${TC.bgSkeletonItem}`}>
                <Skeleton
                  height={28}
                  width={150}
                  baseColor={TC.skeletonBase}
                  highlightColor={TC.skeletonHighlight}
                  className="mb-4"
                />
                <Skeleton
                  height={400}
                  baseColor={TC.skeletonBase}
                  highlightColor={TC.skeletonHighlight}
                />
              </div>
            </div>
          </div>

          {/* Right Sidebar Skeleton (Normalized Heights) */}
          <div className="col-span-3 flex flex-col gap-6">
            <div
              className={`fade-in ${WATCHLIST_HEIGHT}`}
              style={{ animationDelay: "0.8s" }}
            >
              <div className={`rounded-xl p-6 h-full ${TC.bgSkeletonItem}`}>
                <Skeleton
                  height={24}
                  width={100}
                  baseColor={TC.skeletonBase}
                  highlightColor={TC.skeletonHighlight}
                  className="mb-4"
                />
                <Skeleton
                  height={16}
                  baseColor={TC.skeletonBase}
                  highlightColor={TC.skeletonHighlight}
                  count={4}
                />
              </div>
            </div>
            <div
              className={`fade-in ${TRENDING_HEIGHT}`}
              style={{ animationDelay: "0.9s" }}
            >
              <div className={`rounded-xl p-6 h-full ${TC.bgSkeletonItem}`}>
                <Skeleton
                  height={24}
                  width={100}
                  baseColor={TC.skeletonBase}
                  highlightColor={TC.skeletonHighlight}
                  className="mb-4"
                />
                <Skeleton
                  height={16}
                  baseColor={TC.skeletonBase}
                  highlightColor={TC.skeletonHighlight}
                  count={4}
                />
              </div>
            </div>
            <div
              className={`fade-in ${LEARNING_HUB_HEIGHT}`}
              style={{ animationDelay: "1.0s" }}
            >
              <div className={`rounded-xl p-6 h-full ${TC.bgSkeletonItem}`}>
                <Skeleton
                  height={24}
                  width={100}
                  baseColor={TC.skeletonBase}
                  highlightColor={TC.skeletonHighlight}
                  className="mb-4"
                />
                <Skeleton
                  height={16}
                  baseColor={TC.skeletonBase}
                  highlightColor={TC.skeletonHighlight}
                  count={3}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section - News Panel (No Fixed Height) */}
        <div className="fade-in" style={{ animationDelay: "0.7s" }}>
          <NewsPanel />
        </div>
      </div>
    </div>
  );
};

export default DashboardSkeleton;
