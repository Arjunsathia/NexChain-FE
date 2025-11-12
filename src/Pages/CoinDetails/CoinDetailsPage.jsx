import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCoinById } from "@/api/coinApis";
import ApexCharts from "react-apexcharts";
import axios from "axios";
import useUserContext from "@/Context/UserContext/useUserContext";
import {
  FaArrowLeft,
  FaExternalLinkAlt,
  FaStar,
  FaRegStar,
  FaExchangeAlt,
  FaChartLine,
  FaCoins,
  FaArrowUp,
  FaArrowDown,
  FaTimes,
} from "react-icons/fa";
import TradeModal from "../UserProfile/Components/TradeModal";
import { usePurchasedCoins } from "@/hooks/usePurchasedCoins";
import useCoinContext from "@/Context/CoinContext/useCoinContext";

// Move TradePanel outside the main component to prevent recreation
const TradePanel = React.memo(
  ({
    className = "",
    onTrade,
    symbol,
    currentPrice,
    hasHoldings = false,
  }) => (
    <div
      className={`bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4 sm:p-6 fade-in ${className}`}
      style={{ animationDelay: "0.5s" }}
    >
      <h3 className="text-lg sm:text-xl font-semibold text-cyan-400 mb-3 sm:mb-4">
        Trade {symbol?.toUpperCase()}
      </h3>

      {/* Holdings badge */}
      {hasHoldings && (
        <div className="mb-3 p-2 bg-green-500/20 border border-green-500/30 rounded-lg">
          <p className="text-green-400 text-sm text-center font-medium">
            🪙 You hold this coin in your portfolio
          </p>
        </div>
      )}

      <div className="space-y-3 sm:space-y-4">
        <div className="grid grid-cols-1 gap-2 sm:gap-3">
          <button
            onClick={onTrade}
            className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white py-2 sm:py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-cyan-500/25 transform hover:scale-105 text-sm sm:text-base flex items-center justify-center gap-2"
          >
            <FaExchangeAlt className="text-sm" />
            Trade
          </button>
        </div>

        {/* Current Price Display */}
        {currentPrice !== undefined && currentPrice !== null && (
          <div className="text-center text-xs sm:text-sm text-gray-400 pt-2 border-t border-gray-600">
            Current Price: ${Number(currentPrice).toLocaleString('en-US')}
          </div>
        )}
      </div>
    </div>
  )
);

