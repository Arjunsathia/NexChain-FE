import React from "react";
import { FaCoins, FaArrowUp, FaArrowDown } from "react-icons/fa";

const TradeModalTabs = React.memo(({ activeTab, setActiveTab, isLight, TC }) => {
  return (
    <div className={`${TC.bgTabBase} border-b ${TC.borderTab}`}>
      <div className="flex">
        {[
          {
            key: "details",
            label: "Holdings",
            icon: FaCoins,
            color: "cyan",
            text: "text-cyan-600",
          },
          {
            key: "deposit",
            label: "Deposit",
            icon: FaArrowUp,
            color: "green",
            text: "text-green-600",
          },
          {
            key: "withdraw",
            label: "Withdraw",
            icon: FaArrowDown,
            color: "red",
            text: "text-red-600",
          },
        ].map((tab) => {
          const Icon = tab.icon;
          const tabIsActive = activeTab === tab.key;
          const tabClasses = tabIsActive
            ? `${tab.text} ${isLight ? "bg-cyan-500/10" : "bg-cyan-500/10"}`
            : `${TC.textTertiary} hover:${TC.textPrimary}`;

          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-3 px-2 text-sm font-bold transition-all relative group ${tabClasses}`}
            >
              <div className="flex items-center justify-center gap-1">
                <Icon
                  className={`text-sm transition-all duration-300 ${tabIsActive
                    ? "animate-bounce"
                    : "group-hover:scale-110 group-hover:-translate-y-0.5"
                    }`}
                />
                {tab.label}
              </div>
              {tabIsActive && (
                <div
                  className={`absolute bottom-0 left-0 right-0 h-0.5 transition-all duration-300 ${tab.key === "details"
                    ? "bg-cyan-600"
                    : tab.key === "deposit"
                      ? "bg-green-600"
                      : "bg-red-600"
                    }`}
                ></div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
});

TradeModalTabs.displayName = "TradeModalTabs";
export default TradeModalTabs;
