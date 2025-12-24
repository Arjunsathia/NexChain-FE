import useThemeCheck from '@/hooks/useThemeCheck';
import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { FaBell, FaTimes, FaArrowUp, FaArrowDown, FaPercentage } from "react-icons/fa";
import toast from "react-hot-toast";
import api from "@/api/axiosConfig";
import useUserContext from "@/hooks/useUserContext";

const PriceAlertModal = ({ show, onClose, coin }) => {
  const isLight = useThemeCheck();
  const { user } = useUserContext();
  const [targetPrice, setTargetPrice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Normalized current price
  const currentPrice = coin?.current_price || coin?.currentPrice || 0;

  // Reset state when modal opens
  useEffect(() => {
    if (show) {
      // Default to current price if no target set
      setTargetPrice(currentPrice);
      setIsSubmitting(false);
      // Small delay for animation
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
    }
  }, [show, currentPrice]);

  // Theme configuration
  const TC = useMemo(() => ({
    bgModal: isLight
      ? "bg-white shadow-2xl border border-gray-100"
      : "bg-[#1A1D26] shadow-2xl border border-gray-800",
    textPrimary: isLight ? "text-gray-900" : "text-white",
    textSecondary: isLight ? "text-gray-500" : "text-gray-400",
    textTertiary: isLight ? "text-gray-400" : "text-gray-600",
    bgCard: isLight ? "bg-gray-50" : "bg-gray-900/50",
    inputBorder: isLight
      ? "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
      : "border-gray-700 focus:border-blue-500 focus:ring-blue-500/20",
    chipBg: isLight ? "bg-gray-100 hover:bg-gray-200" : "bg-gray-800 hover:bg-gray-700",
    chipText: isLight ? "text-gray-600" : "text-gray-300",
  }), [isLight]);

  // Helper to apply percentage presets
  const applyPreset = (percent) => {
    const change = currentPrice * (percent / 100);
    const newPrice = currentPrice + change;
    setTargetPrice(parseFloat(newPrice.toFixed(newPrice < 1 ? 6 : 2)));
  };

  const handleInputChange = (e) => {
    setTargetPrice(e.target.value);
  };

  const handleSubmit = async () => {
    const priceValue = parseFloat(targetPrice);

    if (!priceValue || priceValue <= 0) {
      toast.error("Please enter a valid price");
      return;
    }

    setIsSubmitting(true);
    try {
      const condition = priceValue > currentPrice ? "above" : "below";
      const symbol = coin.symbol || coin.coinSymbol;

      const alertData = {
        user_id: user.id,
        coin_id: coin.id || coin.coinId,
        coin_symbol: symbol,
        coin_name: coin.name || coin.coinName,
        coin_image: coin.image,
        target_price: priceValue,
        condition,
      };

      const res = await api.post("/alerts/create", alertData);

      if (res.data.success) {
        toast.success(
          <div>
            <div className="font-semibold">Alert Created Successfully</div>
            <div className="text-xs font-normal opacity-90 mt-1">
              You&apos;ll be notified when {symbol.toUpperCase()} goes {condition} ${priceValue}
            </div>
          </div>
        );
        onClose();
      } else {
        throw new Error("Failed to create alert");
      }
    } catch (error) {
      console.error("Alert creation error:", error);
      toast.error(error.response?.data?.error || "Failed to create alert");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!show || !coin) return null;

  // Calculate percentage difference for UI
  const priceValue = parseFloat(targetPrice) || 0;
  const percentDiff = currentPrice > 0 ? ((priceValue - currentPrice) / currentPrice) * 100 : 0;
  const isAbove = priceValue > currentPrice;

  return createPortal(
    <div
      className={`fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4 transition-all duration-300 ${isVisible ? "bg-black/50 backdrop-blur-sm" : "bg-black/0 backdrop-blur-none pointer-events-none"
        }`}
      onClick={onClose}
    >
      <div
        className={`w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-6 relative transition-all duration-500 transform ${isVisible ? "translate-y-0 opacity-100 scale-100" : "translate-y-full sm:translate-y-8 opacity-0 sm:scale-95"
          } ${TC.bgModal}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className={`text-xl font-bold ${TC.textPrimary}`}>Set Price Alert</h2>
            <p className={`text-sm ${TC.textSecondary}`}>
              Get notified when price hits your target
            </p>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${TC.textSecondary}`}
          >
            <FaTimes />
          </button>
        </div>

        {/* Coin Info */}
        <div className={`flex items-center gap-4 p-4 rounded-xl mb-6 ${TC.bgCard}`}>
          <img src={coin.image} alt={coin.symbol} className="w-10 h-10 rounded-full" />
          <div>
            <div className="flex items-center gap-2">
              <span className={`font-bold ${TC.textPrimary}`}>{coin.name}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isLight ? "bg-gray-200 text-gray-600" : "bg-gray-700 text-gray-300"}`}>
                {coin.symbol?.toUpperCase()}
              </span>
            </div>
            <div className={`text-sm mt-0.5 ${TC.textSecondary}`}>
              Current: <span className={TC.textPrimary}>${currentPrice.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Main Input */}
        <div className="mb-6">
          <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${TC.textSecondary}`}>Target Price (USD)</label>
          <div className="relative">
            <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-lg ${TC.textSecondary}`}>$</div>
            <input
              type="number"
              value={targetPrice}
              onChange={handleInputChange}
              placeholder="0.00"
              className={`w-full pl-8 pr-4 py-4 text-2xl font-bold rounded-xl border bg-transparent bg-clip-padding transition-all focus:outline-none focus:ring-2 ${TC.inputBorder} ${TC.textPrimary}`}
              step="any"
            />
            {/* Direction Indicator */}
            {priceValue > 0 && priceValue !== currentPrice && (
              <div className={`absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none`}>
                <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-md ${isAbove
                  ? "text-green-600 bg-green-100 dark:bg-green-500/10 dark:text-green-400"
                  : "text-red-600 bg-red-100 dark:bg-red-500/10 dark:text-red-400"
                  }`}>
                  {isAbove ? <FaArrowUp /> : <FaArrowDown />}
                  {Math.abs(percentDiff).toFixed(2)}%
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Presets */}
        <div className="grid grid-cols-4 gap-2 mb-8">
          {[5, 10, -5, -10].map((percent) => (
            <button
              key={percent}
              onClick={() => applyPreset(percent)}
              className={`py-2 px-1 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-0.5 ${TC.chipBg} ${TC.chipText}`}
            >
              {percent > 0 ? '+' : ''}{percent}%
            </button>
          ))}
        </div>

        {/* Action Button */}
        <button
          onClick={handleSubmit}
          disabled={!priceValue || priceValue <= 0 || isSubmitting}
          className={`w-full py-4 px-4 rounded-xl font-bold text-white text-sm tracking-wide
            bg-gradient-to-r from-blue-600 to-cyan-500 
            hover:from-blue-700 hover:to-cyan-600
            shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30
            disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none
            transform transition-all duration-200 active:scale-[0.98]
            flex items-center justify-center gap-2`}
        >
          {isSubmitting ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <FaBell />
              Create Alert for ${priceValue ? parseFloat(priceValue).toLocaleString() : '0.00'}
            </>
          )}
        </button>
      </div>
    </div>,
    document.body
  );
};

export default PriceAlertModal;
