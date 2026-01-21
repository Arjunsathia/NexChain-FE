import useThemeCheck from "@/hooks/useThemeCheck";
import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import toast from "react-hot-toast";

import useUserContext from "@/hooks/useUserContext";
import { usePurchasedCoins } from "@/hooks/usePurchasedCoins";
import useWalletContext from "@/hooks/useWalletContext";
import api from "@/api/axiosConfig";
import { useBinanceTicker } from "@/hooks/useBinanceTicker";

import TradeModalHeader from "../TradeModal/TradeModalHeader";
import TradeModalTabs from "../TradeModal/TradeModalTabs";
import HoldingsInfo from "../TradeModal/HoldingsInfo";
import TransactionForm from "../TradeModal/TransactionForm";
import ConfirmDialog from "./ConfirmDialog";

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
  const livePrices = useBinanceTicker();
  const [currentPrice, setCurrentPrice] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isHoldingsView, setIsHoldingsView] = useState(false);
  const [isTradeSuccess, setIsTradeSuccess] = useState(false);
  const viewLockedRef = useRef(false);

  // Order Types
  const [orderType, setOrderType] = useState("market");
  const [limitPrice, setLimitPrice] = useState("");
  const [stopPrice, setStopPrice] = useState("");

  // Alerts
  const [isAlertMode, setIsAlertMode] = useState(initialAlertMode || false);
  const [alertTargetPrice, setAlertTargetPrice] = useState("");

  // Confirmation Modal
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmDetails, setConfirmDetails] = useState(null);

  const prevCoinIdRef = useRef(null);
  const prevShowRef = useRef(false);

  const formatOrderType = (type) => {
    const types = {
      market: "Market",
      limit: "Limit",
      stop_limit: "Stop-Limit",
      stop_market: "Stop-Market",
      oco: "OCO",
    };
    return types[type] || type;
  };

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

  const isBuyOperation = useMemo(
    () => (isHoldingsView ? activeTab === "deposit" : type === "buy"),
    [isHoldingsView, activeTab, type],
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
    if (!isHoldingsView || !coin) return null;

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
  }, [isHoldingsView, coin, currentPrice, userHoldings]);

  const effectivePrice = useMemo(() => {
    if (orderType === "stop_market" && stopPrice) return parseFloat(stopPrice);
    if (orderType === "oco" && limitPrice && stopPrice) {
      return Math.max(parseFloat(limitPrice), parseFloat(stopPrice));
    }
    return (orderType === "limit" || orderType === "stop_limit" || orderType === "oco") && limitPrice
      ? parseFloat(limitPrice)
      : currentPrice;
  }, [orderType, limitPrice, stopPrice, currentPrice]);

  const maxAvailable = useMemo(() => {
    const isSellMode = isHoldingsView
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
    isHoldingsView,
    activeTab,
    type,
    holdingsSummary,
    balance,
    effectivePrice,
  ]);

  const shouldShowSellAll = useMemo(() => {
    const isSellMode = isHoldingsView
      ? activeTab === "withdraw"
      : type === "sell";
    return isSellMode && holdingsSummary && holdingsSummary.totalQuantity > 0;
  }, [holdingsSummary, isHoldingsView, activeTab, type]);

  useEffect(() => {
    const currentCoinId = coin?.id || coin?.coinId;
    const isDifferentCoin = currentCoinId !== prevCoinIdRef.current;
    if (show && isDifferentCoin) {
      viewLockedRef.current = false;
    }
  }, [show, coin]);

  useEffect(() => {
    const currentCoinId = coin?.id || coin?.coinId;
    const isOpening = show && !prevShowRef.current;
    const isDifferentCoin = currentCoinId !== prevCoinIdRef.current;

    if (show && coin) {
      if ((isOpening || isDifferentCoin) && !viewLockedRef.current) {
        setUsdAmount("");
        setCoinAmount("");
        setSlippage(1.0);
        setIsSubmitting(false);
        setIsTradeSuccess(false);
        setIsAlertMode(initialAlertMode || false);

        const mode = showHoldingsInfo || hasHoldings;
        setIsHoldingsView(mode);
        setActiveTab(mode ? "details" : (type === "buy" ? "deposit" : "withdraw"));

        const price =
          coin.current_price ||
          coin.currentPrice ||
          coin.coinPriceUSD ||
          coin.market_data?.current_price?.usd ||
          0;
        setCurrentPrice(price);
        setLimitPrice("");
        setStopPrice("");
        setOrderType("market");
        setAlertTargetPrice(price);

        // Warm up backend cache for instant execution
        if (coin.symbol || coin.coinSymbol) {
          api.post("/coins/track", { symbol: coin.symbol || coin.coinSymbol }).catch(() => { });
        }

        viewLockedRef.current = true;
        const timer = setTimeout(() => setIsVisible(true), 10);
        prevCoinIdRef.current = currentCoinId;
        return () => clearTimeout(timer);
      }
    } else {
      setIsVisible(false);
      viewLockedRef.current = false;
    }
    prevShowRef.current = show;
  }, [show, coin, initialAlertMode, showHoldingsInfo, hasHoldings, type]);

  // Dedicated effect for live price updates to avoid form resets
  useEffect(() => {
    if (show && coin) {
      const coinId = coin.id || coin.coinId;
      const liveData = livePrices[coinId];

      const price = liveData?.current_price ||
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
  }, [coin, show, currentPrice, orderType, livePrices]);

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

      const isSellMode = isHoldingsView
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

      if (orderType === "limit" || orderType === "stop_limit" || orderType === "stop_market") {
        const orderData = {
          user_id: user.id,
          coin_id: coinData.coinId || coinData.id,
          coin_symbol: symbol,
          coin_name: coinData.name || coinData.coinName,
          coin_image: coinData.image,
          type: type,
          category: orderType,
          limit_price: orderType === "stop_market" ? undefined : parseFloat(limitPrice),
          stop_price:
            (orderType === "stop_limit" || orderType === "stop_market") ? parseFloat(stopPrice) : undefined,
          quantity: parseFloat(coinAmount),
        };

        const res = await api.post("/orders/create", orderData);

        if (!res.data.success) {
          throw new Error(res.data.error || "Failed to create order");
        }

        toast.success(
          `${formatOrderType(orderType)} Order Placed Successfully!`,
        );

        // Non-blocking updates
        runBackgroundUpdates();
        return;
      } else if (orderType === "oco") {
        // OCO Handling
        const ocoData = {
          user_id: user.id,
          coin_id: coinData.coinId || coinData.id,
          coin_symbol: symbol,
          coin_name: coinData.name || coinData.coinName,
          coin_image: coinData.image,
          type: type,
          quantity: parseFloat(coinAmount),
          tp_limit_price: parseFloat(limitPrice),
          sl_stop_price: parseFloat(stopPrice),
          // For now assuming SL is Stop-Market as per standard simple OCO. 
          // If we added SL Limit input, we would pass it here.
          sl_limit_price: undefined
        };

        const res = await api.post("/orders/create-oco", ocoData);

        if (!res.data.success) {
          throw new Error(res.data.error || "Failed to create OCO order");
        }

        toast.success("OCO Order Placed Successfully!");

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
            toast.success(`${symbol.toUpperCase()} Purchase Successful`, {
              duration: 3000,
            });

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
            coin_symbol: symbol || coinData.symbol || coinData.coinSymbol,
            quantity: parseFloat(coinAmount),
          };

          const result = await sellCoins(sellData);
          if (result.success) {
            toast.success(`${symbol.toUpperCase()} Sale Successful`, {
              duration: 3000,
            });

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

  const handleProceedWithTrade = useCallback(async () => {
    setShowConfirm(false);
    setIsSubmitting(true);
    try {
      const tradeType = isHoldingsView
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

      // Show success state on button before closing
      setIsTradeSuccess(true);
      setTimeout(() => {
        handleClose();
      }, 100);
      // Clean submit state only after modal is long gone
      setTimeout(() => {
        setIsSubmitting(false);
        setIsTradeSuccess(false);
      }, 300);
    } catch (error) {
      console.error("Trade error:", error);
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Trade failed. Please try again.";
      toast.error(errorMessage);
      setIsSubmitting(false);
    }
  }, [
    activeTab,
    calculateTotal,
    coin,
    coinAmount,
    handleClose,
    handleTradeSubmit,
    isHoldingsView,
    slippage,
    type,
    usdAmount,
  ]);

  const handleSubmit = async () => {
    if (!coin || !usdAmount || parseFloat(usdAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    const isSellMode = isHoldingsView
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

    const isBuyMode = isHoldingsView
      ? activeTab === "deposit"
      : type === "buy";

    // Stop-Limit & OCO Validations
    if (orderType === "stop_limit" || orderType === "stop_market" || orderType === "oco") {
      const stop = parseFloat(stopPrice);
      const limit = parseFloat(limitPrice);

      if (orderType === "stop_market") {
        if (isNaN(stop)) {
          toast.error("Please enter Stop price");
          return;
        }
      } else if (orderType === "oco") {
        if (isNaN(stop) || isNaN(limit)) {
          toast.error("Please enter both Take Profit (Limit) and Stop Loss (Stop) prices");
          return;
        }
      } else {
        // Stop Limit
        if (isNaN(stop) || isNaN(limit)) {
          toast.error("Please enter both Stop and Limit prices");
          return;
        }
      }

      // Additional Logic checks for OCO
      if (orderType === "oco") {
        if (isBuyMode) {
          // Buy OCO:
          // 1. Limit Order (Take Profit / Buy Dip) -> MUST be BELOW current price
          // 2. Stop Order (Stop Loss / Breakout Buy) -> MUST be ABOVE current price

          if (limit >= currentPrice) {
            toast.error(
              `For Buy OCO, Take Profit (Limit) acts as a "Buy Limit" and must be LOWER than current price ($${currentPrice.toLocaleString()}). Use this to catch a dip.`
            );
            return;
          }
          if (stop <= currentPrice) {
            toast.error(
              `For Buy OCO, Stop Loss (Trigger) acts as a "Buy Stop" and must be HIGHER than current price ($${currentPrice.toLocaleString()}). Use this to buy a breakout.`
            );
            return;
          }
        } else {
          // Sell OCO:
          // 1. Limit Order (Take Profit) -> MUST be ABOVE current price (Sell High)
          // 2. Stop Order (Stop Loss) -> MUST be BELOW current price (Cut Loss)

          if (limit <= currentPrice) {
            toast.error(
              `For Sell OCO, Take Profit (Limit) must be HIGHER than current price ($${currentPrice.toLocaleString()}). You want to sell at a profit.`
            );
            return;
          }
          if (stop >= currentPrice) {
            toast.error(
              `For Sell OCO, Stop Loss (Trigger) must be LOWER than current price ($${currentPrice.toLocaleString()}). You want to limit your losses.`
            );
            return;
          }
        }
      }

      if (orderType === "stop_limit") {
        if (isBuyMode) {
          if (stop <= currentPrice) {
            toast.error(`Buy Stop must be ABOVE current price ($${currentPrice.toLocaleString()}). Use a Limit order to buy lower.`);
            return;
          }
        } else {
          if (stop >= currentPrice) {
            toast.error(`Sell Stop must be BELOW current price ($${currentPrice.toLocaleString()}). Use a Limit order to sell higher.`);
            return;
          }
        }
      }
    }

    if (isBuyMode) {
      const quantity = parseFloat(coinAmount);
      if (quantity > maxAvailable) {
        toast.error("Insufficient balance for this purchase");
        return;
      }
    }

    const tradeType = isHoldingsView
      ? activeTab === "deposit"
        ? "buy"
        : "sell"
      : type;

    // Instant Fill Confirmation
    const isLimitOrder = orderType === "limit" || orderType === "stop_limit";
    if (isLimitOrder && limitPrice) {
      const lp = parseFloat(limitPrice);
      const isInstant = tradeType === "buy" ? lp >= currentPrice : lp <= currentPrice;

      if (isInstant) {
        setConfirmDetails({
          title: "Instant Execution",
          message: `Your ${orderType} price ($${lp.toLocaleString()}) is ${tradeType === "buy" ? "ABOVE" : "BELOW"} the current market price ($${currentPrice.toLocaleString()}). This order will execute IMMEDIATELY.`,
          confirmText: "Execute Anyway",
          cancelText: "Go Back"
        });
        setShowConfirm(true);
        return;
      }
    }

    await handleProceedWithTrade();
  };

  if (!coin) return null;

  const symbol = coin.symbol?.toUpperCase() || coin.coinSymbol?.toUpperCase();

  return createPortal(
    <div
      className={`fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4 transition-all duration-300 ${isVisible
        ? "bg-black/50 backdrop-blur-sm"
        : "bg-black/0 backdrop-blur-none pointer-events-none"
        }`}
      onClick={handleBackdropClick}
    >
      <div
        className={`w-full sm:max-w-[440px] rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl relative overflow-hidden transition-all duration-500 transform-gpu ${isLight
          ? "bg-white sm:bg-white/90 border border-white/60 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)]"
          : "bg-gray-950 sm:bg-gray-900 border border-gray-800 sm:border-gray-700 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.9)]"
          } ${isVisible
            ? "translate-y-0 opacity-100 scale-100"
            : "translate-y-full sm:translate-y-4 opacity-0 sm:scale-95"
          }`}
        style={{
          willChange: "transform, opacity",
          backfaceVisibility: "hidden",
        }}
      >
        <TradeModalHeader
          coin={coin}
          coinName={coin.coinName || coin.name}
          symbol={symbol}
          currentPrice={currentPrice}
          priceChange={livePrices[coin.id || coin.coinId]?.price_change_percentage_24h || coin.price_change_percentage_24h || 0}
          isLight={isLight}
          handleClose={handleClose}
        />

        {isHoldingsView && (
          <TradeModalTabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isLight={isLight}
          />
        )}

        <div className="p-3 sm:p-4 pt-1">
          {isHoldingsView && holdingsSummary && (
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

          {(!isHoldingsView || activeTab !== "details") && (
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
              isSubmitting={isSubmitting || isTradeSuccess}
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

      {showConfirm && confirmDetails && (
        <ConfirmDialog
          show={showConfirm}
          onClose={() => setShowConfirm(false)}
          onConfirm={handleProceedWithTrade}
          title={confirmDetails.title}
          message={confirmDetails.message}
          confirmText={confirmDetails.confirmText}
          cancelText={confirmDetails.cancelText}
          variant="warning"
        />
      )}
    </div>,
    document.body,
  );
}

export default React.memo(TradeModal);
