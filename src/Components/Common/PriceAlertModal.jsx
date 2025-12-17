import useThemeCheck from '@/hooks/useThemeCheck';
import React, { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { FaBell, FaTimes, FaChevronUp, FaChevronDown, FaEdit } from "react-icons/fa";
import toast from "react-hot-toast";
import api from "@/api/axiosConfig";
import useUserContext from "@/hooks/useUserContext";



const PriceAlertModal = ({ show, onClose, coin }) => {
  const isLight = useThemeCheck();
  const { user } = useUserContext();
  const [selectedPrice, setSelectedPrice] = useState(0);
  const manualInputRef = useRef(null);
  const [manualPrice, setManualPrice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const scrollContainerRef = useRef(null);

  const currentPrice = coin?.current_price || coin?.currentPrice || 0;

  // Generate price range around current price
  const priceRange = useMemo(() => {
    if (!currentPrice) return [];
    
    const step = currentPrice < 1 ? 0.0001 : currentPrice < 10 ? 0.01 : currentPrice < 100 ? 0.1 : 1;
    const range = [];
    const count = 50;
    
    for (let i = -count; i <= count; i++) {
      const price = currentPrice + (i * step);
      if (price > 0) {
        range.push(parseFloat(price.toFixed(price < 1 ? 6 : price < 10 ? 4 : 2)));
      }
    }
    
    return range;
  }, [currentPrice]);

  useEffect(() => {
    if (show) {
      setSelectedPrice(currentPrice);
      setManualPrice("");
      setIsSubmitting(false);
      setTimeout(() => setIsVisible(true), 10);
      
      setTimeout(() => {
        if (scrollContainerRef.current) {
          const centerIndex = Math.floor(priceRange.length / 2);
          const itemHeight = 40;
          scrollContainerRef.current.scrollTop = centerIndex * itemHeight - 80;
        }
      }, 100);
    } else {
      setIsVisible(false);
    }
  }, [show, currentPrice, priceRange.length]);

  const TC = useMemo(
    () => ({
      bgModal: isLight
        ? "bg-white/95 backdrop-blur-xl border border-gray-200 shadow-2xl"
        : "bg-gray-900/95 backdrop-blur-xl border border-gray-800 shadow-2xl",
      textPrimary: isLight ? "text-gray-900" : "text-white",
      textSecondary: isLight ? "text-gray-600" : "text-gray-400",
      textTertiary: isLight ? "text-gray-500" : "text-gray-500",
      bgCard: isLight
        ? "bg-gray-100 border-gray-200"
        : "bg-gray-900 border-gray-700",
      inputBg: isLight
        ? "bg-white border-gray-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 text-gray-900 placeholder-gray-400"
        : "bg-gray-800 border-gray-700 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 text-white placeholder-gray-500",
    }),
    [isLight]
  );

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    
    const scrollTop = scrollContainerRef.current.scrollTop;
    const itemHeight = 40;
    const centerIndex = Math.round((scrollTop + 80) / itemHeight);
    
    if (priceRange[centerIndex]) {
      setSelectedPrice(priceRange[centerIndex]);
      setManualPrice(""); // Clear manual input when scrolling
    }
  };

  const scrollToPrice = (direction) => {
    if (!scrollContainerRef.current) return;
    
    const currentIndex = priceRange.indexOf(selectedPrice);
    const newIndex = direction === 'up' ? Math.max(0, currentIndex - 1) : Math.min(priceRange.length - 1, currentIndex + 1);
    
    const itemHeight = 40;
    scrollContainerRef.current.scrollTop = newIndex * itemHeight - 80;
  };

  const handleManualPriceChange = (e) => {
    const value = e.target.value;
    setManualPrice(value);
    if (value && parseFloat(value) > 0) {
      setSelectedPrice(parseFloat(value));
    }
  };

  const handleSubmit = async () => {
    const targetPrice = manualPrice ? parseFloat(manualPrice) : selectedPrice;
    
    if (!targetPrice || targetPrice <= 0) {
      toast.error("Please enter a valid target price");
      return;
    }

    setIsSubmitting(true);
    try {
      const condition = targetPrice > currentPrice ? "above" : "below";
      const symbol = coin.symbol || coin.coinSymbol;

      const alertData = {
        user_id: user.id,
        coin_id: coin.id || coin.coinId,
        coin_symbol: symbol,
        coin_name: coin.name || coin.coinName,
        coin_image: coin.image,
        target_price: parseFloat(targetPrice),
        condition,
      };

      const res = await api.post("/alerts/create", alertData);
      if (res.data.success) {
        toast.success(
          `Alert Set: ${symbol.toUpperCase()} ${condition} $${parseFloat(
            targetPrice
          ).toFixed(2)}`,
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

  const displayPrice = manualPrice ? parseFloat(manualPrice) || 0 : selectedPrice;

  return createPortal(
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-all duration-300 ${
        isVisible ? "bg-black/60 backdrop-blur-sm" : "bg-black/0 backdrop-blur-none pointer-events-none"
      }`}
      onClick={onClose}
    >
      <div
        className={`w-full max-w-sm rounded-2xl p-5 relative transition-all duration-500 transform ${
          isVisible ? "scale-100 opacity-100 translate-y-0" : "scale-95 opacity-0 translate-y-4"
        } ${TC.bgModal}`}
        onClick={(e) => e.stopPropagation()}
      >

        {/* Header */}
        <div className="flex justify-between items-start mb-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isLight ? "bg-cyan-50 text-cyan-600" : "bg-cyan-900/20 text-cyan-400"}`}>
              <FaBell className="text-lg" />
            </div>
            <div>
              <h2 className={`text-lg font-bold ${TC.textPrimary}`}>Set Price Alert</h2>
              <div className="flex items-center gap-1.5">
                <img src={coin.image} alt={coin.symbol} className="w-4 h-4 rounded-full" />
                <p className={`text-xs font-semibold ${TC.textSecondary}`}>
                  Current: ${currentPrice.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all ${TC.textSecondary} hover:rotate-90 duration-300`}
          >
            <FaTimes className="text-sm" />
          </button>
        </div>

        {/* Scrollable Price Picker */}
        <div className="relative mb-4 z-10">
          {/* Up Arrow */}
          <button
            onClick={() => scrollToPrice('up')}
            className={`absolute top-0 left-1/2 -translate-x-1/2 z-10 p-1.5 rounded-full ${isLight ? "bg-white text-gray-600 hover:bg-gray-100" : "bg-gray-800 text-gray-300 hover:bg-gray-700"} transition-all border ${isLight ? "border-gray-200" : "border-gray-700"}`}
          >
            <FaChevronUp className="text-xs" />
          </button>

          {/* Selection Highlight */}
          <div className={`absolute top-1/2 left-0 right-0 -translate-y-1/2 h-10 border-2 border-cyan-500 rounded-lg pointer-events-none z-10 ${isLight ? "bg-cyan-50/50" : "bg-cyan-900/20"}`}></div>

          {/* Scrollable Container */}
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className={`h-40 overflow-y-scroll scrollbar-hide relative ${TC.bgCard} rounded-xl border-2`}
            style={{
              scrollSnapType: 'y mandatory',
              scrollBehavior: 'smooth',
            }}
          >
            <div className="h-20"></div>
            
            {priceRange.map((price, index) => (
              <div
                key={index}
                className={`h-10 flex items-center justify-center text-base font-bold transition-all cursor-pointer ${
                  Math.abs(price - selectedPrice) < 0.0001
                    ? `${TC.textPrimary} scale-105`
                    : `${TC.textTertiary} scale-90 opacity-40`
                }`}
                style={{ scrollSnapAlign: 'center' }}
                onClick={() => {
                  const itemHeight = 40;
                  scrollContainerRef.current.scrollTop = index * itemHeight - 80;
                }}
              >
                ${price.toLocaleString(undefined, {
                  minimumFractionDigits: price < 1 ? 6 : 2,
                  maximumFractionDigits: price < 1 ? 6 : 2,
                })}
              </div>
            ))}
            
            <div className="h-20"></div>
          </div>

          {/* Down Arrow */}
          <button
            onClick={() => scrollToPrice('down')}
            className={`absolute bottom-0 left-1/2 -translate-x-1/2 z-10 p-1.5 rounded-full ${isLight ? "bg-white text-gray-600 hover:bg-gray-100" : "bg-gray-800 text-gray-300 hover:bg-gray-700"} transition-all border ${isLight ? "border-gray-200" : "border-gray-700"}`}
          >
            <FaChevronDown className="text-xs" />
          </button>
        </div>

        {/* Alert Direction Indicator */}
        <div className={`text-center mb-3 p-3 rounded-xl relative z-10 transition-all duration-300 ${
          displayPrice > currentPrice 
            ? "bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-500/30" 
            : "bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border border-red-200 dark:border-red-500/30"
        }`}>
          <div className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${TC.textSecondary}`}>Target Price</div>
          <div className={`text-xs font-bold uppercase tracking-wide ${displayPrice > currentPrice ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
            {displayPrice > currentPrice ? "ABOVE" : "BELOW"}
          </div>
          <div className={`text-2xl font-black flex justify-center items-center`}>
            <span className={`${displayPrice > currentPrice ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"}`}>$</span>
            <input
              type="number"
              ref={manualInputRef}
              value={manualPrice || (selectedPrice > 0 ? selectedPrice : "")}
              onChange={handleManualPriceChange}
              placeholder="0.00"
              className={`bg-transparent text-center w-48 focus:outline-none focus:border-b-2 border-current ${displayPrice > currentPrice ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"}`}
              step="0.01"
            />
          </div>
          <div className={`text-xs mt-1 font-semibold ${TC.textTertiary}`}>
            {displayPrice > currentPrice ? "+" : ""}{currentPrice > 0 ? ((displayPrice - currentPrice) / currentPrice * 100).toFixed(2) : "0.00"}%
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={(!manualPrice && !selectedPrice) || displayPrice <= 0 || isSubmitting}
          className={`w-full py-3 px-4 font-bold text-sm rounded-xl 
                      transition-all duration-300 
                      disabled:opacity-50 disabled:cursor-not-allowed 
                      flex items-center justify-center gap-2 
                      hover:scale-[1.02] active:scale-[0.98] 
                      bg-gradient-to-r from-cyan-600 to-blue-600 
                      hover:from-cyan-700 hover:to-blue-700 
                      text-white
                      relative z-10`}
        >

          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Setting Alert...</span>
            </>
          ) : (
            <>
              <FaBell className="text-sm" />
              <span>Set Price Alert</span>
            </>
          )}
        </button>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>,
    document.body
  );
};

export default PriceAlertModal;
