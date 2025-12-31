import React, { useMemo } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { FaExclamationTriangle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import useThemeCheck from "@/hooks/useThemeCheck";
import { useLiveTrendingCoins } from "@/hooks/useLiveTrendingCoins";

function CryptoTrendingCoins() {
    const isLight = useThemeCheck();
    const navigate = useNavigate();

    // Request only 5 items for this widget
    const { coins: displayedCoins, loading, error } = useLiveTrendingCoins(5);

    const TC = useMemo(() => ({
        // Dashboard Stability Glassmorphism
        bgContainer: isLight
            ? "bg-white/70 backdrop-blur-xl shadow-md border border-gray-100 glass-card"
            : "bg-gray-900/95 backdrop-blur-none shadow-none border border-gray-700/50 glass-card",
        textPrimary: isLight ? "text-gray-900" : "text-white",
        textSecondary: isLight ? "text-gray-500" : "text-gray-400",
        textAccentGreen: isLight ? "text-emerald-600" : "text-emerald-400",
        textAccentRed: isLight ? "text-rose-600" : "text-rose-500",
        textHover: isLight ? "hover:text-cyan-600" : "hover:text-cyan-400",
        bgHover: isLight ? "hover:bg-blue-50/50" : "hover:bg-white/5",
        borderList: isLight ? "border-gray-100" : "border-gray-700/50",
        textError: isLight ? "text-gray-600" : "text-gray-400",
        skeletonBase: isLight ? "#e5e7eb" : "#2c313c",
        skeletonHighlight: isLight ? "#f3f4f6" : "#3a404c",
    }), [isLight]);

    return (
        <div className={`rounded-xl p-4 md:p-5 fade-in ${TC.bgContainer} h-full flex flex-col`} style={{ animationDelay: "0.1s" }}>
            <h2 className={`text-sm md:text-base font-bold mb-3 ${TC.textPrimary} fade-in flex items-center gap-2`} style={{ animationDelay: "0.2s" }}>
                🔥 Trending Coins
            </h2>
            {loading ? (
                <ul className="flex-1 flex flex-col justify-between">
                    {Array(5)
                        .fill(0)
                        .map((_, index) => (
                            <li
                                key={index}
                                className="flex justify-between items-center text-sm fade-in"
                                style={{ animationDelay: `${0.3 + (index * 0.1)}s` }}
                            >
                                <Skeleton
                                    width={150}
                                    height={18}
                                    baseColor={TC.skeletonBase}
                                    highlightColor={TC.skeletonHighlight}
                                />
                                <Skeleton
                                    width={100}
                                    height={18}
                                    baseColor={TC.skeletonBase}
                                    highlightColor={TC.skeletonHighlight}
                                />
                            </li>
                        ))}
                </ul>
            ) : error || displayedCoins.length === 0 ? (
                <div className={`text-center mt-4 flex flex-col items-center justify-center gap-2 fade-in ${TC.textError}`} style={{ animationDelay: "0.3s" }}>
                    <FaExclamationTriangle className="text-3xl" />
                    <p className="text-sm">{error || "No trending coins found."}</p>
                </div>
            ) : (
                <ul className="flex-1 flex flex-col justify-between">
                    {displayedCoins.map((coin, index) => (
                        <li
                            key={coin.id}
                            className={`flex justify-between items-center text-sm ${TC.textPrimary} border-b ${TC.borderList} last:border-b-0 pb-2 mb-2 last:mb-0 transition-colors ${TC.bgHover} px-2 py-2 rounded-lg fade-in`}
                            style={{ animationDelay: `${0.3 + (index * 0.1)}s` }}
                        >
                            <span
                                className={`flex items-center gap-2 cursor-pointer ${TC.textHover} transition-colors`}
                                onClick={() => navigate(`/coin/coin-details/${coin.id}`, { state: { coin } })}
                            >
                                <img
                                    src={coin.image}
                                    alt={coin.name}
                                    className="w-5 h-5 rounded-full"
                                />
                                {coin.name} ({coin.symbol.toUpperCase()})
                            </span>
                            <span
                                className={
                                    (coin.price_change_percentage_24h_in_currency || 0) < 0
                                        ? `${TC.textAccentRed} font-semibold transition-colors duration-300`
                                        : `${TC.textAccentGreen} font-semibold transition-colors duration-300`
                                }
                            >
                                ${coin.current_price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })} (
                                {coin.price_change_percentage_24h_in_currency?.toFixed(2)}%)
                            </span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default CryptoTrendingCoins;
