import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
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
} from "react-icons/fa";
import TradeModal from "../UserProfile/Components/TradeModal";

// Move TradePanel outside the main component to prevent recreation
const TradePanel = React.memo(
  ({
    className = "",
    buyAmount,
    coinAmount,
    onBuyAmountChange,
    onCoinAmountChange,
    onBuy,
    onSell,
    symbol,
    currentPrice,
  }) => (
    <div
      className={`bg-transparent border border-gray-700 rounded-xl p-4 sm:p-6 fade-in ${className}`}
      style={{ animationDelay: "0.5s" }}
    >
      <h3 className="text-lg sm:text-xl font-semibold text-cyan-400 mb-3 sm:mb-4">
        Trade {symbol?.toUpperCase()}
      </h3>

      <div className="space-y-3 sm:space-y-4">
        {/* USD Amount Input */}
        <div>
          <label className="block text-xs sm:text-sm text-gray-400 mb-2">
            Amount (USD)
          </label>
          <input
            type="number"
            placeholder="0.00"
            value={buyAmount}
            onChange={onBuyAmountChange}
            step="0.01"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
          />
        </div>

        {/* Coin Amount Input */}
        <div>
          <label className="block text-xs sm:text-sm text-gray-400 mb-2">
            Amount ({symbol?.toUpperCase()})
          </label>
          <input
            type="number"
            placeholder="0.000000"
            value={coinAmount}
            onChange={onCoinAmountChange}
            step="0.000001"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
          />
        </div>

        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <button
            onClick={onBuy}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-2 sm:py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm sm:text-base"
          >
            Buy
          </button>
          <button
            onClick={onSell}
            className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white py-2 sm:py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm sm:text-base"
          >
            Sell
          </button>
        </div>

        {/* Current Price Display */}
        {currentPrice !== undefined && currentPrice !== null && (
          <div className="text-center text-xs sm:text-sm text-gray-400 pt-2 border-t border-gray-700">
            Current Price: ${Number(currentPrice).toLocaleString()}
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
  const [buyAmount, setBuyAmount] = useState("");
  const [coinAmount, setCoinAmount] = useState("");

  const { user } = useUserContext();

  // ref to track last user-edited field to avoid feedback loops
  const lastEditedRef = useRef(null); // "usd" | "coin" | null

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

  // Input handlers (mark last edited)
  const handleBuyAmountChange = useCallback((e) => {
    lastEditedRef.current = "usd";
    setBuyAmount(e.target.value);
  }, []);

  const handleCoinAmountChange = useCallback((e) => {
    lastEditedRef.current = "coin";
    setCoinAmount(e.target.value);
  }, []);

  // Sync coin amount when USD amount changes — only if user last edited USD
  useEffect(() => {
    const price = coin?.market_data?.current_price?.usd;
    if (!price) return;

    if (lastEditedRef.current !== "usd") return;

    const amount = parseFloat(buyAmount);
    if (Number.isFinite(amount) && amount > 0) {
      const calculatedCoins = amount / price;
      const currentCoins = parseFloat(coinAmount || "0");
      // update only if meaningful difference
      if (
        !Number.isFinite(currentCoins) ||
        Math.abs(calculatedCoins - currentCoins) > 1e-8
      ) {
        setCoinAmount(calculatedCoins.toFixed(6)); // keep UI precision for coin input
      }
    } else if (buyAmount === "") {
      setCoinAmount("");
    }

    // Clear the flag so programmatic update doesn't trigger the other effect
    lastEditedRef.current = null;
  }, [buyAmount, coin, coinAmount]); // <-- added coinAmount

  // Sync USD amount when coin amount changes — only if user last edited coin input
  useEffect(() => {
    const price = coin?.market_data?.current_price?.usd;
    if (!price) return;

    if (lastEditedRef.current !== "coin") return;

    const coins = parseFloat(coinAmount);
    if (Number.isFinite(coins) && coins > 0) {
      const calculatedUSD = coins * price;
      const currentUSD = parseFloat(buyAmount || "0");
      if (
        !Number.isFinite(currentUSD) ||
        Math.abs(calculatedUSD - currentUSD) > 0.01
      ) {
        setBuyAmount(calculatedUSD.toFixed(2)); // 2 decimals for USD UI
      }
    } else if (coinAmount === "") {
      setBuyAmount("");
    }

    lastEditedRef.current = null;
  }, [coinAmount, coin, buyAmount]); // <-- added buyAmount

  // Fetch chart data (with cancellation) — runs when timeframe, chartType or coinId changes
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

  // Chart options (guard window usage)
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
          formatter: (val) => `$${val?.toLocaleString() || "0"}`,
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

  const [tradeModal, setTradeModal] = useState({
    show: false,
    coin: null,
    type: "buy",
  });

  // Buy / Sell handlers
  const handleBuy = useCallback(() => {
    if (!coin || !user) {
      alert("Please login to buy cryptocurrency");
      return;
    }

    setTradeModal({
      show: true,
      coin: {
        ...coin,
        current_price: coin?.market_data?.current_price?.usd,
        image: coin.image?.large,
      },
      type: "buy",
    });

    // console.log("Buy clicked for:", coin.name, "Amount:", buyAmount, "User ID:", user.id);
    // alert(`Buy order placed for $${buyAmount} (${coinAmount} ${coin.symbol?.toUpperCase()})`);
    setBuyAmount("");
    setCoinAmount("");
  }, [coin, user]);

  const handleSell = useCallback(() => {
    if (!coin || !user) {
      alert("Please login to sell cryptocurrency");
      return;
    }

    setTradeModal({
      show: true,
      coin: {
        ...coin,
        current_price: coin?.market_data?.current_price?.usd,
        image: coin.image?.large,
      },
      type: "sell",
    });
    // console.log("Sell clicked for:", coin.name, "User ID:", user.id);
    // alert(`Sell feature for ${coin.name} - Implement sell logic here`);
  }, [coin, user]);

  const toggleWishlist = useCallback(() => {
    setWishlist((prev) => !prev);
  }, []);

  const formatCurrency = useCallback((value) => {
    if (value === null || value === undefined || isNaN(Number(value)))
      return "$0";
    const num = Number(value);
    return (
      "$" +
      (num >= 1e12
        ? (num / 1e12).toFixed(1) + "T"
        : num >= 1e9
        ? (num / 1e9).toFixed(1) + "B"
        : num >= 1e6
        ? (num / 1e6).toFixed(1) + "M"
        : num.toLocaleString("en-IN"))
    );
  }, []);

  const renderSkeleton = useMemo(
    () => (
      <div className="min-h-screen p-3 xs:p-4 sm:p-6 fade-in">
        {/* Back Button Skeleton */}
        <div className="flex items-center gap-2 mb-6">
          <div className="w-4 h-4 bg-gray-700 rounded animate-pulse"></div>
          <div className="w-20 h-4 bg-gray-700 rounded animate-pulse"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Left Column - Coin Details, Chart & Trade Panel */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Coin Header Skeleton */}
            <div className="bg-transparent border border-gray-700 rounded-xl p-4 sm:p-6">
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
            <div className="bg-transparent border border-gray-700 rounded-xl p-4 sm:p-6">
              <div className="h-60 sm:h-80 bg-gray-700 rounded animate-pulse"></div>
            </div>

            {/* Trade Panel Skeleton - Visible on all screens but positioned differently */}
            <div className="lg:hidden bg-transparent border border-gray-700 rounded-xl p-4 sm:p-6">
              <div className="h-32 sm:h-40 bg-gray-700 rounded animate-pulse"></div>
            </div>
          </div>

          {/* Right Column - About Section & Links */}
          <div className="space-y-4 sm:space-y-6">
            {/* About Section Skeleton */}
            <div className="bg-transparent border border-gray-700 rounded-xl p-4 sm:p-6">
              <div className="h-40 sm:h-60 bg-gray-700 rounded animate-pulse"></div>
            </div>

            {/* Trade Panel Skeleton - Hidden on medium/small, visible on large */}
            <div className="hidden lg:block bg-transparent border border-gray-700 rounded-xl p-4 sm:p-6">
              <div className="h-32 sm:h-40 bg-gray-700 rounded animate-pulse"></div>
            </div>

            {/* Links Skeleton */}
            <div className="bg-transparent border border-gray-700 rounded-xl p-4 sm:p-6">
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
    <div className="min-h-screen p-3 xs:p-4 sm:p-6 fade-in">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 mb-4 sm:mb-6 transition-colors fade-in text-sm sm:text-base"
        style={{ animationDelay: "0.1s" }}
      >
        <FaArrowLeft />
        <span>Back to Coins</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left Column - Coin Details & Chart */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Coin Header Section */}
          <div
            className="bg-transparent border border-gray-700 rounded-xl p-4 sm:p-6 fade-in"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="flex items-start justify-between mb-4 sm:mb-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <img
                  src={coin.image?.large}
                  alt={coin.name}
                  className="w-12 h-12 sm:w-16 sm:h-16 rounded-full"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white truncate">
                      {coin.name}
                    </h1>
                    <span className="text-gray-400 text-sm sm:text-base uppercase bg-gray-800 px-2 py-1 rounded self-start">
                      {coin.symbol}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm mt-1">
                    Rank #{coin.market_cap_rank || "N/A"}
                  </p>
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
                ${coin.market_data?.current_price?.usd?.toLocaleString() || "0"}
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
                },
                {
                  label: "24h Volume",
                  value: formatCurrency(coin.market_data?.total_volume?.usd),
                },
                {
                  label: "Circulating Supply",
                  value: `${
                    coin.market_data?.circulating_supply?.toLocaleString() ||
                    "N/A"
                  } ${coin.symbol?.toUpperCase()}`,
                },
                {
                  label: "Total Supply",
                  value: coin.market_data?.total_supply
                    ? `${coin.market_data.total_supply.toLocaleString()} ${coin.symbol?.toUpperCase()}`
                    : "N/A",
                },
                {
                  label: "Max Supply",
                  value: coin.market_data?.max_supply
                    ? `${coin.market_data.max_supply.toLocaleString()} ${coin.symbol?.toUpperCase()}`
                    : "N/A",
                },
                {
                  label: "All Time High",
                  value: `$${
                    coin.market_data?.ath?.usd?.toLocaleString() || "N/A"
                  }`,
                },
              ].map((stat, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-3 bg-gray-800/30 rounded-lg fade-in"
                  style={{ animationDelay: `${0.3 + index * 0.1}s` }}
                >
                  <span className="text-gray-400 text-xs sm:text-sm">
                    {stat.label}
                  </span>
                  <span className="text-white font-medium text-xs sm:text-sm text-right">
                    {stat.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Price Chart Section */}
          <div
            className="bg-transparent border border-gray-700 rounded-xl p-4 sm:p-6 fade-in"
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
                          ? "bg-cyan-600 text-white shadow-lg"
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
            buyAmount={buyAmount}
            coinAmount={coinAmount}
            onBuyAmountChange={handleBuyAmountChange}
            onCoinAmountChange={handleCoinAmountChange}
            onBuy={handleBuy}
            onSell={handleSell}
            symbol={coin.symbol}
            currentPrice={coin.market_data?.current_price?.usd}
          />
        </div>

        {/* Right Column - About Section, Trade Panel (Large screens) & Links */}
        <div className="space-y-4 sm:space-y-6">
          {/* About Section */}
          {coin.description?.en && (
            <div
              className="bg-transparent border border-gray-700 rounded-xl p-4 sm:p-6 fade-in"
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
            buyAmount={buyAmount}
            coinAmount={coinAmount}
            onBuyAmountChange={handleBuyAmountChange}
            onCoinAmountChange={handleCoinAmountChange}
            onBuy={handleBuy}
            onSell={handleSell}
            symbol={coin.symbol}
            currentPrice={coin.market_data?.current_price?.usd}
          />

          {/* Links Section */}
          <div
            className="bg-transparent border border-gray-700 rounded-xl p-4 sm:p-6 fade-in"
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
                  className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-lg text-sm"
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
                  className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-lg text-sm"
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
                  className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-lg text-sm"
                >
                  <FaExternalLinkAlt className="text-xs" />
                  Community Forum
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
      <TradeModal
        show={tradeModal.show}
        onClose={() => setTradeModal({ show: false, coin: null, type: "buy" })}
        coin={tradeModal.coin}
        type={tradeModal.type}
      />
    </div>
  );
}

export default CoinDetailsPage;
