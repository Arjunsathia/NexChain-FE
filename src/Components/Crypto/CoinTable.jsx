import useThemeCheck from '@/hooks/useThemeCheck';
import React, { useState, useCallback, useMemo, useEffect } from "react";
import { FaStar, FaRegStar, FaSearch, FaExchangeAlt } from "react-icons/fa";
import useCoinContext from "@/hooks/useCoinContext";
import useUserContext from "@/hooks/useUserContext";
import { useNavigate, useLocation } from "react-router-dom";
import { useVisitedRoutes } from "@/hooks/useVisitedRoutes";
import { usePurchasedCoins } from "@/hooks/usePurchasedCoins";
import toast from "react-hot-toast";
import { postForm, getData, deleteWatchList } from "@/api/axiosConfig";
import { useBinanceTicker } from "@/hooks/useBinanceTicker";

function Sparkline({ data = [], width = 100, height = 24, positive = true }) {
    if (!data || data.length === 0) return <div className="w-24 h-6" />;

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const step = width / (data.length - 1);

    const points = data
        .map((v, i) => {
            const x = i * step;
            const y = height - ((v - min) / range) * height;
            return `${x},${y}`;
        })
        .join(" ");

    const color = positive ? "#10B981" : "#EF4444";

    return (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
            <polyline
                fill="none"
                stroke={color}
                strokeWidth="2"
                points={points}
                strokeOpacity="0.9"
            />
        </svg>
    );
}

