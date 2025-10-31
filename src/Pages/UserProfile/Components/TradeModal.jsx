import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { FaTimes, FaExchangeAlt } from "react-icons/fa";
import useUserContext from "@/Context/UserContext/useUserContext";
import { usePurchasedCoins } from "@/hooks/usePurchasedCoins";

function TradeModal({ show, onClose, coin, type = "buy" }) {
  const { user } = useUserContext();
  const [usdAmount, setUsdAmount] = useState("");
  const [coinAmount, setCoinAmount] = useState("");
  const [slippage, setSlippage] = useState(1.0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addPurchase, sellCoins } = usePurchasedCoins();

  const handleTradeSubmit = useCallback(
    async (tradeData) => {
      if (!user) {
        toast.error("Please login to trade");
        return;
      }

      const { type, symbol, usdAmount, coinAmount, fees, total, coinData } =
        tradeData;

      try {
        if (type === "buy") {

          if (!coinData) {
            throw new Error("Coin data not found");
          }

          // Prepare purchase data for backend
          const purchaseData = {
            user_id: user.id,
            coin_id: coinData.id,
            coin_name: coinData.name,
            coin_symbol: coinData.symbol,
            coin_price_usd: coinData.current_price,
            quantity: parseFloat(coinAmount),
            total_cost: parseFloat(total),
            fees: parseFloat(fees),
            image: coinData.image,
          };

          // console.log("📤 Sending purchase data to backend:", purchaseData);

          // Call the actual purchase API
          const result = await addPurchase(purchaseData);

          // console.log("✅ Backend purchase response:", result);

          if (result.success) {
            toast.success(
              `Buy order executed! Bought ${coinAmount} ${symbol.toUpperCase()} for $${usdAmount}`,
              {
                icon: "✅",
                style: {
                  background: "#111827",
                  color: "#22c55e",
                  fontWeight: "600",
                  fontSize: "14px",
                  padding: "12px 16px",
                  borderRadius: "8px",
                },
              }
            );
          } else {
            throw new Error(result.error || "Purchase failed");
          }
        } else {

          if (!coinData) {
            throw new Error("Coin data not found");
          }

          const sellData = {
            user_id: user.id,
            coin_id: coinData.id,
            quantity: parseFloat(coinAmount),
            current_price: coinData.current_price,
          };

          // console.log("📤 Sending sell data to backend:", sellData);

          const result = await sellCoins(sellData);

          // console.log("✅ Backend sell response:", result);

          if (result.success) {
            toast.success(
              `Sell order executed! Sold ${coinAmount} ${symbol.toUpperCase()} for $${usdAmount}`,
              {
                icon: "✅",
                style: {
                  background: "#111827",
                  color: "#ef4444",
                  fontWeight: "600",
                  fontSize: "14px",
                  padding: "12px 16px",
                  borderRadius: "8px",
                },
              }
            );
          } else {
            throw new Error(result.error || "Sell failed");
          }
        }
      } catch (error) {
        console.error("❌ Trade execution error:", error);
        console.error(
          "❌ Error details:",
          error.response?.data || error.message
        );

        toast.error(
          error.message ||
            `${type === "buy" ? "Purchase" : "Sale"} failed. Please try again.`
        );
      }
    },
    [user, addPurchase, sellCoins]
  );

  // Reset form when modal opens/closes or coin changes
  useEffect(() => {
    if (show) {
      setUsdAmount("");
      setCoinAmount("");
      setSlippage(1.0);
      setIsSubmitting(false);
    }
  }, [show, coin]);

  // Handle USD amount change
  const handleUsdAmountChange = (e) => {
    const value = e.target.value;
    setUsdAmount(value);

    if (value && coin?.current_price) {
      const amount = parseFloat(value);
      if (!isNaN(amount) && amount > 0) {
        const calculatedCoins = amount / coin.current_price;
        setCoinAmount(calculatedCoins.toFixed(8));
      } else {
        setCoinAmount("");
      }
    }
  };

  // Handle coin amount change
  const handleCoinAmountChange = (e) => {
    const value = e.target.value;
    setCoinAmount(value);

    if (value && coin?.current_price) {
      const coins = parseFloat(value);
      if (!isNaN(coins) && coins > 0) {
        const calculatedUSD = coins * coin.current_price;
        setUsdAmount(calculatedUSD.toFixed(2));
      } else {
        setUsdAmount("");
      }
    }
  };

  // Calculate trading fees (mock calculation)
  const calculateFees = useMemo(() => {
    if (!usdAmount) return { amount: 0, percentage: 0.1 };
    const amount = parseFloat(usdAmount);
    const fee = amount * 0.001; // 0.1% trading fee
    return {
      amount: fee.toFixed(2),
      percentage: 0.1,
    };
  }, [usdAmount]);

  // Calculate total cost/earnings
  const calculateTotal = useMemo(() => {
    if (!usdAmount) return 0;
    const amount = parseFloat(usdAmount);
    const fee = calculateFees.amount;

    if (type === "buy") {
      return (amount + parseFloat(fee)).toFixed(2);
    } else {
      return (amount - parseFloat(fee)).toFixed(2);
    }
  }, [usdAmount, calculateFees, type]);

  const handleSubmit = async () => {
    if (!coin || !usdAmount || parseFloat(usdAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setIsSubmitting(true);
    try {
      await handleTradeSubmit({
        type,
        coin: coin.name,
        symbol: coin.symbol,
        usdAmount: parseFloat(usdAmount),
        coinAmount: parseFloat(coinAmount),
        slippage,
        fees: calculateFees.amount,
        total: parseFloat(calculateTotal),
        coinData: coin
      });
      onClose();
    } catch (error) {
      console.error("Trade error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!show || !coin) return null;

  const isBuy = type === "buy";
  const buttonColor = isBuy
    ? "from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
    : "from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm fade-in">
      <div className="bg-[#111827] border border-gray-700 rounded-2xl w-full max-w-md mx-4 shadow-2xl transform transition-all duration-300 scale-100">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg ${
                isBuy ? "bg-green-500/20" : "bg-red-500/20"
              }`}
            >
              <FaExchangeAlt
                className={isBuy ? "text-green-400" : "text-red-400"}
              />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {isBuy ? "Buy" : "Sell"} {coin.symbol?.toUpperCase()}
              </h2>
              <p className="text-gray-400 text-sm">
                Current Price: ${coin.current_price?.toLocaleString() || "0"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700 rounded-lg"
          >
            <FaTimes className="text-lg" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Amount Inputs */}
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Amount (USD)
              </label>
              <input
                type="number"
                placeholder="0.00"
                value={usdAmount}
                onChange={handleUsdAmountChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Amount ({coin.symbol?.toUpperCase()})
              </label>
              <input
                type="number"
                placeholder="0.00000000"
                value={coinAmount}
                onChange={handleCoinAmountChange}
                step="0.00000001"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>

          {/* Trading Details */}
          <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-600 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Price</span>
              <span className="text-white font-semibold">
                ${coin.current_price?.toLocaleString() || "0"}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-400">
                Trading Fee ({calculateFees.percentage}%)
              </span>
              <span className="text-yellow-400">${calculateFees.amount}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Slippage Tolerance</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={slippage}
                  onChange={(e) =>
                    setSlippage(parseFloat(e.target.value) || 1.0)
                  }
                  step="0.1"
                  min="0.1"
                  max="5"
                  className="w-16 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm text-center focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
                <span className="text-gray-400 text-sm">%</span>
              </div>
            </div>

            <div className="border-t border-gray-600 pt-3">
              <div className="flex justify-between text-base font-semibold">
                <span className="text-gray-300">
                  Total {isBuy ? "Cost" : "Earnings"}
                </span>
                <span className={isBuy ? "text-green-400" : "text-red-400"}>
                  ${calculateTotal}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-transparent text-gray-300 hover:text-white border border-gray-600 hover:border-gray-500 rounded-xl transition-all duration-200 hover:bg-gray-700/50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={
                !usdAmount || parseFloat(usdAmount) <= 0 || isSubmitting
              }
              className={`flex-1 px-4 py-3 bg-gradient-to-r ${buttonColor} text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : (
                <>
                  <FaExchangeAlt className="text-sm" />
                  {isBuy ? "Buy" : "Sell"} {coin.symbol?.toUpperCase()}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TradeModal;