function CoinDetailsPage() {
  const { coinId } = useParams();
  const navigate = useNavigate();
  const [coin, setCoin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState("line");
  const [chartData, setChartData] = useState([]);
  const [timeframe, setTimeframe] = useState("7d");
  const [wishlist, setWishlist] = useState(false);

  const { user } = useUserContext();
  const { purchasedCoins } = usePurchasedCoins();
  const { coins: liveCoins } = useCoinContext();

  // Check if user has holdings of this coin
  const userHoldings = useMemo(() => {
    if (!coinId || !purchasedCoins || purchasedCoins.length === 0) return null;
    return purchasedCoins.find(holding => 
      holding.coin_id === coinId || holding.id === coinId
    );
  }, [coinId, purchasedCoins]);

  const hasHoldings = useMemo(() => {
    return userHoldings && (userHoldings.totalQuantity > 0 || userHoldings.quantity > 0);
  }, [userHoldings]);

  // Find the live coin data for consistent structure
  const liveCoin = useMemo(() => {
    return liveCoins.find(c => c.id === coinId);
  }, [liveCoins, coinId]);

  // Fetch coin details
  const fetchCoin = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getCoinById(coinId);
      setCoin(res?.data ?? res);
    } catch (err) {
      console.error("Error fetching coin", err);
      setCoin(null);
    } finally {
      setLoading(false);
    }
  }, [coinId]);

  useEffect(() => {
    if (!coinId) return;
    fetchCoin();
  }, [fetchCoin, coinId]);

  const [tradeModal, setTradeModal] = useState({
    show: false,
    coin: null,
    type: "buy",
  });

  // Single Trade handler - Use the same structure as Watchlist
  const handleTrade = useCallback(() => {
    if (!coin || !user) {
      alert("Please login to trade cryptocurrency");
      return;
    }

    // Use liveCoin if available for consistent structure, otherwise transform the coin
    const tradeCoin = liveCoin || {
      ...coin,
      current_price: coin?.market_data?.current_price?.usd,
      image: coin.image?.large,
      symbol: coin.symbol,
      name: coin.name,
      id: coin.id
    };

    setTradeModal({
      show: true,
      coin: tradeCoin,
      type: "buy",
    });
  }, [coin, user, liveCoin]);

  const toggleWishlist = useCallback(() => {
    setWishlist((prev) => !prev);
  }, []);

  // Format currency function - Consistent with Watchlist
  const formatCurrency = useCallback((value) => {
    if (value === null || value === undefined || isNaN(Number(value)))
      return "$0";
    const num = Number(value);
    return "$" + num.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    });
  }, []);

  // Format regular numbers
  const formatNumber = useCallback((value) => {
    if (value === null || value === undefined || isNaN(Number(value)))
      return "0";
    const num = Number(value);
    return num.toLocaleString('en-US');
  }, []);

  // Fetch chart data (with cancellation)
  useEffect(() => {
    if (!coinId) {
      setChartData([]);
      return;
    }

    const source = axios.CancelToken.source();
    let mounted = true;

    (async () => {
      try {
        const daysMap = { "1h": 1, "24h": 1, "7d": 7, "30d": 30, "1y": 365 };
        const days = daysMap[timeframe] || 7;

        if (chartType === "candlestick") {
          const res = await axios.get(
            `https://api.coingecko.com/api/v3/coins/${coinId}/ohlc`,
            { params: { vs_currency: "usd", days }, cancelToken: source.token }
          );

          const ohlcData = Array.isArray(res.data)
            ? res.data.map(([time, open, high, low, close]) => ({
                x: new Date(time),
                y: [open, high, low, close],
              }))
            : [];

          if (mounted) setChartData(ohlcData);
        } else {
          const response = await axios.get(
            `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart`,
            {
              params: {
                vs_currency: "usd",
                days,
                interval: timeframe === "1h" ? "hourly" : "daily",
              },
              cancelToken: source.token,
            }
          );

          const prices = (response.data?.prices || []).map(([time, price]) => ({
            x: new Date(time),
            y: price,
          }));
          if (mounted) setChartData(prices);
        }
      } catch (err) {
        if (!axios.isCancel(err)) {
          console.error("Failed to fetch chart data:", err);
          if (mounted) setChartData([]);
        }
      }
    })();

    return () => {
      mounted = false;
      source.cancel("Operation canceled due to new request.");
    };
  }, [timeframe, chartType, coinId]);

  // Chart options
  const isDesktop = typeof window !== "undefined" && window.innerWidth >= 768;
  const chartOptions = useMemo(
    () => ({
      chart: {
        type: chartType,
        background: "transparent",
        toolbar: {
          show: isDesktop,
          tools: {
            download: true,
            selection: true,
            zoom: true,
            zoomin: true,
            zoomout: true,
            pan: true,
            reset: true,
          },
        },
        zoom: { enabled: isDesktop },
      },
      xaxis: {
        type: "datetime",
        labels: {
          style: { colors: "#9CA3AF" },
          datetimeFormatter: {
            hour: "HH:mm",
            day: "MMM dd",
          },
        },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        tooltip: { enabled: true },
        labels: {
          formatter: (val) => `$${val?.toLocaleString('en-US') || "0"}`,
          style: { colors: "#9CA3AF" },
        },
      },
      tooltip: {
        x: { format: "MMM dd, HH:mm" },
        theme: "dark",
      },
      grid: {
        borderColor: "#374151",
        strokeDashArray: 4,
      },
      stroke: {
        curve: "smooth",
        width: chartType === "line" ? 3 : 1,
      },
      fill: {
        type: chartType === "line" ? "gradient" : "solid",
        gradient:
          chartType === "line"
            ? {
                type: "vertical",
                shadeIntensity: 0.5,
                gradientToColors: ["#06B6D4"],
                stops: [0, 100],
              }
            : undefined,
      },
      colors: chartType === "line" ? ["#06B6D4"] : undefined,
    }),
    [chartType, isDesktop]
  );

  const renderSkeleton = useMemo(
    () => (
      <div className="min-h-screen p-3 xs:p-4 sm:p-6 fade-in bg-gray-900">
        {/* Back Button Skeleton */}
        <div className="flex items-center gap-2 mb-6">
          <div className="w-4 h-4 bg-gray-700 rounded animate-pulse"></div>
          <div className="w-20 h-4 bg-gray-700 rounded animate-pulse"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Left Column - Coin Details, Chart & Trade Panel */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Coin Header Skeleton */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4 sm:p-6">
              <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-700 rounded-full animate-pulse"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-6 sm:h-8 w-32 sm:w-48 bg-gray-700 rounded animate-pulse"></div>
                  <div className="h-4 w-20 sm:w-24 bg-gray-700 rounded animate-pulse"></div>
                </div>
              </div>
              <div className="h-8 sm:h-10 w-48 sm:w-64 bg-gray-700 rounded animate-pulse mb-4 sm:mb-6"></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center p-2 sm:p-3 bg-gray-800/30 rounded-lg"
                  >
                    <div className="h-4 w-20 sm:w-24 bg-gray-700 rounded animate-pulse"></div>
                    <div className="h-4 w-16 sm:w-20 bg-gray-700 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chart Skeleton */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4 sm:p-6">
              <div className="h-60 sm:h-80 bg-gray-700 rounded animate-pulse"></div>
            </div>

            {/* Trade Panel Skeleton - Visible on all screens but positioned differently */}
            <div className="lg:hidden bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4 sm:p-6">
              <div className="h-32 sm:h-40 bg-gray-700 rounded animate-pulse"></div>
            </div>
          </div>

          {/* Right Column - About Section & Links */}
          <div className="space-y-4 sm:space-y-6">
            {/* About Section Skeleton */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4 sm:p-6">
              <div className="h-40 sm:h-60 bg-gray-700 rounded animate-pulse"></div>
            </div>

            {/* Trade Panel Skeleton - Hidden on medium/small, visible on large */}
            <div className="hidden lg:block bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4 sm:p-6">
              <div className="h-32 sm:h-40 bg-gray-700 rounded animate-pulse"></div>
            </div>

            {/* Links Skeleton */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4 sm:p-6">
              <div className="h-20 sm:h-24 bg-gray-700 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    ),
    []
  );

  if (loading || !coin) {
    return renderSkeleton;
  }

  const priceChange24h = coin.market_data?.price_change_percentage_24h || 0;
  const priceChangeColor =
    priceChange24h >= 0 ? "text-green-400" : "text-red-400";

  return (
    <>
      <div className="min-h-screen p-3 xs:p-4 sm:p-6 fade-in ">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 mb-4 sm:mb-6 transition-colors fade-in text-sm sm:text-base"
          style={{ animationDelay: "0.1s" }}
        >
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Left Column - Coin Details & Chart */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Coin Header Section */}
            <div
              className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4 sm:p-6 fade-in transition-all duration-300 hover:border-gray-600"
              style={{ animationDelay: "0.2s" }}
            >
              <div className="flex items-start justify-between mb-4 sm:mb-6">
                <div className="flex items-center gap-3 sm:gap-4">
                  <img
                    src={coin.image?.large}
                    alt={coin.name}
                    className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border border-gray-600"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                      <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white truncate">
                        {coin.name}
                      </h1>
                      <span className="text-cyan-400 text-sm sm:text-base uppercase bg-cyan-500/20 px-2 py-1 rounded self-start border border-cyan-500/30">
                        {coin.symbol}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm mt-1">
                      Rank #{coin.market_cap_rank || "N/A"}
                    </p>
                    {/* Show holdings badge if user has this coin */}
                    {hasHoldings && (
                      <div className="text-xs text-green-400 bg-green-500/20 px-2 py-0.5 rounded-full mt-1 inline-block border border-green-500/30">
                        🪙 You hold this coin in your portfolio
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={toggleWishlist}
                  className="text-xl sm:text-2xl text-yellow-400 hover:scale-110 transition-transform flex-shrink-0 ml-2"
                >
                  {wishlist ? <FaStar /> : <FaRegStar />}
                </button>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4 sm:mb-6">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
                  ${coin.market_data?.current_price?.usd?.toLocaleString('en-US') || "0"}
                </h2>
                <span
                  className={`text-base sm:text-lg font-semibold ${priceChangeColor}`}
                >
                  {priceChange24h >= 0 ? "+" : ""}
                  {priceChange24h?.toFixed(2)}%
                </span>
              </div>

              {/* Market Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    label: "Market Cap",
                    value: formatCurrency(coin.market_data?.market_cap?.usd),
                    icon: FaChartLine,
                    color: "text-cyan-400",
                  },
                  {
                    label: "24h Volume",
                    value: formatCurrency(coin.market_data?.total_volume?.usd),
                    icon: FaCoins,
                    color: "text-purple-400",
                  },
                  {
                    label: "Circulating Supply",
                    value: `${
                      formatNumber(coin.market_data?.circulating_supply) || "N/A"
                    } ${coin.symbol?.toUpperCase()}`,
                    icon: FaArrowUp,
                    color: "text-green-400",
                  },
                  {
                    label: "Total Supply",
                    value: coin.market_data?.total_supply
                      ? `${formatNumber(coin.market_data.total_supply)} ${coin.symbol?.toUpperCase()}`
                      : "N/A",
                    icon: FaCoins,
                    color: "text-blue-400",
                  },
                  {
                    label: "Max Supply",
                    value: coin.market_data?.max_supply
                      ? `${formatNumber(coin.market_data.max_supply)} ${coin.symbol?.toUpperCase()}`
                      : "N/A",
                    icon: FaArrowDown,
                    color: "text-red-400",
                  },
                  {
                    label: "All Time High",
                    value: `$${
                      coin.market_data?.ath?.usd?.toLocaleString('en-US') || "N/A"
                    }`,
                    icon: FaArrowUp,
                    color: "text-yellow-400",
                  },
                ].map((stat, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-3 bg-gray-800/30 rounded-lg border border-gray-700 fade-in transition-all duration-300 hover:border-gray-600"
                    style={{ animationDelay: `${0.3 + index * 0.1}s` }}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-${stat.color.split('-')[1]}-500/20 border border-${stat.color.split('-')[1]}-500/30`}>
                        <stat.icon className={`text-sm ${stat.color}`} />
                      </div>
                      <span className="text-gray-400 text-xs sm:text-sm">
                        {stat.label}
                      </span>
                    </div>
                    <span className="text-white font-medium text-xs sm:text-sm text-right">
                      {stat.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Chart Section */}
            <div
              className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4 sm:p-6 fade-in transition-all duration-300 hover:border-gray-600"
              style={{ animationDelay: "0.4s" }}
            >
              <div className="flex flex-col gap-3 mb-4">
                <h2 className="text-lg sm:text-xl font-semibold text-cyan-400">
                  Price Chart
                </h2>
                <div className="flex flex-col xs:flex-row gap-2">
                  {/* Timeframe Buttons */}
                  <div className="flex gap-1 bg-gray-800 rounded-lg p-1 overflow-x-auto">
                    {["1h", "24h", "7d", "30d", "1y"].map((t) => (
                      <button
                        key={t}
                        onClick={() => setTimeframe(t)}
                        className={`px-2 sm:px-3 py-1.5 rounded text-xs font-medium transition-all duration-200 whitespace-nowrap ${
                          timeframe === t
                            ? "bg-cyan-600 text-white shadow-lg shadow-cyan-500/25"
                            : "text-gray-300 hover:text-white hover:bg-gray-700"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>

                  {/* Chart Type Toggle */}
                  <button
                    onClick={() =>
                      setChartType(chartType === "line" ? "candlestick" : "line")
                    }
                    className="px-3 sm:px-4 py-1.5 bg-gray-800 hover:bg-gray-700 text-cyan-400 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 border border-gray-700 hover:border-cyan-500 whitespace-nowrap"
                  >
                    {chartType === "line" ? "Candlestick" : "Line"}
                  </button>
                </div>
              </div>

              <div className="h-60 sm:h-80">
                {chartData.length > 0 ? (
                  <ApexCharts
                    type={chartType}
                    series={
                      chartType === "candlestick"
                        ? [{ data: chartData }]
                        : [{ name: "Price", data: chartData }]
                    }
                    options={chartOptions}
                    height="100%"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <div className="text-center">
                      <div className="text-2xl sm:text-3xl mb-2">📊</div>
                      <p className="text-sm">No chart data available</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Trade Panel - Visible on Medium and Small screens under Chart */}
            <TradePanel
              className="lg:hidden"
              onTrade={handleTrade}
              symbol={coin.symbol}
              currentPrice={coin.market_data?.current_price?.usd}
              hasHoldings={hasHoldings}
            />
          </div>

          {/* Right Column - About Section, Trade Panel (Large screens) & Links */}
          <div className="space-y-4 sm:space-y-6">
            {/* About Section */}
            {coin.description?.en && (
              <div
                className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4 sm:p-6 fade-in transition-all duration-300 hover:border-gray-600"
                style={{ animationDelay: "0.6s" }}
              >
                <h3 className="text-lg sm:text-xl font-semibold text-cyan-400 mb-3 sm:mb-4">
                  About {coin.name}
                </h3>
                <div
                  className="text-gray-300 text-sm sm:text-base leading-relaxed max-h-60 overflow-y-auto"
                  dangerouslySetInnerHTML={{
                    __html:
                      typeof coin.description.en === "string" &&
                      coin.description.en.length > 500
                        ? coin.description.en.substring(0, 500) + "..."
                        : coin.description.en || "",
                  }}
                />
                {typeof coin.description.en === "string" &&
                  coin.description.en.length > 500 && (
                    <button className="text-cyan-400 hover:text-cyan-300 text-xs mt-3 transition-colors">
                      Read more
                    </button>
                  )}
              </div>
            )}

            {/* Trade Panel - Visible only on Large screens */}
            <TradePanel
              className="hidden lg:block"
              onTrade={handleTrade}
              symbol={coin.symbol}
              currentPrice={coin.market_data?.current_price?.usd}
              hasHoldings={hasHoldings}
            />

            {/* Links Section */}
            <div
              className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4 sm:p-6 fade-in transition-all duration-300 hover:border-gray-600"
              style={{ animationDelay: "0.8s" }}
            >
              <h3 className="text-lg sm:text-xl font-semibold text-cyan-400 mb-3 sm:mb-4">
                Links
              </h3>
              <div className="flex flex-col gap-2">
                {coin.links?.homepage?.[0] && (
                  <a
                    href={coin.links.homepage[0]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-lg text-sm border border-gray-700 hover:border-cyan-500"
                  >
                    <FaExternalLinkAlt className="text-xs" />
                    Official Website
                  </a>
                )}
                {coin.links?.blockchain_site?.[0] && (
                  <a
                    href={coin.links.blockchain_site[0]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-lg text-sm border border-gray-700 hover:border-cyan-500"
                  >
                    <FaExternalLinkAlt className="text-xs" />
                    Blockchain Explorer
                  </a>
                )}
                {coin.links?.official_forum_url?.[0] && (
                  <a
                    href={coin.links.official_forum_url[0]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-lg text-sm border border-gray-700 hover:border-cyan-500"
                  >
                    <FaExternalLinkAlt className="text-xs" />
                    Community Forum
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trade Modal - Use the same structure as Watchlist without full-screen wrapper */}
      <TradeModal
        show={tradeModal.show}
        onClose={() => setTradeModal({ show: false, coin: null, type: "buy" })}
        coin={tradeModal.coin}
        type={tradeModal.type}
        purchasedCoins={purchasedCoins}
      />
    </>
  );
}

export default CoinDetailsPage;