const CoinRow = React.memo(({ coin, index, isLight, TC, toggleWishlist, navigate, handleTrade, disableAnimations, formatCurrency, liveData }) => {

    // Derived display values from liveData OR fallback to coin static data
    const displayPrice = liveData?.price !== undefined
        ? liveData.price
        : coin.current_price;

    const displayChange = liveData?.change !== undefined
        ? liveData.change
        : coin.price_change_percentage_24h;

    const isPositive = liveData?.isPositive !== undefined
        ? liveData.isPositive
        : (coin.price_change_percentage_24h || 0) >= 0;

    const priceColor = isLight ? "text-gray-900" : "text-white";

    // Memoize the Sparkline data? Usually sparkline doesn't update live over websocket unless backend sends it.
    // Assuming sparkline is static for now.

    const renderedPrice = typeof displayPrice === "number"
        ? displayPrice.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 6 })
        : displayPrice;

    return (
        <tr
            onClick={() => navigate(`/coin/coin-details/${coin.id}`, { state: { coin } })}
            className={`cursor-pointer transition-all duration-200 group ${disableAnimations ? '' : 'fade-in'} ${TC.bgHover}`}
            style={disableAnimations ? {} : { animationDelay: `${0.6 + index * 0.05}s` }}
        >
            <td className="py-4 px-6 text-center" onClick={(e) => e.stopPropagation()}>
                <button
                    onClick={() => toggleWishlist(coin.id, coin)}
                    className={`flex justify-center w-full ${disableAnimations ? '' : 'fade-in'}`}
                    style={disableAnimations ? {} : { animationDelay: `${0.6 + index * 0.05 + 0.02}s` }}
                >
                    {coin.isInWatchlist ? (
                        <FaStar className={`${TC.starFilled} hover:scale-110 transition-transform`} />
                    ) : (
                        <FaRegStar className={`${TC.starDefault} transition-colors`} />
                    )}
                </button>
            </td>
            <td className="py-4 px-6">
                <div className={`flex items-center gap-3 ${disableAnimations ? '' : 'fade-in'}`} style={disableAnimations ? {} : { animationDelay: `${0.6 + index * 0.05 + 0.03}s` }}>
                    <img src={coin.image} alt={coin.name} className="w-10 h-10 rounded-full group-hover:scale-110 transition-transform duration-300" />
                    <div className="min-w-0 flex-1">
                        <div className={`text-base font-semibold transition-colors ${TC.textPrimary} group-hover:text-cyan-600`}>
                            {coin.name}
                        </div>
                        <div className={`text-sm uppercase ${TC.textTertiary}`}>
                            {coin.symbol.toUpperCase()}
                        </div>
                        {coin.userHolding && (
                            <div className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${isLight ? "text-green-700 bg-green-100" : "text-green-400 bg-green-400/20"}`}>
                                Holding:{" "}
                                {coin.userHolding.totalQuantity?.toFixed(6) ||
                                    coin.userHolding.quantity?.toFixed(6)}{" "}
                                {coin.symbol.toUpperCase()}
                            </div>
                        )}
                    </div>
                </div>
            </td>
            <td className={`py-4 px-6 text-right ${disableAnimations ? '' : 'fade-in'} ${TC.textPrimary}`} style={disableAnimations ? {} : { animationDelay: `${0.6 + index * 0.05 + 0.04}s` }}>
                <div className="text-base font-semibold">
                    ${renderedPrice || "0"}
                </div>
            </td>
            <td className={`py-4 px-6 text-right font-semibold ${disableAnimations ? '' : 'fade-in'} ${!isPositive ? "text-red-600" : "text-green-600"
                }`} style={disableAnimations ? {} : { animationDelay: `${0.6 + index * 0.05 + 0.05}s` }}>
                {displayChange?.toFixed(2) || "0.00"}%
            </td>
            <td className={`py-4 px-6 text-right ${disableAnimations ? '' : 'fade-in'} ${TC.textSecondary}`} style={disableAnimations ? {} : { animationDelay: `${0.6 + index * 0.05 + 0.06}s` }}>
                <div className="text-sm">
                    {formatCurrency(coin.market_cap)}
                </div>
            </td>
            <td className={`py-4 px-6 text-right ${disableAnimations ? '' : 'fade-in'} ${TC.textSecondary}`} style={disableAnimations ? {} : { animationDelay: `${0.6 + index * 0.05 + 0.07}s` }}>
                <div className="text-sm">
                    {formatCurrency(coin.total_volume)}
                </div>
            </td>
            <td className={`py-4 px-6 ${disableAnimations ? '' : 'fade-in'}`} style={disableAnimations ? {} : { animationDelay: `${0.6 + index * 0.05 + 0.08}s` }}>
                <div className="flex justify-center">
                    <Sparkline
                        data={coin.sparkline_in_7d?.price || []}
                        width={100}
                        height={40}
                        positive={isPositive}
                    />
                </div>
            </td>
            <td className={`py-4 px-6 ${disableAnimations ? '' : 'fade-in'}`} style={disableAnimations ? {} : { animationDelay: `${0.6 + index * 0.05 + 0.09}s` }}>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        handleTrade(coin);
                    }}
                    className={`${TC.btnPrimary} px-4 py-2 transition-all duration-200 inline-flex items-center justify-center gap-2`}
                >
                    <FaExchangeAlt className="text-xs" />
                    Trade
                </button>
            </td>
        </tr>
    );
});

CoinRow.displayName = "CoinRow";


function CoinTable({ onTrade, disableAnimations = false }) {
    const isLight = useThemeCheck();
    const { user } = useUserContext();
    const { coins: initialCoins, coinsLoading } = useCoinContext();
    const { purchasedCoins, refreshPurchasedCoins } = usePurchasedCoins();
    const [coins, setCoins] = useState(Array.isArray(initialCoins) ? initialCoins : []);
    const [watchlist, setWatchlist] = useState([]);

    const navigate = useNavigate();
    const location = useLocation();
    const { isVisited } = useVisitedRoutes();
    const [shouldAnimate] = useState(!disableAnimations && !isVisited(location.pathname));

    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const TC = useMemo(() => ({
        textPrimary: isLight ? "text-gray-900" : "text-white",
        textSecondary: isLight ? "text-gray-500" : "text-gray-400",
        textTertiary: isLight ? "text-gray-500" : "text-gray-500",

        // Dashboard Stability Glassmorphism
        bgContainer: isLight
            ? "bg-white/70 backdrop-blur-xl shadow-md border border-gray-100 glass-card"
            : "bg-gray-900/95 backdrop-blur-none shadow-none border border-gray-700/50 glass-card",
        bgCard: isLight
            ? "bg-white/70 backdrop-blur-xl shadow-md border border-gray-100 glass-card"
            : "bg-gray-900/95 backdrop-blur-none shadow-none border border-gray-700/50 glass-card",
        bgHeader: isLight ? "bg-gray-100/50" : "bg-gray-900/95",
        bgHover: isLight ? "hover:bg-blue-50/50" : "hover:bg-white/5",

        bgLoading: isLight ? "bg-white border-gray-300 text-cyan-600" : "bg-gray-800/50 backdrop-blur-sm border-gray-700 text-cyan-400",
        bgTableHeader: isLight ? "bg-gray-100/50" : "bg-white/5",
        bgTableFooter: isLight ? "bg-gray-100 border-t border-gray-300" : "bg-gray-900/50 border-t border-gray-700",
        tableDivide: isLight ? "divide-gray-100" : "divide-white/5",
        inputBg: isLight ? "bg-white border-gray-300 text-gray-800 placeholder-gray-500" : "bg-gray-800 border-gray-700 text-white placeholder-gray-400",
        btnPagination: isLight ? "bg-gray-200 text-gray-800 hover:bg-gray-300" : "bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700",
        btnPaginationActive: isLight ? "bg-cyan-600 text-white shadow-md" : "bg-cyan-600 text-white shadow-md",
        bgPillPositive: isLight ? "bg-emerald-100 text-emerald-600" : "bg-emerald-500/20 text-emerald-400",
        bgPillNegative: isLight ? "bg-rose-100 text-rose-600" : "bg-rose-500/20 text-rose-400",
        bgSubCard: isLight ? "bg-gray-100/70" : "bg-gray-700/30",
        starDefault: isLight ? "text-gray-400 hover:text-yellow-600" : "text-gray-500 hover:text-yellow-400",
        starFilled: isLight ? "text-yellow-600" : "text-yellow-400",
        btnPrimary: "bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md shadow-blue-500/20 transition-all hover:scale-105 active:scale-95 text-sm font-bold",
    }), [isLight]);

    useEffect(() => {
        if (Array.isArray(initialCoins) && initialCoins.length > 0) {
            // Only update if we don't have coins yet or if the source data length changed significantly
            // to avoid resetting local state on minor updates if any.
            // Since initialCoins comes from Redux and is static after load, this is safe.
            setCoins(initialCoins.slice(0, 100));
        }
    }, [initialCoins]);

    const fetchWatchlist = useCallback(async () => {
        if (!user?.id) return;
        try {
            const res = await getData("/watchlist", { user_id: user.id });
            const watchlistIds = (res || []).map(item => item.id || item.coin_id || item.id);
            setWatchlist(watchlistIds);
        } catch (err) {
            console.error("Failed to fetch watchlist data", err);
        }
    }, [user?.id]);

    useEffect(() => {
        fetchWatchlist();
    }, [fetchWatchlist]);

    // Use shared hook for live ticker (limit to first 100 to avoid connection overload)
    const liveData = useBinanceTicker();

    const toggleWishlist = useCallback(async (coinId, coinData) => {
        if (!user?.id) {
            toast.error("Please login to manage watchlist");
            return;
        }

        const isCurrentlyInWatchlist = watchlist.includes(coinId);

        setWatchlist(prev =>
            isCurrentlyInWatchlist
                ? prev.filter(id => id !== coinId)
                : [...prev, coinId]
        );

        if (isCurrentlyInWatchlist) {
            toast.success("Coin removed from watchlist!");
        } else {
            toast.success("Coin added to watchlist!");
        }

        const postData = {
            user_id: user.id,
            id: coinData?.id,
            image: coinData?.image,
            symbol: coinData?.symbol,
            current_price: coinData?.current_price,
            price_change_percentage_1h_in_currency: coinData?.price_change_percentage_1h_in_currency,
            price_change_percentage_24h_in_currency: coinData?.price_change_percentage_24h_in_currency,
            price_change_percentage_24h: coinData?.price_change_percentage_24h,
            price_change_percentage_7d_in_currency: coinData?.price_change_percentage_7d_in_currency,
            market_cap: coinData?.market_cap,
            total_volume: coinData?.total_volume,
            sparkline_in_7d: { price: coinData?.sparkline_in_7d?.price },
        };

        try {
            if (isCurrentlyInWatchlist) {
                await deleteWatchList("/watchlist/remove", {
                    id: coinId,
                    user_id: user.id,
                });
            } else {
                await postForm("/watchlist/add", postData);
            }
            await fetchWatchlist();
        } catch (err) {
            console.error("Watchlist operation failed:", err);
            setWatchlist(prev =>
                isCurrentlyInWatchlist
                    ? [...prev, coinId]
                    : prev.filter(id => id !== coinId)
            );
            toast.error("Operation failed. Reverting changes.");
        }
    }, [watchlist, user?.id, fetchWatchlist]);

    const handleTrade = useCallback(async (coin, options = {}) => {
        onTrade(coin, options);
        if (refreshPurchasedCoins) {
            try {
                await refreshPurchasedCoins();
            } catch (error) {
                console.error("Failed to refresh purchased coins:", error);
            }
        }
    }, [onTrade, refreshPurchasedCoins]);

    const filteredCoins = useMemo(() => {
        if (!Array.isArray(coins)) return [];
        if (!searchTerm) return coins;
        const term = searchTerm.toLowerCase();
        return coins.filter(coin =>
            coin.name.toLowerCase().includes(term) ||
            coin.symbol.toLowerCase().includes(term)
        );
    }, [coins, searchTerm]);

    const enhancedCoins = useMemo(() => {
        if (!Array.isArray(filteredCoins)) return [];
        const safePurchasedCoins = Array.isArray(purchasedCoins) ? purchasedCoins : [];
        return filteredCoins.map(coin => {
            const isInWatchlist = watchlist.includes(coin.id);
            const userHolding = safePurchasedCoins.find(
                pc => pc.coin_id === coin.id || pc.id === coin.id
            );

            // Removing liveData merge to ensure row stability.
            // Live data is now passed directly to the CoinRow component.

            return {
                ...coin,
                isInWatchlist,
                userHolding: userHolding || null
            };
        });
    }, [filteredCoins, watchlist, purchasedCoins]);

    const formatCurrency = useCallback((value) => {
        if (!value) return "$0";
        return "$" + (
            value >= 1e12 ? (value / 1e12).toFixed(1) + "T" :
                value >= 1e9 ? (value / 1e9).toFixed(1) + "B" :
                    value >= 1e6 ? (value / 1e6).toFixed(1) + "M" :
                        value.toLocaleString("en-IN")
        );
    }, []);

    const { paginatedCoins, totalPages } = useMemo(() => {
        const totalPages = Math.ceil(enhancedCoins.length / itemsPerPage);
        const paginatedCoins = enhancedCoins.slice(
            (currentPage - 1) * itemsPerPage,
            currentPage * itemsPerPage
        );
        return { paginatedCoins, totalPages };
    }, [enhancedCoins, currentPage, itemsPerPage]);

    const handlePrev = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
    const handleNext = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    const handlePageClick = (page) => setCurrentPage(page);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const clearSearch = () => {
        setSearchTerm("");
        setCurrentPage(1);
    };

    const renderPaginationButtons = useMemo(() => {
        const maxButtons = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
        let endPage = Math.min(totalPages, startPage + maxButtons - 1);
        if (endPage - startPage < maxButtons - 1) {
            startPage = Math.max(1, endPage - maxButtons + 1);
        }
        return [...Array(endPage - startPage + 1)].map((_, index) => {
            const page = startPage + index;
            return (
                <button
                    key={page}
                    onClick={() => handlePageClick(page)}
                    className={`px-3 py-2 rounded text-sm font-medium transition-all duration-200 ${shouldAnimate ? 'fade-in' : ''} ${currentPage === page
                        ? TC.btnPaginationActive
                        : TC.btnPagination
                        }`}
                    style={shouldAnimate ? { animationDelay: `${0.8 + index * 0.05}s` } : {}}
                >
                    {page}
                </button>
            );
        });
    }, [totalPages, currentPage, TC]);

    if (coinsLoading && coins.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6">
                <div className={`rounded-xl p-8 text-center ${disableAnimations ? '' : 'fade-in'} ${TC.bgLoading}`}>
                    <div className="flex justify-center items-center gap-3 text-cyan-400">
                        <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-base">Loading coins...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`w-full ${TC.textPrimary}`}>
            <div className={`p-1 rounded-xl ${shouldAnimate ? 'fade-in' : ''} ${TC.bgCard}`}>
                <div className="px-4 pt-3 flex items-center justify-between mb-2">
                    <h3 className="font-bold text-base bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent flex items-center gap-2">
                        <FaExchangeAlt className="text-blue-500" size={14} />
                        Cryptocurrency Prices
                    </h3>
                    {paginatedCoins.length > 0 && (
                        <span className={`text-[10px] ${TC.textSecondary} px-2 py-0.5 rounded-full border ${isLight ? "border-gray-200" : "border-gray-700"} font-bold uppercase tracking-wider`}>
                            {enhancedCoins.length} Coins
                        </span>
                    )}
                </div>
                <div className="px-4 mb-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search coins..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className={`w-full border rounded-xl pl-10 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm transition-all duration-200 ${TC.inputBg}`}
                        />
                        <FaSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${TC.textTertiary} text-sm`} />
                        {searchTerm && (
                            <button
                                onClick={clearSearch}
                                className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${TC.textTertiary} hover:${TC.textPrimary} text-lg transition-colors`}
                            >
                                ×
                            </button>
                        )}
                    </div>
                    {searchTerm && (
                        <div className={`text-sm mt-2 fade-in ${TC.textTertiary}`}>
                            Found {enhancedCoins.length} coin{enhancedCoins.length !== 1 ? 's' : ''} matching &quot;{searchTerm}&quot;
                        </div>
                    )}
                </div>
                <div className="lg:hidden">
                    {paginatedCoins.length > 0 ? (
                        <div className="space-y-3">
                            {paginatedCoins.map((coin, index) => (
                                <div
                                    key={coin.id}
                                    onClick={() => navigate(`/coin/coin-details/${coin.id}`, { state: { coin } })}
                                    className={`p-4 rounded-xl border ${isLight
                                        ? "bg-gray-50 border-gray-200 shadow-sm hover:bg-gray-50"
                                        : "bg-gray-800/20 border-gray-700/50 hover:bg-gray-800/40"
                                        } cursor-pointer transition-all duration-300 group ${shouldAnimate ? 'fade-in' : ''}`}
                                    style={shouldAnimate ? { animationDelay: `${0.5 + index * 0.1}s` } : {}}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleWishlist(coin.id, coin);
                                                }}
                                                className="flex-shrink-0"
                                            >
                                                {coin.isInWatchlist ? (
                                                    <FaStar className={`${TC.starFilled} text-xl hover:scale-110 transition-transform`} />
                                                ) : (
                                                    <FaRegStar className={`${TC.starDefault} transition-colors text-xl`} />
                                                )}
                                            </button>
                                            <img src={coin.image} alt={coin.name} className="w-10 h-10 flex-shrink-0 rounded-full group-hover:scale-110 transition-transform duration-300" />
                                            <div className="min-w-0 flex-1">
                                                <div className={`font-semibold text-base truncate transition-colors ${TC.textPrimary} group-hover:text-cyan-600`}>{coin.name}</div>
                                                <div className={`text-sm uppercase ${TC.textTertiary}`}>{coin.symbol.toUpperCase()}</div>
                                                {coin.userHolding && (
                                                    <div className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${isLight ? "text-green-700 bg-green-100" : "text-green-400 bg-green-400/20"}`}>
                                                        Holding:{" "}
                                                        {coin.userHolding.totalQuantity?.toFixed(6) ||
                                                            coin.userHolding.quantity?.toFixed(6)}{" "}
                                                        {coin.symbol.toUpperCase()}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className={`font-semibold text-sm px-2 py-1 rounded-lg ${coin.price_change_percentage_24h < 0 ? TC.bgPillNegative : TC.bgPillPositive
                                            }`}>
                                            {coin.price_change_percentage_24h?.toFixed(2) || "0.00"}%
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between mb-3">
                                        <div className={`font-bold text-xl ${TC.textPrimary}`}>
                                            ${coin.current_price?.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 4 }) || "0"}
                                        </div>
                                        <div className="w-20 h-10">
                                            <Sparkline
                                                data={coin.sparkline_in_7d?.price || []}
                                                width={80}
                                                height={40}
                                                positive={coin.price_change_percentage_24h >= 0}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                                        <div className={`p-2 rounded-lg ${TC.bgSubCard}`}>
                                            <div className={`text-xs mb-1 ${TC.textTertiary}`}>Market Cap</div>
                                            <div className={`font-medium ${TC.textSecondary}`}>{formatCurrency(coin.market_cap)}</div>
                                        </div>
                                        <div className={`p-2 rounded-lg ${TC.bgSubCard}`}>
                                            <div className={`text-xs mb-1 ${TC.textTertiary}`}>Volume</div>
                                            <div className={`font-medium ${TC.textSecondary}`}>{formatCurrency(coin.total_volume)}</div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleTrade(coin);
                                            }}
                                            className={`${TC.btnPrimary} flex-1 px-4 py-2.5 transition-all duration-200 inline-flex items-center justify-center gap-2`}
                                            style={disableAnimations ? {} : { animationDelay: `${0.5 + index * 0.1 + 0.05}s` }}
                                        >
                                            <FaExchangeAlt className="text-sm" />
                                            Trade
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className={`text-center py-12 rounded-xl ${shouldAnimate ? 'fade-in' : ''} ${TC.textTertiary}`} style={shouldAnimate ? { animationDelay: "0.5s" } : {}}>
                            <div className="text-5xl mb-3">🔍</div>
                            No coins found matching &quot;{searchTerm}&quot;
                        </div>
                    )}
                </div>
                <div className={`hidden lg:block ${shouldAnimate ? 'fade-in' : ''}`} style={shouldAnimate ? { animationDelay: "0.4s" } : {}}>
                    <div>
                        {paginatedCoins.length === 0 ? (
                            <div className={`p-12 text-center ${shouldAnimate ? 'fade-in' : ''} ${TC.textTertiary}`} style={shouldAnimate ? { animationDelay: "0.5s" } : {}}>
                                <div className="text-6xl mb-4">🔍</div>
                                <div className="text-xl">
                                    No coins found matching &quot;{searchTerm}&quot;
                                </div>
                            </div>
                        ) : (
                            <div className={`overflow-hidden rounded-xl border ${isLight ? 'border-gray-100' : 'border-gray-700/50'} shadow-md mx-2 mb-2`}>
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className={`${TC.bgTableHeader} uppercase tracking-wider text-xs font-bold`}>
                                            <th className={`py-4 px-6 text-center ${TC.textSecondary}`}>★</th>
                                            <th className={`py-4 px-6 ${TC.textSecondary}`}>Coin</th>
                                            <th className={`py-4 px-6 text-right ${TC.textSecondary}`}>Price</th>
                                            <th className={`py-4 px-6 text-right ${TC.textSecondary}`}>24h %</th>
                                            <th className={`py-4 px-6 text-right ${TC.textSecondary}`}>Market Cap</th>
                                            <th className={`py-4 px-6 text-right ${TC.textSecondary}`}>Volume</th>
                                            <th className={`py-4 px-6 text-center ${TC.textSecondary}`}>Trend</th>
                                            <th className={`py-4 px-6 text-center ${TC.textSecondary}`}>Trade</th>
                                        </tr>
                                    </thead>
                                    <tbody className={`divide-y ${TC.tableDivide}`}>
                                        {paginatedCoins.map((coin, index) => (
                                            <CoinRow
                                                key={coin.id}
                                                coin={coin}
                                                index={index}
                                                isLight={isLight} // Pass this if CoinRow needs it
                                                TC={TC}
                                                toggleWishlist={toggleWishlist}
                                                navigate={navigate}
                                                handleTrade={handleTrade}
                                                disableAnimations={!shouldAnimate}
                                                formatCurrency={formatCurrency}
                                                liveData={liveData[coin.id]}
                                            />
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        {paginatedCoins.length > 0 && (
                            <div className={`px-6 py-4 ${shouldAnimate ? 'fade-in' : ''} ${TC.bgTableFooter} rounded-b-2xl`} style={shouldAnimate ? { animationDelay: "0.7s" } : {}}>
                                <div className={`flex justify-between items-center text-sm ${TC.textTertiary}`}>
                                    <span>
                                        Showing {paginatedCoins.length} of {enhancedCoins.length} coins
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                        <span>Live Data</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                {totalPages > 1 && (
                    <div className={`flex flex-col items-center gap-4 pt-6 pb-6 ${shouldAnimate ? 'fade-in' : ''} ${TC.textTertiary}`} style={shouldAnimate ? { animationDelay: "0.8s" } : {}}>
                        <div className="flex justify-center items-center gap-2">
                            <button
                                onClick={handlePrev}
                                disabled={currentPage === 1}
                                className={`px-4 py-2 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 ${shouldAnimate ? 'fade-in' : ''} ${TC.btnPagination}`}
                                style={shouldAnimate ? { animationDelay: "0.85s" } : {}}
                            >
                                Prev
                            </button>
                            {renderPaginationButtons}
                            <button
                                onClick={handleNext}
                                disabled={currentPage === totalPages}
                                className={`px-4 py-2 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 ${shouldAnimate ? 'fade-in' : ''} ${TC.btnPagination}`}
                                style={shouldAnimate ? { animationDelay: "0.9s" } : {}}
                            >
                                Next
                            </button>
                        </div>
                        <div className={`text-sm ${shouldAnimate ? 'fade-in' : ''}`} style={shouldAnimate ? { animationDelay: "0.95s" } : {}}>
                            Page {currentPage} of {totalPages}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default CoinTable;
