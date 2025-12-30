
import React from "react";
import useThemeCheck from "@/hooks/useThemeCheck";
import { FaInfoCircle } from "react-icons/fa";

const TradeSummary = ({
    maxAvailable,
    totalCost,
    isBuyOperation,
    symbol
}) => {
    const isLight = useThemeCheck();

    return (
        <div className={`mt-6 p-4 rounded-xl border ${isLight ? "bg-gray-50/50 border-gray-200/60" : "bg-white/5 border-white/5"} space-y-3`}>
            {/* Available Balance Row */}
            <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <FaInfoCircle className="text-gray-400" /> Available
                </span>
                <span className="font-medium text-gray-900 dark:text-gray-200">
                    {maxAvailable.toFixed(6)} {symbol}
                </span>
            </div>

            <div className="h-px bg-gray-200 dark:bg-white/10 my-2" />

            {/* Total Cost Row */}
            <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {isBuyOperation ? "Estimated Cost" : "Total Receive"}
                </span>
                <span className={`text-lg font-bold ${isBuyOperation ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                    ${totalCost}
                </span>
            </div>
        </div>
    );
};

export default TradeSummary;
