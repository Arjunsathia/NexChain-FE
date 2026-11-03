import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import toast from "react-hot-toast";

import useUserContext from "@/hooks/useUserContext";
import { usePurchasedCoins } from "@/hooks/usePurchasedCoins";
import useWalletContext from "@/hooks/useWalletContext";
import api from "@/api/axiosConfig";
import { useLivePrice } from "@/hooks/useBinanceTicker";
import { Modal } from "@/Components/ui/modal";
import { Delta } from "@/Components/ui/delta";
import { formatUSD } from "@/utils/format";
import { cn } from "@/utils/utils";

import TradeModalHeader from "./TradeModalHeader";
import TransactionForm from "./TransactionForm";
import { validateTrade, fillsImmediately } from "./validateTrade";
import ConfirmDialog from "../Common/ConfirmDialog";

const ORDER_TYPE_LABELS = {
  market: "Market",
  limit: "Limit",
  stop_limit: "Stop-Limit",
  stop_market: "Stop-Market",
  oco: "OCO",
};

const coinImage = (coin) =>
  typeof coin?.image === "string" ? coin.image : coin?.image?.small || coin?.image?.large || coin?.image?.thumb;

/** Buy or sell a coin with market, limit, stop and OCO orders */
function TradeModal({ show, onClose, coin, type = "buy", purchasedCoins = [] }) {
  const { user } = useUserContext();
  const { balance, refreshBalance } = useWalletContext();
  const { addPurchase, sellCoins, refreshPurchasedCoins } = usePurchasedCoins();

  const [side, setSide] = useState(type === "sell" ? "sell" : "buy");
  const [usdAmount, setUsdAmount] = useState("");
  const [coinAmount, setCoinAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTradeSuccess, setIsTradeSuccess] = useState(false);
  // Only this coin's updates re-render the modal
  const liveCoinData = useLivePrice(coin?.id || coin?.coinId, coin?.symbol || coin?.coinSymbol);
  const [currentPrice, setCurrentPrice] = useState(0);

  const [orderType, setOrderType] = useState("market");
  const [limitPrice, setLimitPrice] = useState("");
  const [stopPrice, setStopPrice] = useState("");

  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmDetails, setConfirmDetails] = useState(null);

  const prevShowRef = useRef(false);
  const prevCoinIdRef = useRef(null);
  const isBuy = side === "buy";

  const userHoldings = useMemo(() => {
    if (!coin || !purchasedCoins?.length) return null;
    const coinId = String(coin.id || coin.coinId);
    return purchasedCoins.find((pc) => [pc.coin_id, pc.coinId, pc.id].some((v) => v != null && String(v) === coinId)) || null;
  }, [coin, purchasedCoins]);

  const holdingsSummary = useMemo(() => {
    const holdings = userHoldings || {};
    const totalQuantity = holdings.totalQuantity || holdings.quantity || 0;
    const remainingInvestment = holdings.remainingInvestment || holdings.total_cost || holdings.totalCost || 0;
    const currentValue = totalQuantity * currentPrice;
    const profitLoss = currentValue - remainingInvestment;
    return {
      totalQuantity,
      remainingInvestment,
      currentValue,
      profitLoss,
      profitLossPercentage: remainingInvestment > 0 ? (profitLoss / remainingInvestment) * 100 : 0,
    };
  }, [userHoldings, currentPrice]);
  const hasHoldings = holdingsSummary.totalQuantity > 0;

  const effectivePrice = useMemo(() => {
    if (orderType === "stop_market" && stopPrice) return parseFloat(stopPrice);
    if (orderType === "oco" && limitPrice && stopPrice) {
      return Math.max(parseFloat(limitPrice), parseFloat(stopPrice));
    }
    return (orderType === "limit" || orderType === "stop_limit" || orderType === "oco") && limitPrice
      ? parseFloat(limitPrice)
      : currentPrice;
  }, [orderType, limitPrice, stopPrice, currentPrice]);

  // Coins the user can trade: holdings when selling; 95% of cash when buying,
  // leaving headroom for the price to move before the order reaches the server
  const maxAvailable = useMemo(() => {
    if (!isBuy) return holdingsSummary.totalQuantity || 0;
    if (balance && effectivePrice > 0) return (balance * 0.95) / effectivePrice;
    return 0;
  }, [isBuy, holdingsSummary, balance, effectivePrice]);

  // Reset the form when the modal opens or switches to another coin
  useEffect(() => {
    const currentCoinId = coin?.id || coin?.coinId;
    const opening = show && !prevShowRef.current;
    const differentCoin = currentCoinId !== prevCoinIdRef.current;
    prevShowRef.current = show;

    if (!show || !coin || !(opening || differentCoin)) return;
    prevCoinIdRef.current = currentCoinId;

    setSide(type === "sell" ? "sell" : "buy");
    setUsdAmount("");
    setCoinAmount("");
    setIsSubmitting(false);
    setIsTradeSuccess(false);
    const price =
      coin.current_price || coin.currentPrice || coin.coinPriceUSD || coin.market_data?.current_price?.usd || 0;
    setCurrentPrice(price);
    setLimitPrice("");
    setStopPrice("");
    setOrderType("market");
    // Warm up the backend price cache for instant execution
    if (coin.symbol || coin.coinSymbol) {
      api.post("/coins/track", { symbol: coin.symbol || coin.coinSymbol }).catch(() => {});
    }
  }, [show, coin, type]);

  // Live price updates without resetting the form
  useEffect(() => {
    if (!show || !coin) return;
    const price =
      liveCoinData?.current_price ||
      coin.current_price ||
      coin.currentPrice ||
      coin.coinPriceUSD ||
      coin.market_data?.current_price?.usd ||
      0;
    if (price !== 0 && price !== currentPrice) {
      setCurrentPrice(price);
      // Prices the user hasn't typed follow the market
      if (orderType === "market") {
        setLimitPrice(price);
        setStopPrice(price);
      }
    }
  }, [coin, show, currentPrice, orderType, liveCoinData]);

  const handleUsdAmountChange = (e) => {
    const value = e.target.value;
    setUsdAmount(value);
    const amount = parseFloat(value);
    if (value && effectivePrice > 0) {
      setCoinAmount(!isNaN(amount) && amount > 0 ? (amount / effectivePrice).toFixed(8) : "");
    }
  };

  const handleCoinAmountChange = (e) => {
    const value = e.target.value;
    setCoinAmount(value);
    const coins = parseFloat(value);
    if (value && effectivePrice > 0) {
      setUsdAmount(!isNaN(coins) && coins > 0 ? (coins * effectivePrice).toFixed(2) : "");
    } else if (!value) {
      setUsdAmount("");
    }
  };

  const handleLimitPriceChange = (e) => {
    const value = e.target.value;
    setLimitPrice(value);
    if (coinAmount && value > 0) {
      setUsdAmount((parseFloat(coinAmount) * parseFloat(value)).toFixed(2));
    }
  };

  const setMaxAmount = () => {
    if (maxAvailable <= 0) return;
    // Truncate to 8 decimals so rounding never exceeds what's available
    const truncated = Math.floor(maxAvailable * 1e8) / 1e8;
    setCoinAmount(truncated.toFixed(8));
    setUsdAmount((truncated * effectivePrice).toFixed(2));
  };

  const calculateTotal = useMemo(() => (usdAmount ? parseFloat(usdAmount).toFixed(2) : 0), [usdAmount]);

  const handleTradeSubmit = useCallback(
    async ({ symbol, coinAmount: quantity, total, coinData }) => {
      if (!user) {
        toast.error("Please login to trade");
        return;
      }

      // Refresh holdings and balance after a trade without blocking the UI
      const runBackgroundUpdates = async () => {
        try {
          if (refreshPurchasedCoins) await refreshPurchasedCoins();
        } catch {
          // the next poll catches up
        }
        for (let attempt = 0; attempt < 3; attempt++) {
          try {
            await refreshBalance();
            break;
          } catch {
            await new Promise((resolve) => setTimeout(resolve, 500));
          }
        }
      };

      const base = {
        user_id: user.id,
        coin_id: coinData.coinId || coinData.id,
        coin_symbol: symbol,
        coin_name: coinData.name || coinData.coinName,
        coin_image: coinImage(coinData),
        type: side,
        quantity: parseFloat(quantity),
      };

      if (orderType === "limit" || orderType === "stop_limit" || orderType === "stop_market") {
        const res = await api.post("/orders/create", {
          ...base,
          category: orderType,
          limit_price: orderType === "stop_market" ? undefined : parseFloat(limitPrice),
          stop_price: orderType === "stop_limit" || orderType === "stop_market" ? parseFloat(stopPrice) : undefined,
        });
        if (!res.data.success) throw new Error(res.data.error || "Failed to create order");
        toast.success(`${ORDER_TYPE_LABELS[orderType]} order placed`);
        runBackgroundUpdates();
        return;
      }

      if (orderType === "oco") {
        const res = await api.post("/orders/create-oco", {
          ...base,
          tp_limit_price: parseFloat(limitPrice),
          sl_stop_price: parseFloat(stopPrice),
          // Stop loss executes as stop-market
          sl_limit_price: undefined,
        });
        if (!res.data.success) throw new Error(res.data.error || "Failed to create OCO order");
        toast.success("OCO order placed");
        runBackgroundUpdates();
        return;
      }

      const cryptocurrencyId = coinData.coinId || coinData.id;
      const result = isBuy
        ? await addPurchase({
            user_id: user.id,
            coin_id: cryptocurrencyId,
            coin_name: coinData.name || coinData.coinName,
            coin_symbol: coinData.symbol || coinData.coinSymbol,
            coin_price_usd: currentPrice,
            quantity: parseFloat(quantity),
            total_cost: parseFloat(total),
            fees: 0,
            image: coinImage(coinData),
          })
        : await sellCoins({
            user_id: user.id,
            coin_id: cryptocurrencyId,
            coin_symbol: symbol || coinData.symbol || coinData.coinSymbol,
            quantity: parseFloat(quantity),
          });

      if (!result.success) throw new Error(result.error || (isBuy ? "Purchase failed" : "Sell failed"));
      toast.success(`${symbol.toUpperCase()} ${isBuy ? "purchase" : "sale"} complete`);
      runBackgroundUpdates();
    },
    [user, addPurchase, sellCoins, currentPrice, refreshBalance, refreshPurchasedCoins, orderType, limitPrice, stopPrice, side, isBuy],
  );

  const handleProceedWithTrade = useCallback(async () => {
    setShowConfirm(false);
    setIsSubmitting(true);
    try {
      await handleTradeSubmit({
        symbol: coin.symbol || coin.coinSymbol,
        coinAmount: parseFloat(coinAmount),
        total: parseFloat(calculateTotal),
        coinData: coin,
      });
      setIsTradeSuccess(true);
      onClose();
      // Clear the submit state once the modal has animated out
      setTimeout(() => {
        setIsSubmitting(false);
        setIsTradeSuccess(false);
      }, 300);
      return true;
    } catch (error) {
      toast.error(error.response?.data?.error || error.message || "Trade failed. Please try again.");
      setIsSubmitting(false);
      return false;
    }
  }, [calculateTotal, coin, coinAmount, onClose, handleTradeSubmit]);

  const handleSubmit = async () => {
    if (!coin) return false;
    const error = validateTrade({
      side,
      orderType,
      usdAmount,
      coinAmount,
      stopPrice,
      limitPrice,
      currentPrice,
      available: hasHoldings ? holdingsSummary.totalQuantity : 0,
      maxAvailable,
      symbol: coin.symbol || coin.coinSymbol,
    });
    if (error) {
      toast.error(error);
      return false;
    }

    // A limit price already past the market fills immediately: confirm first
    if (fillsImmediately({ side, orderType, limitPrice, currentPrice })) {
      const lp = parseFloat(limitPrice);
      const price = currentPrice.toLocaleString();
      setConfirmDetails({
        title: "This order fills immediately",
        message: `Your ${ORDER_TYPE_LABELS[orderType].toLowerCase()} price ($${lp.toLocaleString()}) is ${isBuy ? "above" : "below"} the market price ($${price}), so it will execute right away.`,
        confirmText: "Place order",
        cancelText: "Go back",
      });
      setShowConfirm(true);
      return false;
    }

    return handleProceedWithTrade();
  };

  const symbol = (coin?.symbol || coin?.coinSymbol || "").toUpperCase();

  return (
    <Modal open={!!show && !!coin} onClose={onClose} label={`Trade ${symbol}`}>
      {coin && (
        <>
          <TradeModalHeader
            image={coinImage(coin)}
            coinName={coin.coinName || coin.name}
            symbol={symbol}
            currentPrice={currentPrice}
            priceChange={liveCoinData?.price_change_percentage_24h ?? coin.price_change_percentage_24h}
            onClose={onClose}
          />

          <div className="space-y-4 p-5">
            <div className="grid grid-cols-2 gap-1 rounded-lg bg-surface-2 p-1" role="tablist" aria-label="Order side">
              {[
                { value: "buy", label: "Buy", active: "bg-up text-white" },
                { value: "sell", label: "Sell", active: "bg-down text-white" },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  role="tab"
                  aria-selected={side === option.value}
                  onClick={() => setSide(option.value)}
                  className={cn(
                    "rounded-md py-2 text-sm font-semibold transition-colors",
                    side === option.value ? option.active : "text-fg-muted hover:text-fg",
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {hasHoldings && (
              <div className="flex items-center justify-between gap-3 rounded-lg border border-line px-3 py-2.5 text-xs">
                <div>
                  <p className="text-fg-subtle">Your position</p>
                  <p className="tabular mt-0.5 text-sm font-medium text-fg">
                    {holdingsSummary.totalQuantity.toLocaleString(undefined, { maximumFractionDigits: 8 })} {symbol}
                  </p>
                </div>
                <div className="text-right">
                  <p className="tabular text-sm font-medium text-fg">{formatUSD(holdingsSummary.currentValue)}</p>
                  <Delta value={holdingsSummary.profitLossPercentage} />
                </div>
              </div>
            )}

            <TransactionForm
              isBuy={isBuy}
              symbol={symbol}
              currentPrice={currentPrice}
              effectivePrice={effectivePrice}
              orderType={orderType}
              setOrderType={setOrderType}
              limitPrice={limitPrice}
              handleLimitPriceChange={handleLimitPriceChange}
              stopPrice={stopPrice}
              setStopPrice={setStopPrice}
              coinAmount={coinAmount}
              handleCoinAmountChange={handleCoinAmountChange}
              usdAmount={usdAmount}
              handleUsdAmountChange={handleUsdAmountChange}
              maxAvailable={maxAvailable}
              setMaxAmount={setMaxAmount}
              balance={balance}
              holdingQuantity={holdingsSummary.totalQuantity}
              calculateTotal={calculateTotal}
              handleSubmit={handleSubmit}
              isSubmitting={isSubmitting || isTradeSuccess}
              disabledReason={!isBuy && !hasHoldings ? `You don't hold any ${symbol} to sell.` : null}
            />
          </div>

          {/* Rendered inside the modal so it stays interactive on top of it */}
          <ConfirmDialog
            show={showConfirm && !!confirmDetails}
            onClose={() => setShowConfirm(false)}
            onConfirm={handleProceedWithTrade}
            title={confirmDetails?.title}
            message={confirmDetails?.message}
            confirmText={confirmDetails?.confirmText}
            cancelText={confirmDetails?.cancelText}
            variant="warning"
          />
        </>
      )}
    </Modal>
  );
}

export default React.memo(TradeModal);
