import React from "react";
import { FaCoins, FaArrowUp, FaArrowDown } from "react-icons/fa";

const TradeModalTabs = React.memo(({ activeTab, setActiveTab, isLight }) => {
  return (
    <div className="px-4 pt-3 pb-1">
      <div
        className={`flex p-0.5 rounded-lg ${isLight ? "bg-gray-100 border border-gray-200" : "bg-gray-800 border-gray-700"}`}
      >
        {[
          {
            key: "details",
            label: "Holdings",
            icon: FaCoins,
          },
          {
            key: "deposit",
            label: "Buy",
            icon: FaArrowUp,
            activeColor: "bg-emerald-500 text-white shadow-emerald-500/20",
            textColor: "text-emerald-500",
          },
          {
            key: "withdraw",
            label: "Sell",
            icon: FaArrowDown,
            activeColor: "bg-rose-500 text-white shadow-rose-500/20",
            textColor: "text-rose-500",
          },
        ].map((tab) => {
          const isActive = activeTab === tab.key;

          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`
                flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-bold transition-all duration-300
                ${
                  isActive
                    ? `${tab.activeColor || (isLight ? "bg-white text-gray-900 shadow-sm" : "bg-gray-800 text-white shadow-sm")}`
                    : `text-gray-500 hover:text-gray-900 dark:hover:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5`
                }
              `}
            >
              <tab.icon
                className={`text-[10px] ${isActive ? "text-inherit" : tab.textColor || "text-gray-400"}`}
              />
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
});

TradeModalTabs.displayName = "TradeModalTabs";
export default TradeModalTabs;
