import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  FaTimes,
  FaExchangeAlt,
  FaWallet,
  FaArrowUp,
  FaArrowDown,
  FaCoins,
  FaMoneyBillWave,
  FaInfoCircle,
} from "react-icons/fa";
import { toast } from "react-toastify";
import useUserContext from "@/Context/UserContext/useUserContext";
import { usePurchasedCoins } from "@/hooks/usePurchasedCoins";
import { useWalletContext } from "@/Context/WalletContext/useWalletContext";

// Utility to check if light mode is active based on global class
const useThemeCheck = () => {
    // Default to checking the document element class list
    const [isLight, setIsLight] = useState(!document.documentElement.classList.contains('dark'));

    useEffect(() => {
        const observer = new MutationObserver(() => {
            setIsLight(!document.documentElement.classList.contains('dark'));
        });

        // Observe changes to the 'class' attribute of the root HTML element
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

        return () => observer.disconnect();
    }, []);

    return isLight;
};

function TradeModal({
  show,
  onClose,
  coin,
  type = "buy",
  showHoldingsInfo = false,
  purchasedCoins = [],
}) {
  const isLight = useThemeCheck(); // 💡 Theme check hook
  const { user } = useUserContext();
  const { balance, refreshBalance } = useWalletContext();
  const { addPurchase, sellCoins, refreshPurchasedCoins } = usePurchasedCoins();

  const [activeTab, setActiveTab] = useState("details");
  const [usdAmount, setUsdAmount] = useState("");
  const [coinAmount, setCoinAmount] = useState("");
  const [slippage, setSlippage] = useState(1.0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);

  // 💡 Theme classes derived from isLight
  const TC = useMemo(() => ({
    // General
    bgModal: isLight ? "bg-white border-gray-300 shadow-xl" : "bg-gray-900 border-gray-700 shadow-xl",
    bgCard: isLight ? "bg-gray-50/70 border-gray-300" : "bg-gray-800/50 border-gray-600",
    textPrimary: isLight ? "text-gray-900" : "text-white",
    textSecondary: isLight ? "text-gray-700" : "text-gray-300",
    textTertiary: isLight ? "text-gray-500" : "text-gray-400",
    // Inputs
    inputBg: isLight ? "bg-white border-gray-300 text-gray-900 placeholder-gray-400" : "bg-gray-800 border-gray-600 text-white placeholder-gray-500",
    // TABS
    bgTabBase: isLight ? "bg-gray-100" : "bg-gray-800/50",
    borderTab: isLight ? "border-gray-300" : "border-gray-700",
    // Header/Active Accent BG
    bgCyanAccent: isLight ? "bg-cyan-100/50 border-cyan-500/80" : "bg-cyan-900/20 border-cyan-500/50",
    bgGreenAccent: isLight ? "bg-green-100/50 border-green-500/80" : "bg-green-900/20 border-green-500/50",
    bgRedAccent: isLight ? "bg-red-100/50 border-red-500/80" : "bg-red-900/20 border-red-500/50",
    // Pills (P&L)
    bgGreenPill: isLight ? "bg-green-100 text-green-700" : "bg-green-500/20 text-green-300",
    bgRedPill: isLight ? "bg-red-100 text-red-700" : "bg-red-500/20 text-red-300",
    // Hover
    hoverBorder: isLight ? "hover:border-cyan-600/50" : "hover:border-cyan-500/50",
  }), [isLight]);
  
  const userHoldings = useMemo(() => {
    if (!coin || !purchasedCoins || purchasedCoins.length === 0) return null;

    const coinId = coin.id || coin.coinId;
    const holding = purchasedCoins.find((pc) => {
      return (
        pc.coin_id === coinId ||
        pc.coinId === coinId ||
        pc.id === coinId ||
        (pc.coin_id && coinId && pc.coin_id.toString() === coinId.toString()) ||
        (pc.coinId && coinId && pc.coinId.toString() === coinId.toString()) ||
        (pc.id && coinId && pc.id.toString() === coinId.toString())
      );
    });

    return holding;
  }, [coin, purchasedCoins, forceUpdate]);

  const hasHoldings = useMemo(() => {
    return (
      userHoldings &&
      (userHoldings.totalQuantity > 0 || userHoldings.quantity > 0)
    );
  }, [userHoldings]);

  const shouldShowHoldingsInfo = showHoldingsInfo || hasHoldings;
  const isBuyOperation = useMemo(
    () => (shouldShowHoldingsInfo ? activeTab === "deposit" : type === "buy"),
    [shouldShowHoldingsInfo, activeTab, type]
  );

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const holdingsSummary = useMemo(() => {
    if (!shouldShowHoldingsInfo || !coin) return null;

    const holdings = userHoldings || {};
    const totalQuantity = holdings.totalQuantity || holdings.quantity || 0;
    const averagePrice =
      holdings.averagePrice ||
      holdings.avgBuyPrice ||
      holdings.coin_price_usd ||
      0;
    const remainingInvestment =
      holdings.remainingInvestment ||
      holdings.total_cost ||
      holdings.totalCost ||
      0;
    const currentValue = totalQuantity * currentPrice;
    const profitLoss = currentValue - remainingInvestment;
    const profitLossPercentage =
      remainingInvestment > 0 ? (profitLoss / remainingInvestment) * 100 : 0;

    return {
      totalQuantity,
      averagePrice,
      remainingInvestment,
      currentValue,
      profitLoss,
      profitLossPercentage,
      coinName: coin.coinName || coin.name,
      coinSymbol: coin.coinSymbol || coin.symbol,
    };
  }, [shouldShowHoldingsInfo, coin, currentPrice, userHoldings]);

  const maxAvailable = useMemo(() => {
    const isSellMode = shouldShowHoldingsInfo
      ? activeTab === "withdraw"
      : type === "sell";
    if (isSellMode && holdingsSummary) {
      return holdingsSummary.totalQuantity || 0;
    }

    if (balance && currentPrice > 0) {
      const maxUSD = balance * 0.95;
      return maxUSD / currentPrice;
    }

    return 0;
  }, [
    shouldShowHoldingsInfo,
    activeTab,
    type,
    holdingsSummary,
    balance,
    currentPrice,
  ]);

  const shouldShowSellAll = useMemo(() => {
    const isSellMode = shouldShowHoldingsInfo
      ? activeTab === "withdraw"
      : type === "sell";
    return isSellMode && holdingsSummary && holdingsSummary.totalQuantity > 0;
  }, [holdingsSummary, shouldShowHoldingsInfo, activeTab, type]);

  useEffect(() => {
    if (show && coin) {
      setUsdAmount("");
      setCoinAmount("");
      setSlippage(1.0);
      setIsSubmitting(false);
      setIsVisible(false);

      setTimeout(() => setIsVisible(true), 10);

      if (shouldShowHoldingsInfo) {
        setActiveTab("details");
      } else {
        setActiveTab(type === "buy" ? "deposit" : "withdraw");
      }

      const price =
        coin.current_price ||
        coin.currentPrice ||
        coin.coinPriceUSD ||
        coin.market_data?.current_price?.usd ||
        0;
      setCurrentPrice(price);
    }
  }, [show, coin, type, shouldShowHoldingsInfo]);

  // Force update when purchased coins change
  useEffect(() => {
    setForceUpdate(prev => prev + 1);
  }, [purchasedCoins]);

  const handleUsdAmountChange = (e) => {
    const value = e.target.value;
    setUsdAmount(value);

    if (value && currentPrice > 0) {
      const amount = parseFloat(value);
      if (!isNaN(amount) && amount > 0) {
        const calculatedCoins = amount / currentPrice;
        setCoinAmount(calculatedCoins.toFixed(8));
      } else {
        setCoinAmount("");
      }
    }
  };

  const handleCoinAmountChange = (e) => {
    const value = e.target.value;
    setCoinAmount(value);

    if (value && currentPrice > 0) {
      const coins = parseFloat(value);
      if (!isNaN(coins) && coins > 0) {
        const calculatedUSD = coins * currentPrice;
        setUsdAmount(calculatedUSD.toFixed(2));
      } else {
        setUsdAmount("");
      }
    }
  };

  const setMaxAmount = () => {
    const maxCoins = maxAvailable;
    if (maxCoins > 0) {
      setCoinAmount(maxCoins.toFixed(8));
      const calculatedUSD = maxCoins * currentPrice;
      setUsdAmount(calculatedUSD.toFixed(2));

      const isSellMode = shouldShowHoldingsInfo
        ? activeTab === "withdraw"
        : type === "sell";
      if (isSellMode) {
        toast.info(
          `Set to maximum: ${maxCoins.toFixed(6)} ${coin.symbol?.toUpperCase()}`
        );
      }
    }
  };

  const handleSellAll = () => {
    if (holdingsSummary && holdingsSummary.totalQuantity > 0) {
      const totalQuantity = holdingsSummary.totalQuantity;
      setCoinAmount(totalQuantity.toFixed(8));
      const calculatedUSD = totalQuantity * currentPrice;
      setUsdAmount(calculatedUSD.toFixed(2));

      toast.success(
        `Filled with entire holdings: ${totalQuantity.toFixed(6)} ${(
          coin.symbol || coin.coinSymbol
        )?.toUpperCase()}`
      );
    } else {
      toast.error("You don't have any holdings to sell");
    }
  };

  const calculateTotal = useMemo(() => {
    if (!usdAmount) return 0;
    const amount = parseFloat(usdAmount);
    return amount.toFixed(2);
  }, [usdAmount]);

  const handleTradeSubmit = useCallback(
    async (tradeData) => {
      if (!user) {
        toast.error("Please login to trade");
        return;
      }

      const { type, symbol, coinAmount, total, coinData } = tradeData;

      try {
        if (type === "buy") {
          if (!coinData) {
            throw new Error("Coin data not found");
          }

          const cryptocurrencyId = coinData.coinId || coinData.id;

          const purchaseData = {
            user_id: user.id,
            coin_id: cryptocurrencyId,
            coin_name: coinData.name || coinData.coinName,
            coin_symbol: coinData.symbol || coinData.coinSymbol,
            coin_price_usd: currentPrice,
            quantity: parseFloat(coinAmount),
            total_cost: parseFloat(total),
            fees: 0,
            image: coinData.image,
          };

          const result = await addPurchase(purchaseData);
          if (result.success) {
            toast.success(
              `✅ Successfully bought ${parseFloat(coinAmount).toFixed(
                6
              )} ${symbol.toUpperCase()}`
            );
            
            // Refresh purchased coins immediately after successful purchase
            if (refreshPurchasedCoins) {
              await refreshPurchasedCoins();
            }
          } else {
            throw new Error(result.error || "Purchase failed");
          }
        } else {
          if (!coinData) {
            throw new Error("Coin data not found");
          }

          const cryptocurrencyId = coinData.coinId || coinData.id;

          const sellData = {
            user_id: user.id,
            coin_id: cryptocurrencyId,
            quantity: parseFloat(coinAmount),
            current_price: parseFloat(currentPrice),
          };

          const result = await sellCoins(sellData);
          if (result.success) {
            toast.success(
              `✅ Successfully sold ${parseFloat(coinAmount).toFixed(
                6
              )} ${symbol.toUpperCase()} for $${result.saleAmount?.toFixed(2)}`
            );
            
            // Refresh purchased coins immediately after successful sale
            if (refreshPurchasedCoins) {
              await refreshPurchasedCoins();
            }
          } else {
            throw new Error(result.error || "Sell failed");
          }
        }

        let retryCount = 0;
        const maxRetries = 3;
        const refreshBalanceWithRetry = async () => {
          try {
            const newBalance = await refreshBalance();
            return newBalance;
          } catch (error) {
            retryCount++;
            if (retryCount < maxRetries) {
              await new Promise((resolve) => setTimeout(resolve, 500));
              return refreshBalanceWithRetry();
            } else {
              throw error;
            }
          }
        };

        await refreshBalanceWithRetry();

        // Force update to refresh the holdings display
        setForceUpdate(prev => prev + 1);

      } catch (error) {
        console.error("Trade execution error:", error);
        throw error;
      }
    },
    [
      user,
      addPurchase,
      sellCoins,
      currentPrice,
      refreshBalance,
      refreshPurchasedCoins,
    ]
  );

  const handleSubmit = async () => {
    if (!coin || !usdAmount || parseFloat(usdAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    const isSellMode = shouldShowHoldingsInfo
      ? activeTab === "withdraw"
      : type === "sell";
    if (isSellMode) {
      const quantity = parseFloat(coinAmount);
      const availableQuantity = holdingsSummary?.totalQuantity || 0;

      if (quantity <= 0) {
        toast.error("Please enter a valid amount to sell");
        return;
      }

      if (quantity > availableQuantity) {
        toast.error(
          `You only have ${availableQuantity.toFixed(6)} ${(
            coin.symbol || coin.coinSymbol
          )?.toUpperCase()} available`
        );
        return;
      }

      if (quantity < 0.000001) {
        toast.error("Minimum sell amount is 0.000001");
        return;
      }

      if (!holdingsSummary || availableQuantity === 0) {
        toast.error(
          "No holdings found for this coin. Please refresh and try again."
        );
        return;
      }
    }

    const isBuyMode = shouldShowHoldingsInfo
      ? activeTab === "deposit"
      : type === "buy";
    if (isBuyMode) {
      const quantity = parseFloat(coinAmount);
      if (quantity > maxAvailable) {
        toast.error("Insufficient balance for this purchase");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const tradeType = shouldShowHoldingsInfo
        ? activeTab === "deposit"
          ? "buy"
          : "sell"
        : type;

      await handleTradeSubmit({
        type: tradeType,
        coin: coin.name || coin.coinName,
        symbol: coin.symbol || coin.coinSymbol,
        usdAmount: parseFloat(usdAmount),
        coinAmount: parseFloat(coinAmount),
        slippage,
        total: parseFloat(calculateTotal),
        coinData: coin,
      });

      // Don't close immediately, let user see the updated holdings
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (error) {
      console.error("Trade error:", error);
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Trade failed. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!show || !coin) return null;

  const symbol = coin.symbol?.toUpperCase() || coin.coinSymbol?.toUpperCase();
  const coinName = coin.name || coin.coinName;
  
  // Dynamic header accent classes
  const headerAccentClass = (() => {
    if (shouldShowHoldingsInfo && activeTab === "details") return TC.bgCyanAccent;
    if (isBuyOperation) return TC.bgGreenAccent;
    return TC.bgRedAccent;
  })();

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      onClick={handleBackdropClick}
    >
      <div className={`${TC.bgModal} rounded-xl w-full max-w-md mx-4 max-h-[90vh] overflow-hidden transition-all duration-300 ${
        isVisible ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4"
      }`}>
        {/* Header */}
        <div
          className={`relative flex items-center justify-between p-4 border-b transition-all duration-300 ${headerAccentClass}`}
        >
          <div className="flex items-center gap-3">
            <div className="relative group">
              <img
                src={coin.image}
                alt={coinName}
                className={`w-10 h-10 rounded-full border-2 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 ${isLight ? "border-gray-300" : "border-gray-600"}`}
              />
              <div
                className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 ${isLight ? "border-white" : "border-gray-900"} transition-all duration-300 ${
                  shouldShowHoldingsInfo && activeTab === "details"
                    ? "bg-cyan-500 animate-pulse"
                    : isBuyOperation
                    ? "bg-green-500 animate-pulse"
                    : "bg-red-500 animate-pulse"
                }`}
              ></div>
            </div>
            <div className="fade-in">
              <h2 className={`text-lg font-bold ${TC.textPrimary}`}>
                {shouldShowHoldingsInfo ? (
                  <>
                    {coinName}
                    <span className="text-cyan-600 ml-1 text-sm">
                      ({symbol})
                    </span>
                  </>
                ) : (
                  <>
                    <span
                      className={
                        isBuyOperation ? "text-green-600" : "text-red-600"
                      }
                    >
                      {isBuyOperation ? "Deposit" : "Withdraw"}
                    </span>{" "}
                    {symbol}
                  </>
                )}
              </h2>
              <p className={`${TC.textSecondary} text-xs flex items-center gap-1 mt-1`}>
                <FaMoneyBillWave className="text-yellow-500 " />
                <span className="font-semibold">
                  $
                  {currentPrice.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: currentPrice < 1 ? 6 : 2,
                  })}
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className={`transition-all duration-200 p-1 rounded-lg hover:rotate-90 transform group ${isLight ? "text-gray-500 hover:text-red-600 hover:bg-red-100" : "text-gray-400 hover:text-white hover:bg-red-500/20"}`}
          >
            <FaTimes className="text-lg group-hover:scale-110 transition-transform" />
          </button>
        </div>

        {/* Navigation Tabs */}
        {shouldShowHoldingsInfo && (
          <div className={`${TC.bgTabBase} border-b ${TC.borderTab}`}>
            <div className="flex">
              {[
                { key: "details", label: "Holdings", icon: FaCoins, color: "cyan", text: "text-cyan-600" },
                { key: "deposit", label: "Deposit", icon: FaArrowUp, color: "green", text: "text-green-600" },
                { key: "withdraw", label: "Withdraw", icon: FaArrowDown, color: "red", text: "text-red-600" },
              ].map((tab) => {
                const Icon = tab.icon;
                const tabIsActive = activeTab === tab.key;
                const tabClasses = tabIsActive
                  ? `${tab.text} ${isLight ? "bg-cyan-500/10" : "bg-cyan-500/10"}` // Reused opacity is fine
                  : `${TC.textTertiary} hover:${TC.textPrimary}`;

                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex-1 py-3 px-2 text-sm font-bold transition-all relative group ${tabClasses}`}
                  >
                    <div className="flex items-center justify-center gap-1">
                      <Icon className={`text-sm transition-all duration-300 ${
                        tabIsActive ? "animate-bounce" : "group-hover:scale-110 group-hover:-translate-y-0.5"
                      }`} />
                      {tab.label}
                    </div>
                    {tabIsActive && (
                      <div
                        className={`absolute bottom-0 left-0 right-0 h-0.5 transition-all duration-300 ${
                          tab.key === "details" ? "bg-cyan-600" :
                          tab.key === "deposit" ? "bg-green-600" :
                          "bg-red-600"
                        }`}
                      ></div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Holdings Summary */}
          {shouldShowHoldingsInfo && holdingsSummary && (
            <div className={`mb-4 p-4 rounded-lg border glow-fade transition-all duration-300 ${
              activeTab === "details" 
                ? "bg-cyan-500/10 border-cyan-500/30" 
                : `${TC.bgCard}`
            }`}>
              <h3 className={`text-sm font-bold mb-3 flex items-center gap-2 ${isLight ? "text-cyan-700" : "text-cyan-400"}`}>
                <FaCoins className="text-yellow-500 " />
                Holdings Summary
              </h3>

              <div className="grid grid-cols-2 gap-3 mb-3">
                {[
                  { label: "Quantity", value: holdingsSummary.totalQuantity.toFixed(6), suffix: symbol },
                  { label: "Current Value", value: `$${holdingsSummary.currentValue.toLocaleString("en-IN", {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, suffix: "USD" },
                  { label: "Avg. Price", value: `$${holdingsSummary.averagePrice.toLocaleString("en-IN", {minimumFractionDigits: 2, maximumFractionDigits: holdingsSummary.averagePrice < 1 ? 6 : 2})}`, suffix: "" },
                  { label: "Investment", value: `$${holdingsSummary.remainingInvestment.toLocaleString("en-IN", {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, suffix: "" }
                ].map((item, index) => (
                  <div key={index} className={`rounded-lg p-2 border fade-in hover:scale-105 transition-all duration-300 ${TC.bgCard}`} style={{animationDelay: `${index * 100}ms`}}>
                    <div className={`text-xs mb-1 ${TC.textTertiary}`}>{item.label}</div>
                    <div className={`text-sm font-bold ${TC.textPrimary}`}>{item.value}</div>
                    <div className="text-xs text-cyan-600">{item.suffix}</div>
                  </div>
                ))}
              </div>

              {/* Profit/Loss Section */}
              <div
                className={`p-3 rounded-lg border transition-all duration-300 hover:scale-105 ${
                  holdingsSummary.profitLoss >= 0
                    ? `${isLight ? "bg-green-100/50 border-green-500/50" : "bg-green-500/10 border-green-500/30"}`
                    : `${isLight ? "bg-red-100/50 border-red-500/50" : "bg-red-500/10 border-red-500/30"}`
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className={`text-sm font-semibold ${TC.textSecondary}`}>
                    Total P&L
                  </span>
                  <div
                    className={`flex items-center gap-2 ${
                      holdingsSummary.profitLoss >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {holdingsSummary.profitLoss >= 0 ? (
                      <FaArrowUp className="text-sm animate-bounce" />
                    ) : (
                      <FaArrowDown className="text-sm animate-bounce" />
                    )}
                    <span className="text-base font-bold">
                      $
                      {Math.abs(holdingsSummary.profitLoss).toLocaleString(
                        "en-IN",
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }
                      )}
                    </span>
                    <span
                      className={`text-xs font-bold px-2 py-1 rounded-full ${
                        holdingsSummary.profitLoss >= 0
                          ? TC.bgGreenPill
                          : TC.bgRedPill
                      }`}
                    >
                      {holdingsSummary.profitLoss >= 0 ? "+" : ""}
                      {holdingsSummary.profitLossPercentage.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Transaction Form */}
          {(!shouldShowHoldingsInfo || activeTab !== "details") && (
            <div className="space-y-4 fade-in">
              {/* Amount Inputs */}
              <div className="grid grid-cols-2 gap-3">
                <div className="glow-fade" style={{animationDelay: "100ms"}}>
                  <label className={`flex text-xs font-semibold mb-2 items-center gap-1 ${TC.textSecondary}`}>
                    <FaCoins className="text-yellow-500" />
                    Amount ({symbol})
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="0.000000"
                      value={coinAmount}
                      onChange={handleCoinAmountChange}
                      step="0.000001"
                      min="0.000001"
                      className={`w-full border rounded-lg pl-3 pr-20 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:border-cyan-600 text-sm font-semibold transition-all duration-300 ${TC.inputBg}`}
                    />
                    <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex gap-1">
                      {shouldShowSellAll && (
                        <button
                          onClick={handleSellAll}
                          className="bg-purple-600 hover:bg-purple-700 text-white px-2 py-1 rounded text-xs font-bold transition-all duration-200 flex items-center gap-1 hover:scale-110 group shadow-md"
                          title="Sell All Holdings"
                        >
                          <FaCoins className="text-xs group-hover:rotate-12 transition-transform" />
                          ALL
                        </button>
                      )}
                      <button
                        onClick={setMaxAmount}
                        className="bg-cyan-600 hover:bg-cyan-700 text-white px-2 py-1 rounded text-xs font-bold transition-all duration-200 hover:scale-110 group shadow-md"
                      >
                        <span className="group-hover:scale-110 inline-block transition-transform">MAX</span>
                      </button>
                    </div>
                  </div>
                </div>
                <div className="glow-fade" style={{animationDelay: "200ms"}}>
                  <label className={`flex text-xs font-semibold mb-2 items-center gap-1 ${TC.textSecondary}`}>
                    <FaMoneyBillWave className="text-green-600" />
                    Amount (USD)
                  </label>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={usdAmount}
                    onChange={handleUsdAmountChange}
                    className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:border-cyan-600 text-sm font-semibold transition-all duration-300 ${TC.inputBg}`}
                  />
                </div>
              </div>

              {/* Available Balance Info */}
              <div className={`flex justify-between items-center text-xs rounded-lg px-3 py-2 border glow-fade hover:border-cyan-600/50 transition-all duration-300 ${TC.bgCard}`} style={{animationDelay: "300ms"}}>
                <div className="flex items-center gap-1">
                  <FaInfoCircle className="text-cyan-600 text-xs animate-pulse" />
                  <span className={`${TC.textSecondary}`}>
                    Available:{" "}
                    <span className={`${TC.textPrimary} font-bold`}>
                      {maxAvailable.toFixed(6)}
                    </span>{" "}
                    {symbol}
                  </span>
                </div>
                <span className={`${TC.textTertiary}`}>
                  ≈{" "}
                  <span className={`${TC.textPrimary} font-bold`}>
                    $
                    {(
                      parseFloat(coinAmount || 0) * currentPrice
                    ).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </span>
              </div>

              {/* Trading Details */}
              <div className={`p-3 rounded-lg border space-y-3 glow-fade transition-all duration-300 ${TC.bgCard} ${TC.hoverBorder}`} style={{animationDelay: "400ms"}}>
                <h4 className={`text-sm font-bold mb-2 flex items-center gap-2 ${TC.textSecondary}`}>
                  <FaExchangeAlt className="text-cyan-600 animate-pulse" />
                  Transaction Details
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className={`text-xs ${TC.textTertiary}`}>
                      Price per {symbol}
                    </span>
                    <span className={`text-sm font-bold ${TC.textPrimary}`}>
                      $
                      {currentPrice.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: currentPrice < 1 ? 6 : 2,
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`text-xs ${TC.textTertiary}`}>
                      Slippage Tolerance
                    </span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={slippage}
                        onChange={(e) =>
                          setSlippage(parseFloat(e.target.value) || 1.0)
                        }
                        step="0.1"
                        min="0.1"
                        max="5"
                        className={`w-16 border rounded px-2 py-1 text-xs text-center focus:outline-none focus:ring-2 focus:ring-cyan-600 font-semibold transition-all duration-300 ${isLight ? "bg-gray-200 border-gray-300 text-gray-900" : "bg-gray-700 border-gray-600 text-white"}`}
                      />
                      <span className={`${TC.textTertiary} text-xs`}>%</span>
                    </div>
                  </div>
                  <div className={`border-t ${isLight ? "border-gray-300" : "border-gray-600"} pt-2 mt-1`}>
                    <div className="flex justify-between items-center">
                      <span className={`text-sm font-bold ${TC.textSecondary}`}>
                        Total {isBuyOperation ? "Cost" : "You Receive"}
                      </span>
                      <span
                        className={`text-lg font-bold ${
                          isBuyOperation ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        ${calculateTotal}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={handleSubmit}
                disabled={
                  !usdAmount ||
                  parseFloat(usdAmount) <= 0 ||
                  parseFloat(coinAmount) <= 0 ||
                  isSubmitting
                }
                className={`w-full py-2 px-4 font-bold text-sm rounded-lg 
                            transition-all duration-300 
                            disabled:opacity-50 disabled:cursor-not-allowed 
                            flex items-center justify-center gap-2 
                            hover:scale-105 group glow-fade shadow-md
                            ${
                              isBuyOperation
                                ? "bg-green-600 hover:bg-green-700 text-white"
                                : "bg-red-600 hover:bg-red-700 text-white"
                            }`}
                style={{ animationDelay: "500ms" }}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <FaExchangeAlt
                      className={`text-sm transition-all duration-300 ${
                        isBuyOperation ? "group-hover:rotate-180" : "group-hover:-rotate-180"
                      }`}
                    />
                    <span>{isBuyOperation ? "Deposit" : "Withdraw"} {symbol}</span>

                    {isBuyOperation ? (
                      <FaArrowUp className="text-sm transition-transform duration-300 group-hover:-translate-y-1" />
                    ) : (
                      <FaArrowDown className="text-sm transition-transform duration-300 group-hover:translate-y-1" />
                    )}
                  </>
                )}
              </button>

              {/* Help Text */}
              <div className={`flex items-center gap-2 text-xs rounded px-2 py-1 border glow-fade ${TC.bgCard} ${TC.hoverBorder} transition-all duration-300`} style={{animationDelay: "600ms"}}>
                <FaInfoCircle className="text-cyan-600 flex-shrink-0 text-xs animate-pulse" />
                <span className={TC.textTertiary}>
                  {isBuyOperation
                    ? "You'll receive the coins instantly after purchase confirmation."
                    : "Funds will be credited to your wallet immediately after sale."}
                </span>
              </div>
            </div>
          )}

          {/* Quick Actions for Details Tab */}
          {shouldShowHoldingsInfo && activeTab === "details" && (
            <div className="space-y-3">
              <div className={`p-3 rounded-lg border glow-fade ${TC.bgCard}`} style={{animationDelay: "200ms"}}>
                <h3 className={`text-sm font-bold mb-3 flex items-center gap-2 ${TC.textSecondary}`}>
                  <FaWallet className="text-green-600 animate-pulse" />
                  Quick Actions
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setActiveTab("deposit")}
                    className="py-2 px-3 bg-green-600 hover:bg-green-700 text-white 
                               rounded-lg transition-all duration-300 font-bold 
                               flex flex-col items-center gap-1 shadow-md
                               hover:scale-105 group"
                  >
                    <FaArrowUp className="text-lg group-hover:-translate-y-1 transition-transform duration-300" />
                    <span className="text-xs">Deposit</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("withdraw")}
                    className="py-2 px-3 bg-red-600 hover:bg-red-700 text-white 
                               rounded-lg transition-all duration-300 font-bold 
                               flex flex-col items-center gap-1 shadow-md
                               hover:scale-105 group"
                  >
                    <FaArrowDown className="text-lg group-hover:translate-y-1 transition-transform duration-300" />
                    <span className="text-xs">Withdraw</span>
                  </button>
                </div>
              </div>

              {/* Market Info Card */}
              <div className={`p-3 rounded-lg border glow-fade ${TC.bgCard} ${TC.hoverBorder} transition-all duration-300`} style={{animationDelay: "300ms"}}>
                <div className={`flex items-center gap-2 text-xs mb-2 ${TC.textTertiary}`}>
                  <FaInfoCircle className="text-cyan-600 animate-pulse" />
                  <span className="font-semibold">Market Information</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="fade-in" style={{animationDelay: "400ms"}}>
                    <span className={TC.textTertiary}>Current Price</span>
                    <div className={`${TC.textPrimary} font-bold mt-1`}>
                      $
                      {currentPrice.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: currentPrice < 1 ? 6 : 2,
                      })}
                    </div>
                  </div>
                  <div className="fade-in" style={{animationDelay: "500ms"}}>
                    <span className={TC.textTertiary}>Your Avg. Price</span>
                    <div className={`${TC.textPrimary} font-bold mt-1`}>
                      $
                      {holdingsSummary?.averagePrice.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits:
                          holdingsSummary?.averagePrice < 1 ? 6 : 2,
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`p-3 border-t ${TC.borderTab} ${TC.bgCard}`}>
          <div className="flex items-center justify-between text-xs">
            <div className={`flex items-center gap-1 ${TC.textTertiary}`}>
              <FaInfoCircle className="text-cyan-600 text-xs animate-pulse" />
              <span>Live prices • Updated every 60s</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></div>
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full absolute"></div>
              <span className="text-green-600 font-bold ml-1">Real-time</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TradeModal;