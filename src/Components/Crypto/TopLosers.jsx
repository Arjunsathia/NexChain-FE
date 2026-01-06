import { getTopLosers } from "@/api/coinApis";
import React, { useEffect, useState, useMemo } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { FaChartLine, FaExclamationTriangle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import useThemeCheck from "@/hooks/useThemeCheck";

function TopLosers() {
    const isLight = useThemeCheck();
    const [losers, setLosers] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const TC = useMemo(() => ({
        bgContainer: isLight
            ? "bg-white/70 backdrop-blur-xl shadow-md border border-gray-100 glass-card"
            : "bg-gray-900/95 backdrop-blur-none shadow-none border border-gray-700/50",
        textPrimary: isLight ? "text-gray-900" : "text-white",
        textSecondary: isLight ? "text-gray-500" : "text-gray-400",
        bgItem: isLight
            ? "hover:bg-blue-50/50 border-b border-gray-100 last:border-0 transition-colors"
            : "hover:bg-white/5 border-b border-gray-800 last:border-0 transition-colors",
        textPricePositive: isLight ? "text-emerald-700" : "text-emerald-400",
        textPriceNegative: isLight ? "text-rose-700" : "text-rose-400",
        iconBg: isLight ? "bg-rose-100/50 text-rose-600" : "bg-rose-500/10 text-rose-400",
        bgEmpty: isLight ? "bg-gray-50" : "bg-gray-800/30",
        skeletonBase: isLight ? "#e5e7eb" : "#1f2937",
        skeletonHighlight: isLight ? "#f3f4f6" : "#374151",
    }), [isLight]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const data = await getTopLosers();
                if (Array.isArray(data)) {
                    setLosers(data.slice(0, 5));
                } else {
                    setLosers([]);
                }
            } catch (error) {
                console.error("Failed to fetch top losers:", error);
                setLosers([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <div className={`p-1 rounded-xl h-full flex flex-col transition-all duration-300 ease-in-out hover:shadow-lg ${TC.bgContainer}`}>
            <div className="px-4 pt-4 flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg ${TC.iconBg}`}>
                        <FaChartLine className="text-base transform rotate-180" />
                    </div>
                    <h3 className={`font-bold text-sm md:text-base ${TC.textPrimary}`}>Top Losers</h3>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto overflow-x-hidden px-1 pb-2 scrollbar-hide">
                {loading ? (
                    <div className="space-y-2">
                        {Array.from({ length: 5 }).map((_, index) => (
                            <div key={index} className="flex justify-between items-center p-2">
                                <Skeleton circle width={24} height={24} baseColor={TC.skeletonBase} highlightColor={TC.skeletonHighlight} />
                                <div className="flex-1 ml-2">
                                    <Skeleton width={60} baseColor={TC.skeletonBase} highlightColor={TC.skeletonHighlight} />
                                    <Skeleton width={40} height={10} baseColor={TC.skeletonBase} highlightColor={TC.skeletonHighlight} />
                                </div>
                                <div className="flex flex-col items-end">
                                    <Skeleton width={60} baseColor={TC.skeletonBase} highlightColor={TC.skeletonHighlight} />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : losers.length > 0 ? (
                    losers.map((coin, index) => (
                        <div
                            key={coin.id}
                            onClick={() => navigate(`/coin/coin-details/${coin.id}`, { state: { coin } })}
                            style={{ animationDelay: `${index * 0.1}s` }}
                            className={`flex items-center justify-between p-2.5 rounded-lg transition-colors cursor-pointer group fade-in ${TC.bgItem}`}
                        >
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <img src={coin.image} alt={coin.name} className="w-8 h-8 rounded-full object-cover shadow-sm" />
                                </div>
                                <div className="flex flex-col">
                                    <span className={`text-xs font-bold leading-none ${TC.textPrimary}`}>{coin.symbol?.toUpperCase()}</span>
                                    <span className={`text-[10px] sm:text-[11px] font-medium mt-0.5 ${TC.textSecondary} truncate max-w-[80px]`}>{coin.name}</span>
                                </div>
                            </div>

                            <div className="text-right flex flex-col items-end">
                                <p className={`text-xs font-bold leading-none ${TC.textPrimary} mb-1`}>
                                    ${coin.current_price?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                                </p>
                                <p className={`text-[10px] font-semibold flex items-center ${TC.textPriceNegative}`}>
                                    {coin.price_change_percentage_24h?.toFixed(2)}%
                                </p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className={`h-full flex flex-col items-center justify-center text-center opacity-60 rounded-lg ${TC.bgEmpty} min-h-[200px]`}>
                        <div className={`p-3 rounded-full mb-2 ${isLight ? "bg-white" : "bg-gray-700"}`}>
                            <FaExclamationTriangle className={TC.textSecondary} />
                        </div>
                        <p className={`text-xs ${TC.textSecondary}`}>No data available</p>
                    </div>
                )}
            </div>
            <style jsx>{`
                .scrollbar-hide {
                -ms-overflow-style: none;
                scrollbar-width: none;
                }
                .scrollbar-hide::-webkit-scrollbar {
                display: none;
                }
            `}</style>
        </div>
    );
}

export default TopLosers;
