import React, { useState, useRef, useEffect } from "react";
import useThemeCheck from "@/hooks/useThemeCheck";
import { FaChevronDown } from "react-icons/fa";

const OrderTypeSelector = ({
  orderType,
  setOrderType,
  setIsAlertMode,
  isBuyOperation,
}) => {
  const isLight = useThemeCheck();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const types = ["market", "limit", "stop_limit"];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatType = (type) => type.replace("_", " ");

  return (
    <div className="relative mb-6 z-20" ref={dropdownRef}>
      <label
        className={`block text-[10px] font-bold uppercase tracking-wider mb-1.5 ${isLight ? "text-gray-500" : "text-gray-400"}`}
      >
        Order Type
      </label>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-bold capitalize transition-all duration-200
                    ${
                      isLight
                        ? "bg-white border-gray-200 text-gray-900 hover:border-gray-300 shadow-sm"
                        : "bg-white/5 border-white/10 text-white hover:border-white/20"
                    }
                `}
      >
        <span>{formatType(orderType)} Order</span>
        <FaChevronDown
          className={`text-xs transition-transform duration-200 ${isOpen ? "rotate-180" : ""} ${isLight ? "text-gray-400" : "text-gray-500"}`}
        />
      </button>

      {/* Dropdown Menu */}
      <div
        className={`
                absolute top-full left-0 w-full mt-2 rounded-xl border shadow-xl overflow-hidden transition-all duration-200 origin-top
                ${isLight ? "bg-white border-gray-100" : "bg-[#1E2026] border-white/5"}
                ${isOpen ? "opacity-100 scale-100 translate-y-0 pointer-events-auto" : "opacity-0 scale-95 -translate-y-2 pointer-events-none"}
            `}
      >
        {types.map((type) => {
          const isActive = orderType === type;
          return (
            <button
              key={type}
              onClick={() => {
                setOrderType(type);
                setIsAlertMode(false);
                setIsOpen(false);
              }}
              className={`
                                w-full text-left px-4 py-3 text-sm font-semibold capitalize flex items-center justify-between transition-colors
                                ${
                                  isActive
                                    ? isLight
                                      ? "bg-gray-50 text-gray-900"
                                      : "bg-white/5 text-white"
                                    : isLight
                                      ? "text-gray-600 hover:bg-gray-50"
                                      : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
                                }
                            `}
            >
              <span>{formatType(type)}</span>
              {isActive && (
                <div
                  className={`w-1.5 h-1.5 rounded-full ${isBuyOperation ? "bg-emerald-500" : "bg-rose-500"}`}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default OrderTypeSelector;
