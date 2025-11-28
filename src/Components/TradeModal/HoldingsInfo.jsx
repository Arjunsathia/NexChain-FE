import React from "react";
import { FaCoins, FaArrowUp, FaArrowDown } from "react-icons/fa";

const HoldingsInfo = ({ holdingsSummary, activeTab, isLight, TC, symbol }) => {
  if (!holdingsSummary) return null;

  return (
    <div
      className={`mb-4 p-5 rounded-xl glow-fade transition-all duration-300 ${
        activeTab === "details"
          ? "bg-cyan-500/5 border border-cyan-500/20 shadow-lg shadow-cyan-500/5"
          : `${TC.bgCard}`
      }`}
    >
      <h3
        className={`text-sm font-bold mb-3 flex items-center gap-2 ${
          isLight ? "text-cyan-700" : "text-cyan-400"
        }`}
      >
        <FaCoins className="text-yellow-500 " />
        Holdings Summary
      </h3>

      <div className="grid grid-cols-2 gap-3 mb-3">
        {[
          {
            label: "Quantity",
            value: holdingsSummary.totalQuantity.toFixed(6),
            suffix: symbol,
          },
          {
            label: "Current Value",
            value: `$${holdingsSummary.currentValue.toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`,
            suffix: "USD",
          },
          {
            label: "Avg. Price",
            value: `$${holdingsSummary.averagePrice.toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: holdingsSummary.averagePrice < 1 ? 6 : 2,
            })}`,
            suffix: "",
          },
          {
            label: "Investment",
            value: `$${holdingsSummary.remainingInvestment.toLocaleString(
              "en-IN",
              { minimumFractionDigits: 2, maximumFractionDigits: 2 }
            )}`,
            suffix: "",
          },
        ].map((item, index) => (
          <div
            key={index}
            className={`rounded-lg p-2 border fade-in hover:scale-105 transition-all duration-300 ${TC.bgCard}`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className={`text-xs mb-1 ${TC.textTertiary}`}>{item.label}</div>
            <div className={`text-sm font-bold ${TC.textPrimary}`}>
              {item.value}
            </div>
            <div className="text-xs text-cyan-600">{item.suffix}</div>
          </div>
        ))}
      </div>

      {/* Profit/Loss Section */}
      <div
        className={`p-3 rounded-lg border transition-all duration-300 hover:scale-105 ${
          holdingsSummary.profitLoss >= 0
            ? `${
                isLight
                  ? "bg-green-100/50 border-green-500/50"
                  : "bg-green-500/10 border-green-500/30"
              }`
            : `${
                isLight
                  ? "bg-red-100/50 border-red-500/50"
                  : "bg-red-500/10 border-red-500/30"
              }`
        }`}
      >
        <div className="flex justify-between items-center">
          <span className={`text-sm font-semibold ${TC.textSecondary}`}>
            Total P&L
          </span>
          <div
            className={`flex items-center gap-2 ${
              holdingsSummary.profitLoss >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {holdingsSummary.profitLoss >= 0 ? (
              <FaArrowUp className="text-sm animate-bounce" />
            ) : (
              <FaArrowDown className="text-sm animate-bounce" />
            )}
            <span className="text-base font-bold">
              $
              {Math.abs(holdingsSummary.profitLoss).toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
            <span
              className={`text-xs font-bold px-2 py-1 rounded-full ${
                holdingsSummary.profitLoss >= 0 ? TC.bgGreenPill : TC.bgRedPill
              }`}
            >
              {holdingsSummary.profitLoss >= 0 ? "+" : ""}
              {holdingsSummary.profitLossPercentage.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HoldingsInfo;
