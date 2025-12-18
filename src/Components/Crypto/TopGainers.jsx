import { getTopGainers } from "@/api/coinApis";
import React, { useEffect, useState, useMemo } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { FaExclamationTriangle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import useThemeCheck from "@/hooks/useThemeCheck";

function TopGainers() {
  const isLight = useThemeCheck();
  const [gainers, setGainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const TC = useMemo(() => ({
    bgContainer: isLight 
      ? "bg-white shadow-sm sm:shadow-[0_6px_25px_rgba(0,0,0,0.12)]" 
      : "bg-gray-800/50 backdrop-blur-xl shadow-xl shadow-black/20",
    textPrimary: isLight ? "text-gray-900" : "text-white",
    textAccent: isLight ? "text-green-600" : "text-green-400",
    textHover: isLight ? "hover:text-cyan-600" : "hover:text-cyan-400",
    borderList: isLight ? "border-gray-300" : "border-gray-700",
    textError: isLight ? "text-gray-600" : "text-gray-400",
    skeletonBase: isLight ? "#e5e7eb" : "#2c303a",
    skeletonHighlight: isLight ? "#f3f4f6" : "#3a3f4b",
    textPrice: isLight ? "text-gray-800" : "text-white",
  }), [isLight]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getTopGainers();
        if (Array.isArray(data)) {
          setGainers(data.slice(0, 5));
        } else {
           console.warn("Top gainers data is not an array:", data);
           setGainers([]);
        }
      } catch (error) {
        console.error("Failed to fetch top gainers:", error);
        setGainers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className={`rounded-lg md:rounded-2xl p-3 md:p-6 fade-in ${TC.bgContainer} h-full flex flex-col`} style={{ animationDelay: "0.1s" }}>
      <h2 className={`text-lg font-semibold mb-4 ${TC.textPrimary} fade-in`} style={{ animationDelay: "0.2s" }}>📈 Top Gainers</h2>

      {loading ? (
        <ul className="flex-1 flex flex-col justify-between">
          {Array.from({ length: 5 }).map((_, index) => (
            <li
              key={index}
              className="flex justify-between items-center text-sm fade-in"
              style={{ animationDelay: `${0.3 + (index * 0.1)}s` }}
            >
              <Skeleton
                width={120}
                height={16}
                baseColor={TC.skeletonBase}
                highlightColor={TC.skeletonHighlight}
              />
              <Skeleton
                width={80}
                height={16}
                baseColor={TC.skeletonBase}
                highlightColor={TC.skeletonHighlight}
              />
            </li>
          ))}
        </ul>
      ) : gainers.length > 0 ? (
        <ul className={`flex-1 flex flex-col justify-between ${TC.textPrimary}`}>
          {gainers.map((coin, index) => (
            <li
              key={coin.id}
              className={`flex justify-between items-center text-sm border-b ${TC.borderList} last:border-b-0 pb-2 fade-in`}
              style={{ animationDelay: `${0.3 + (index * 0.1)}s` }}
            >
              <span
                className={`flex items-center gap-2 cursor-pointer ${TC.textHover} transition-colors`}
                onClick={() => navigate(`/coin/${coin.id}`)}
              >
                <img
                  src={coin.image}
                  alt={coin.name}
                  className="w-5 h-5 rounded-full object-contain"
                />
                {coin.name} ({coin.symbol.toUpperCase()})
              </span>

              <span className={`${TC.textAccent} font-semibold`}>
                ₹{Number(coin.current_price).toLocaleString("en-IN")} ( +
                {coin.price_change_percentage_24h?.toFixed(2)}%)
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <div className={`text-center mt-4 flex flex-col items-center justify-center gap-2 fade-in ${TC.textError}`} style={{ animationDelay: "0.3s" }}>
          <FaExclamationTriangle className="text-3xl" />
          <p className="text-sm">
            Unable to load top gainers. Please try again later.
          </p>
        </div>
      )}
    </div>
  );
}

export default TopGainers;