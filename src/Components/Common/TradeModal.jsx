import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import useUserContext from "@/Context/UserContext/useUserContext";
import { usePurchasedCoins } from "@/hooks/usePurchasedCoins";
import { useWalletContext } from "@/Context/WalletContext/useWalletContext";
import api from "@/api/axiosConfig";

// Sub-components
import TradeModalHeader from "../TradeModal/TradeModalHeader";
import TradeModalTabs from "../TradeModal/TradeModalTabs";
import HoldingsInfo from "../TradeModal/HoldingsInfo";
import HoldingsActions from "../TradeModal/HoldingsActions";
import TransactionForm from "../TradeModal/TransactionForm";
import PurchaseSuccessModal from "./PurchaseSuccessModal";

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

function TradeModal({
  show,
  onClose,
  coin,
  type = "buy",
  showHoldingsInfo = false,
  purchasedCoins = [],
  initialAlertMode = false,
}) {
  const isLight = useThemeCheck();
  const { user } = useUserContext();
  const { balance, refreshBalance } = useWalletContext();
  const { addPurchase, sellCoins, refreshPurchasedCoins } = usePurchasedCoins();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("details");
  const [usdAmount, setUsdAmount] = useState("");
  const [coinAmount, setCoinAmount] = useState("");
  const [slippage, setSlippage] = useState(1.0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);
  const [successData, setSuccessData] = useState(null);

  // Limit/Stop Order State
  const [orderType, setOrderType] = useState("market"); // 'market', 'limit', 'stop_limit'
  const [limitPrice, setLimitPrice] = useState("");
  const [stopPrice, setStopPrice] = useState("");

  // Alert State
  const [isAlertMode, setIsAlertMode] = useState(initialAlertMode || false);
  const [alertTargetPrice, setAlertTargetPrice] = useState("");

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

  // 💡 Theme classes derived from isLight and Operation Type
  const TC = useMemo(
    () => ({
      // General
      bgModal: isLight
        ? "bg-white/95 backdrop-blur-2xl border border-white/20 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]"
        : "bg-[#0B0E14]/95 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)]",
      bgCard: isLight
        ? "bg-white/60 border border-gray-200 shadow-sm backdrop-blur-sm"
        : "bg-gray-800/40 border border-white/5 shadow-inner backdrop-blur-sm",
      textPrimary: isLight ? "text-gray-900" : "text-white",
      textSecondary: isLight ? "text-gray-600" : "text-gray-300",
      textTertiary: isLight ? "text-gray-500" : "text-gray-500",

      // Inputs - Dynamic based on Buy/Sell
      inputBg: isLight
        ? `bg-gray-50 border-gray-200 focus:bg-white focus:border-${
            isBuyOperation ? "emerald" : "red"
          }-500 focus:ring-4 focus:ring-${
            isBuyOperation ? "emerald" : "red"
          }-500/10 text-gray-900 placeholder-gray-400 shadow-inner`
        : `bg-gray-900/50 border-gray-700 focus:bg-gray-900 focus:border-${
            isBuyOperation ? "emerald" : "red"
          }-500 focus:ring-4 focus:ring-${
            isBuyOperation ? "emerald" : "red"
          }-500/10 text-white placeholder-gray-600 shadow-inner`,

      // TABS
      bgTabBase: isLight
        ? "bg-gray-50/80 backdrop-blur-sm"
        : "bg-gray-900/50 backdrop-blur-sm",
      borderTab: isLight ? "border-gray-200" : "border-gray-800",

      // Header/Active Accent BG
      bgCyanAccent: isLight
        ? "bg-gradient-to-r from-cyan-50 to-blue-50 border-b border-cyan-100"
        : "bg-gradient-to-r from-cyan-900/20 to-blue-900/20 border-b border-cyan-500/20",
      bgGreenAccent: isLight
        ? "bg-gradient-to-r from-emerald-50 to-green-50 border-b border-emerald-100"
        : "bg-gradient-to-r from-emerald-900/20 to-green-900/20 border-b border-emerald-500/20",
      bgRedAccent: isLight
        ? "bg-gradient-to-r from-red-50 to-rose-50 border-b border-red-100"
        : "bg-gradient-to-r from-red-900/20 to-rose-900/20 border-b border-red-500/20",

      // Pills (P&L)
      bgGreenPill: isLight
        ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
        : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
      bgRedPill: isLight
        ? "bg-red-100 text-red-700 border border-red-200"
        : "bg-red-500/20 text-red-400 border border-red-500/30",

      // Hover
      hoverBorder: isLight
        ? `hover:border-${
            isBuyOperation ? "emerald" : "red"
          }-400 transition-colors duration-300`
        : `hover:border-${
            isBuyOperation ? "emerald" : "red"
          }-500/50 transition-colors duration-300`,
    }),
    [isLight, isBuyOperation]
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

  const effectivePrice = useMemo(() => {
    return (orderType === "limit" || orderType === "stop_limit") && limitPrice ? parseFloat(limitPrice) : currentPrice;
  }, [orderType, limitPrice, currentPrice]);

  const maxAvailable = useMemo(() => {
    const isSellMode = shouldShowHoldingsInfo
      ? activeTab === "withdraw"
      : type === "sell";
    if (isSellMode && holdingsSummary) {
      return holdingsSummary.totalQuantity || 0;
    }

    if (balance && effectivePrice > 0) {
      const maxUSD = balance * 0.95;
      return maxUSD / effectivePrice;
    }

    return 0;
  }, [
    shouldShowHoldingsInfo,
    activeTab,
    type,
    holdingsSummary,
    balance,
    effectivePrice,
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
      setSuccessData(null);
      setIsAlertMode(initialAlertMode || false);

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
      setLimitPrice(price); // Default limit price to current price
      setStopPrice(price);
      setOrderType("market");
      setIsAlertMode(false);
      setAlertTargetPrice(price);
    }
  }, [show, coin, type, shouldShowHoldingsInfo]);

  // Force update when purchased coins change
  useEffect(() => {
    setForceUpdate((prev) => prev + 1);
  }, [purchasedCoins]);



  const handleUsdAmountChange = (e) => {
    const value = e.target.value;
    setUsdAmount(value);

    if (value && effectivePrice > 0) {
      const amount = parseFloat(value);
      if (!isNaN(amount) && amount > 0) {
        const calculatedCoins = amount / effectivePrice;
        setCoinAmount(calculatedCoins.toFixed(8));
      } else {
        setCoinAmount("");
      }
    }
  };

  const handleCoinAmountChange = (e) => {
    const value = e.target.value;
    setCoinAmount(value);

    if (value && effectivePrice > 0) {
      const coins = parseFloat(value);
      if (!isNaN(coins) && coins > 0) {
        const calculatedUSD = coins * effectivePrice;
        setUsdAmount(calculatedUSD.toFixed(2));
      } else {
        setUsdAmount("");
      }
    }
  };

  const handleLimitPriceChange = (e) => {
    const value = e.target.value;
    setLimitPrice(value);
    
    // Update USD amount based on new price and existing coin amount
    if (coinAmount && value > 0) {
        const price = parseFloat(value);
        const calculatedUSD = parseFloat(coinAmount) * price;
        setUsdAmount(calculatedUSD.toFixed(2));
    }
  };

  const setMaxAmount = () => {
    const maxCoins = maxAvailable; // Note: maxAvailable logic might need adjustment for Limit Buy (USD balance / limitPrice)
    if (maxCoins > 0) {
      setCoinAmount(maxCoins.toFixed(8));
      const calculatedUSD = maxCoins * effectivePrice;
      setUsdAmount(calculatedUSD.toFixed(2));
// ... rest of setMaxAmount

      const isSellMode = shouldShowHoldingsInfo
        ? activeTab === "withdraw"
        : type === "sell";
      if (isSellMode) {
        toast.success(
          `Set to maximum: ${maxCoins.toFixed(6)} ${coin.symbol?.toUpperCase()}`,
          {
            className: "!p-3 md:!p-4 !text-xs md:!text-sm font-semibold",
            style: {
              background: "#DCFCE7",
              color: "#166534",
              boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
              borderRadius: "8px",
              border: "none",
            },
            iconTheme: { primary: "#16A34A", secondary: "#FFFFFF" },
          }
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
        )?.toUpperCase()}`,
        {
          className: "!p-3 md:!p-4 !text-xs md:!text-sm font-semibold",
          style: {
            background: "#DCFCE7",
            color: "#166534",
            boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
            borderRadius: "8px",
            border: "none",
          },
          iconTheme: { primary: "#16A34A", secondary: "#FFFFFF" },
        }
      );
    } else {
      toast.error("You don't have any holdings to sell", {
        className: "!p-3 md:!p-4 !text-xs md:!text-sm font-semibold",
        style: {
          background: "#FEE2E2",
          color: "#991B1B",
          boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
          borderRadius: "8px",
          border: "none",
        },
        iconTheme: { primary: "#DC2626", secondary: "#FFFFFF" },
      });
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
        toast.error("Please login to trade", {
          className: "!p-3 md:!p-4 !text-xs md:!text-sm font-semibold",
          style: {
            background: "#FEE2E2",
            color: "#991B1B",
            boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
            borderRadius: "8px",
            border: "none",
          },
          iconTheme: { primary: "#DC2626", secondary: "#FFFFFF" },
        });
        return;
      }

      const { type, symbol, coinAmount, total, coinData } = tradeData;

      try {
        // ALERT LOGIC
        if (isAlertMode) {
            const condition = parseFloat(alertTargetPrice) > currentPrice ? 'above' : 'below';
            const alertData = {
                user_id: user.id,
                coin_id: coinData.coinId || coinData.id,
                coin_symbol: symbol,
                coin_name: coinData.name || coinData.coinName,
                coin_image: coinData.image,
                target_price: parseFloat(alertTargetPrice),
                condition
            };

            const res = await api.post("/alerts/create", alertData);
            if (res.data.success) {
                toast.success(`Alert Set: ${symbol.toUpperCase()} ${condition} $${parseFloat(alertTargetPrice).toFixed(2)}`, {
                    className: "!p-3 md:!p-4 !text-xs md:!text-sm font-semibold",
                    style: {
                      background: "#DCFCE7",
                      color: "#166534",
                      boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
                      borderRadius: "8px",
                      border: "none",
                    },
                    iconTheme: { primary: "#16A34A", secondary: "#FFFFFF" },
                });
                handleClose();
                return;
            } else {
                throw new Error("Failed to create alert");
            }
        }

        // LIMIT & STOP ORDER LOGIC
        if (orderType === "limit" || orderType === "stop_limit") {
            const orderData = {
                user_id: user.id,
                coin_id: coinData.coinId || coinData.id,
                coin_symbol: symbol,
                coin_name: coinData.name || coinData.coinName,
                coin_image: coinData.image,
                type: type, // 'buy' or 'sell'
                category: orderType, // 'limit' or 'stop_limit'
                limit_price: parseFloat(limitPrice),
                stop_price: orderType === 'stop_limit' ? parseFloat(stopPrice) : undefined,
                quantity: parseFloat(coinAmount)
            };

            const res = await api.post("/orders/create", orderData);
            
            if (res.data.success) {
                toast.success(`${orderType === 'stop_limit' ? 'Stop-Limit' : 'Limit'} Order Placed Successfully!`);
                setSuccessData({
                    ...orderData,
                    price: parseFloat(limitPrice),
                    total: parseFloat(coinAmount) * parseFloat(limitPrice),
                    newBalance: res.data.newBalance
                });
                refreshBalance();
                refreshPurchasedCoins();
                handleClose();
                return;
            } else {
                throw new Error(res.data.error || "Failed to create order");
            }
        } else {
            // MARKET ORDER LOGIC
            if (isBuyOperation) {
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
                        `Successfully bought ${parseFloat(coinAmount).toFixed(6)} ${symbol.toUpperCase()}`,
                        {
                            className: "!p-3 md:!p-4 !text-xs md:!text-sm font-semibold",
                            style: {
                                background: "#DCFCE7",
                                color: "#166534",
                                boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
                                borderRadius: "8px",
                                border: "none",
                            },
                            iconTheme: {
                                primary: "#16A34A",
                                secondary: "#FFFFFF",
                            },
                        }
                    );

                    if (refreshPurchasedCoins) {
                        await refreshPurchasedCoins();
                    }
                } else {
                    throw new Error(result.error || "Purchase failed");
                }
            } else {
          // SELL LOGIC
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
              `Successfully sold ${parseFloat(coinAmount).toFixed(
                6
              )} ${symbol.toUpperCase()}`,
              {
                className: "!p-3 md:!p-4 !text-xs md:!text-sm font-semibold",
                style: {
                  background: "#DCFCE7",
                  color: "#166534",
                  boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
                  borderRadius: "8px",
                  border: "none",
                },
                iconTheme: {
                  primary: "#16A34A",
                  secondary: "#FFFFFF",
                },
              }
            );

            if (refreshPurchasedCoins) {
              await refreshPurchasedCoins();
            }
          } else {
            throw new Error(result.error || "Sell failed");
          }
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
        setForceUpdate((prev) => prev + 1);
      } catch (error) {
        console.error("Trade execution error:", error);
        const errorMessage =
          error.response?.data?.error ||
          error.message ||
          "Trade failed. Please try again.";
        toast.error(errorMessage, {
          className: "!p-3 md:!p-4 !text-xs md:!text-sm font-semibold",
          style: {
            background: "#FEE2E2",
            color: "#991B1B",
            boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
            borderRadius: "8px",
            border: "none",
          },
          iconTheme: { primary: "#DC2626", secondary: "#FFFFFF" },
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      user,
      addPurchase,
      sellCoins,
      currentPrice,
      refreshBalance,
      refreshPurchasedCoins,
      orderType,
      limitPrice,
      stopPrice,
      isAlertMode,
      alertTargetPrice
    ]
  );

  const handleSubmit = async () => {
    if (!coin || !usdAmount || parseFloat(usdAmount) <= 0) {
      toast.error("Please enter a valid amount", {
        className: "!p-3 md:!p-4 !text-xs md:!text-sm font-semibold",
        style: {
          background: "#FEE2E2",
          color: "#991B1B",
          boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
          borderRadius: "8px",
          border: "none",
        },
        iconTheme: { primary: "#DC2626", secondary: "#FFFFFF" },
      });
      return;
    }

    const isSellMode = shouldShowHoldingsInfo
      ? activeTab === "withdraw"
      : type === "sell";
    if (isSellMode) {
      const quantity = parseFloat(coinAmount);
      const availableQuantity = holdingsSummary?.totalQuantity || 0;

      if (quantity <= 0) {
        toast.error("Please enter a valid amount to sell", {
          className: "!p-3 md:!p-4 !text-xs md:!text-sm font-semibold",
          style: {
            background: "#FEE2E2",
            color: "#991B1B",
            boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
            borderRadius: "8px",
            border: "none",
          },
          iconTheme: { primary: "#DC2626", secondary: "#FFFFFF" },
        });
        return;
      }

      if (quantity > availableQuantity) {
        toast.error(
          `You only have ${availableQuantity.toFixed(6)} ${(
            coin.symbol || coin.coinSymbol
          )?.toUpperCase()} available`,
          {
            className: "!p-3 md:!p-4 !text-xs md:!text-sm font-semibold",
            style: {
              background: "#FEE2E2",
              color: "#991B1B",
              boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
              borderRadius: "8px",
              border: "none",
            },
            iconTheme: { primary: "#DC2626", secondary: "#FFFFFF" },
          }
        );
        return;
      }

      if (quantity < 0.000001) {
        toast.error("Minimum sell amount is 0.000001", {
          className: "!p-3 md:!p-4 !text-xs md:!text-sm font-semibold",
          style: {
            background: "#FEE2E2",
            color: "#991B1B",
            boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
            borderRadius: "8px",
            border: "none",
          },
          iconTheme: { primary: "#DC2626", secondary: "#FFFFFF" },
        });
        return;
      }

      if (!holdingsSummary || availableQuantity === 0) {
        toast.error(
          "No holdings found for this coin. Please refresh and try again.",
          {
            className: "!p-3 md:!p-4 !text-xs md:!text-sm font-semibold",
            style: {
              background: "#FEE2E2",
              color: "#991B1B",
              boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
              borderRadius: "8px",
              border: "none",
            },
            iconTheme: { primary: "#DC2626", secondary: "#FFFFFF" },
          }
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
        toast.error("Insufficient balance for this purchase", {
          className: "!p-3 md:!p-4 !text-xs md:!text-sm font-semibold",
          style: {
            background: "#FEE2E2",
            color: "#991B1B",
            boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
            borderRadius: "8px",
            border: "none",
          },
          iconTheme: { primary: "#DC2626", secondary: "#FFFFFF" },
        });
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

      // Check if this is the first purchase for this coin
      const isFirstPurchase = !userHoldings || userHoldings.quantity === 0;

      // If we are in "Holdings Info" mode (Portfolio page), we might want to skip the success modal
      // as per user request "dont want the modal when i trade from the portfoilo page itself"
      // The prop `showHoldingsInfo` is typically true when opened from Portfolio.
      
      if (shouldShowHoldingsInfo) {
          // toast.success("Transaction successful!");
          handleClose();
      } else {
          // Show success modal
          setSuccessData({
            type: tradeType,
            coinName: coin.name || coin.coinName,
            symbol: coin.symbol || coin.coinSymbol,
            amount: parseFloat(coinAmount),
            price: parseFloat(currentPrice),
            total: parseFloat(calculateTotal),
            isFirstPurchase: isFirstPurchase && tradeType === 'buy'
          });
      }
    } catch (error) {
      console.error("Trade error:", error);
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Trade failed. Please try again.";
      toast.error(errorMessage, {
        style: {
          background: "#FEE2E2",
          color: "#991B1B",
          boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
          borderRadius: "8px",
          fontWeight: "600",
          fontSize: "14px",
          padding: "12px 16px",
          border: "none",
        },
        iconTheme: { primary: "#DC2626", secondary: "#FFFFFF" },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!show || !coin) return null;
  
  if (successData) {
    return (
      <PurchaseSuccessModal 
        show={!!successData} 
        onClose={handleClose} 
        data={successData}
        isFirstPurchase={successData.isFirstPurchase}
      />
    );
  }

  const symbol = coin.symbol?.toUpperCase() || coin.coinSymbol?.toUpperCase();
  const coinName = coin.name || coin.coinName;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md transition-all duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      } ${isLight ? "bg-black/30" : "bg-black/70"}`}
      onClick={handleBackdropClick}
    >
      <div
        className={`${
          TC.bgModal
        } rounded-2xl shadow-2xl w-[96vw] md:max-w-lg md:w-full mx-auto max-h-[85vh] md:max-h-[90vh] overflow-hidden transition-all duration-300 ${
          isVisible
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-4"
        }`}
      >
        <TradeModalHeader
          coin={coin}
          coinName={coinName}
          symbol={symbol}
          currentPrice={currentPrice}
          shouldShowHoldingsInfo={shouldShowHoldingsInfo}
          activeTab={activeTab}
          isBuyOperation={isBuyOperation}
          isLight={isLight}
          TC={TC}
          handleClose={handleClose}
        />

        {shouldShowHoldingsInfo && (
          <TradeModalTabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isLight={isLight}
            TC={TC}
          />
        )}

        <div className="p-2 sm:p-4 overflow-y-auto max-h-[calc(75vh-100px)] custom-scrollbar">
          {shouldShowHoldingsInfo && holdingsSummary && (
            <HoldingsInfo
              holdingsSummary={holdingsSummary}
              activeTab={activeTab}
              isLight={isLight}
              TC={TC}
              symbol={symbol}
            />
          )}

          {(!shouldShowHoldingsInfo || activeTab !== "details") && (
            <TransactionForm
              coinAmount={coinAmount}
              handleCoinAmountChange={handleCoinAmountChange}
              usdAmount={usdAmount}
              handleUsdAmountChange={handleUsdAmountChange}
              shouldShowSellAll={shouldShowSellAll}
              handleSellAll={handleSellAll}
              setMaxAmount={setMaxAmount}
              maxAvailable={maxAvailable}
              symbol={symbol}
              currentPrice={currentPrice}
              TC={TC}
              slippage={slippage}
              setSlippage={setSlippage}
              isLight={isLight}
              calculateTotal={calculateTotal}
              isBuyOperation={isBuyOperation}
              handleSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              orderType={orderType}
              setOrderType={setOrderType}
              limitPrice={limitPrice}
              handleLimitPriceChange={handleLimitPriceChange}
              isAlertMode={isAlertMode}
              setIsAlertMode={setIsAlertMode}
              alertTargetPrice={alertTargetPrice}
              setAlertTargetPrice={setAlertTargetPrice}
              stopPrice={stopPrice}
              setStopPrice={setStopPrice}
            />
          )}

          {shouldShowHoldingsInfo && activeTab === "details" && (
            <HoldingsActions
              setActiveTab={setActiveTab}
              TC={TC}
              currentPrice={currentPrice}
              holdingsSummary={holdingsSummary}
            />
          )}

 
        </div>
      </div>
    </div>
  );
}

export default TradeModal;
