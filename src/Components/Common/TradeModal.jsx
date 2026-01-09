import useThemeCheck from "@/hooks/useThemeCheck";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import toast from "react-hot-toast";

import useUserContext from "@/hooks/useUserContext";
import { usePurchasedCoins } from "@/hooks/usePurchasedCoins";
import useWalletContext from "@/hooks/useWalletContext";
import api from "@/api/axiosConfig";

import TradeModalHeader from "../TradeModal/TradeModalHeader";
import TradeModalTabs from "../TradeModal/TradeModalTabs";
import HoldingsInfo from "../TradeModal/HoldingsInfo";
import TransactionForm from "../TradeModal/TransactionForm";

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

  // State
  const [activeTab, setActiveTab] = useState("details");
  const [usdAmount, setUsdAmount] = useState("");
  const [coinAmount, setCoinAmount] = useState("");
  const [slippage, setSlippage] = useState(1.0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  // Order Types
  const [orderType, setOrderType] = useState("market");
  const [limitPrice, setLimitPrice] = useState("");
  const [stopPrice, setStopPrice] = useState("");

  // Alerts
  const [isAlertMode, setIsAlertMode] = useState(initialAlertMode || false);
  const [alertTargetPrice, setAlertTargetPrice] = useState("");

  const prevCoinIdRef = React.useRef(null);
  const prevShowRef = React.useRef(false);

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
  }, [coin, purchasedCoins]);

  const hasHoldings = useMemo(() => {
    return (
      userHoldings &&
      (userHoldings.totalQuantity > 0 || userHoldings.quantity > 0)
    );
  }, [userHoldings]);

  const shouldShowHoldingsInfo = showHoldingsInfo || hasHoldings;
  const isBuyOperation = useMemo(
    () => (shouldShowHoldingsInfo ? activeTab === "deposit" : type === "buy"),
    [shouldShowHoldingsInfo, activeTab, type],
  );

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      setIsVisible(false);
      setTimeout(onClose, 350);
    }
  };

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(onClose, 350);
  }, [onClose]);

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
    return (orderType === "limit" || orderType === "stop_limit") && limitPrice
      ? parseFloat(limitPrice)
      : currentPrice;
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
    const currentCoinId = coin?.id || coin?.coinId;
    const isDifferentCoin = currentCoinId !== prevCoinIdRef.current;
    const isOpening = show && !prevShowRef.current;

    if (show && coin) {
      if (isOpening || isDifferentCoin) {
        setUsdAmount("");
        setCoinAmount("");
        setSlippage(1.0);
        setIsSubmitting(false);
        setIsAlertMode(initialAlertMode || false);

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
        setLimitPrice(price);
        setStopPrice(price);
        setOrderType("market");
        setAlertTargetPrice(price);

        // Trigger visibility animation
        const timer = setTimeout(() => setIsVisible(true), 10);
        prevCoinIdRef.current = currentCoinId;
        return () => clearTimeout(timer);
      }
    } else {
      setIsVisible(false);
    }
    prevShowRef.current = show;
  }, [show, coin, initialAlertMode, shouldShowHoldingsInfo, type]); // Added coin back with guards to prevent flicker on updates

  // Dedicated effect for live price updates to avoid form resets
  useEffect(() => {
    if (show && coin) {
      const price =
        coin.current_price ||
        coin.currentPrice ||
        coin.coinPriceUSD ||
        coin.market_data?.current_price?.usd ||
        0;

      if (price !== 0 && price !== currentPrice) {
        setCurrentPrice(price);
        // Only update these if they haven't been manually touched or if it's the first load
        if (orderType === "market") {
          setLimitPrice(price);
          setStopPrice(price);
          setAlertTargetPrice(price);
        }
      }
    }
  }, [coin, show, currentPrice, orderType]);

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

    if (coinAmount && value > 0) {
      const price = parseFloat(value);
      const calculatedUSD = parseFloat(coinAmount) * price;
      setUsdAmount(calculatedUSD.toFixed(2));
    }
  };

  const setMaxAmount = () => {
    const maxCoins = maxAvailable;
    if (maxCoins > 0) {
      // Truncate to 8 decimals to avoid rounding up issues
      const factor = Math.pow(10, 8);
      const truncated = Math.floor(maxCoins * factor) / factor;

      setCoinAmount(truncated.toFixed(8));
      const calculatedUSD = truncated * effectivePrice;
      setUsdAmount(calculatedUSD.toFixed(2));

      const isSellMode = shouldShowHoldingsInfo
        ? activeTab === "withdraw"
        : type === "sell";
      if (isSellMode) {
        toast.success(
          `Set to maximum: ${truncated.toFixed(6)} ${coin.symbol?.toUpperCase()}`,
        );
      }
    }
  };

  const handleSellAll = () => {
    if (holdingsSummary && holdingsSummary.totalQuantity > 0) {
      const totalQuantity = holdingsSummary.totalQuantity;

      // Truncate to 8 decimals to avoid rounding up issues
      const factor = Math.pow(10, 8);
      const truncated = Math.floor(totalQuantity * factor) / factor;

      setCoinAmount(truncated.toFixed(8));
      const calculatedUSD = truncated * currentPrice;
      setUsdAmount(calculatedUSD.toFixed(2));

      toast.success(
        `Filled with entire holdings: ${truncated.toFixed(6)} ${(
          coin.symbol || coin.coinSymbol
        )?.toUpperCase()}`,
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

      // Helper to run background updates without blocking UI flow
      const runBackgroundUpdates = async () => {
        try {
          if (refreshPurchasedCoins) await refreshPurchasedCoins();
        } catch (e) {
          console.warn("Background refresh (coins) failed", e);
        }

        try {
          let retryCount = 0;
          const maxRetries = 3;
          const refreshBalanceWithRetry = async () => {
            try {
              await refreshBalance();
            } catch {
              retryCount++;
              if (retryCount < maxRetries) {
                await new Promise((resolve) => setTimeout(resolve, 500));
                return refreshBalanceWithRetry();
              }
            }
          };
          await refreshBalanceWithRetry();
        } catch (e) {
          console.warn("Background refresh (balance) failed", e);
        }
      };

      if (isAlertMode) {
        const condition =
          parseFloat(alertTargetPrice) > currentPrice ? "above" : "below";
        const alertData = {
          user_id: user.id,
          coin_id: coinData.coinId || coinData.id,
          coin_symbol: symbol,
          coin_name: coinData.name || coinData.coinName,
          coin_image: coinData.image,
          target_price: parseFloat(alertTargetPrice),
          condition,
        };

        try {
          const res = await api.post("/alerts/create", alertData);
          if (!res.data.success) {
            throw new Error("Failed to create alert");
          }
        } catch {
          toast.error("Failed to create alert");
        }

        toast.success(
          `Alert Set: ${symbol.toUpperCase()} ${condition} $${parseFloat(alertTargetPrice).toFixed(2)}`,
        );
        return;
      }

      if (orderType === "limit" || orderType === "stop_limit") {
        const orderData = {
          user_id: user.id,
          coin_id: coinData.coinId || coinData.id,
          coin_symbol: symbol,
          coin_name: coinData.name || coinData.coinName,
          coin_image: coinData.image,
          type: type,
          category: orderType,
          limit_price: parseFloat(limitPrice),
          stop_price:
            orderType === "stop_limit" ? parseFloat(stopPrice) : undefined,
          quantity: parseFloat(coinAmount),
        };

        const res = await api.post("/orders/create", orderData);

        if (!res.data.success) {
          throw new Error(res.data.error || "Failed to create order");
        }

        toast.success(
          `${orderType === "stop_limit" ? "Stop-Limit" : "Limit"} Order Placed Successfully!`,
        );

        // Non-blocking updates
        runBackgroundUpdates();
        return;
      } else {
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
            );

            // Non-blocking
            runBackgroundUpdates();
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
              `Successfully sold ${parseFloat(coinAmount).toFixed(
                6,
              )} ${symbol.toUpperCase()}`,
            );

            // Non-blocking
            runBackgroundUpdates();
          } else {
            throw new Error(result.error || "Sell failed");
          }
        }
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
      alertTargetPrice,
      isBuyOperation,
    ],
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

      if (quantity > availableQuantity + 1e-9) {
        toast.error(
          `You only have ${availableQuantity.toFixed(8)} ${(
            coin.symbol || coin.coinSymbol
          )?.toUpperCase()} available`,
        );
        return;
      }

      if (quantity < 0.000001) {
        toast.error("Minimum sell amount is 0.000001");
        return;
      }

      if (!holdingsSummary || availableQuantity === 0) {
        toast.error(
          "No holdings found for this coin. Please refresh and try again.",
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

      handleClose();
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

  if (!coin) return null;

  const symbol = coin.symbol?.toUpperCase() || coin.coinSymbol?.toUpperCase();
  const coinName = coin.name || coin.coinName;

  return (
    <>
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md transition-all duration-200 ${
          isVisible
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        } ${isLight ? "bg-black/30" : "bg-black/70"}`}
        onClick={handleBackdropClick}
      >
        <div
          className={`rounded-[1.5rem] sm:rounded-[2rem] shadow-2xl w-[95%] sm:w-full max-w-[360px] sm:max-w-[440px] mx-auto overflow-hidden transition-all duration-300 ease-out origin-center backdrop-blur-3xl transform ${
            isLight
              ? "bg-white/90 border border-white/60 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)]"
              : "bg-gray-900 border border-gray-700 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.9)]"
          } ${
            isVisible
              ? "opacity-100 translate-y-0 scale-100"
              : "opacity-0 translate-y-4 scale-95"
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
            handleClose={handleClose}
          />

          {shouldShowHoldingsInfo && (
            <TradeModalTabs
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              isLight={isLight}
            />
          )}

          <div className="p-3 sm:p-4 pt-1">
            {shouldShowHoldingsInfo && holdingsSummary && (
              <HoldingsInfo
                holdingsSummary={holdingsSummary}
                activeTab={activeTab}
                isLight={isLight}
                symbol={symbol}
                currentPrice={currentPrice}
                coin={coin}
                setActiveTab={setActiveTab}
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
                slippage={slippage}
                setSlippage={setSlippage}
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
          </div>
        </div>
      </div>
    </>
  );
}

export default React.memo(TradeModal);
