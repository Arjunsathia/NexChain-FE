import React from "react";
import { FaWallet } from "react-icons/fa";

function HoldingsBadge({ hasHoldings, userHoldings, coin, isLight }) {
  if (!hasHoldings) return null;

  return (
    <div
      className={`rounded-2xl px-4 py-3 fade-in ${
        isLight ? "bg-green-50" : "bg-green-500/10"
      }`}
      style={{ animationDelay: "0.1s" }}
    >
      <div className="flex items-center gap-3">
        <div
          className={`p-2 rounded-lg ${
            isLight ? "bg-green-100" : "bg-green-500/20"
          }`}
        >
          <FaWallet
            className={`text-base ${
              isLight ? "text-green-600" : "text-green-400"
            }`}
          />
        </div>
        <div>
          <p
            className={`text-sm font-semibold ${
              isLight ? "text-green-900" : "text-green-400"
            }`}
          >
            You own this asset
          </p>
          <p
            className={`text-xs truncate ${
              isLight ? "text-green-700" : "text-green-500"
            }`}
          >
            {(userHoldings.totalQuantity || userHoldings.quantity || 0).toFixed(
              6
            )}{" "}
            {coin.symbol?.toUpperCase()}
          </p>
        </div>
      </div>
    </div>
  );
}

export default HoldingsBadge;
