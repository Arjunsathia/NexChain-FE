
import React, { useState } from "react";
import useThemeCheck from "@/hooks/useThemeCheck";
import { FaChevronRight, FaCog } from "react-icons/fa";

const AdvancedOptions = ({ slippage, setSlippage, orderType }) => {
    const [isOpen, setIsOpen] = useState(false);
    const isLight = useThemeCheck();

    if (orderType !== "market") return null;

    return (
        <div className="mt-4">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 text-xs font-semibold transition-colors ${isLight ? "text-gray-500 hover:text-gray-700" : "text-gray-400 hover:text-gray-200"
                    }`}
            >
                <FaCog className={isOpen ? "rotate-90 transition-transform" : "transition-transform"} />
                <span>Advanced Options</span>
                <FaChevronRight className={`ml-auto text-[10px] transition-transform ${isOpen ? "rotate-90" : ""}`} />
            </button>

            {isOpen && (
                <div className={`mt-3 p-4 rounded-xl border ${isLight ? "bg-gray-50 border-gray-200" : "bg-white/5 border-white/5"
                    } animate-in slide-in-from-top-2 duration-200`}>
                    <div className="flex justify-between items-center">
                        <div className="flex flex-col">
                            <span className={`text-xs font-medium ${isLight ? "text-gray-700" : "text-gray-200"}`}>
                                Slippage Tolerance
                            </span>
                            <span className={`text-[10px] ${isLight ? "text-gray-400" : "text-gray-500"}`}>
                                Your transaction will revert if the price changes unfavorably by more than this percentage.
                            </span>
                        </div>
                        <div className={`flex items-center gap-1 px-3 py-2 rounded-lg border ${isLight ? "bg-white border-gray-200" : "bg-black/20 border-white/10"
                            }`}>
                            <input
                                type="number"
                                value={slippage}
                                onChange={(e) => {
                                    const val = parseFloat(e.target.value);
                                    if (val >= 0 && val <= 50) setSlippage(val);
                                }}
                                className={`w-12 text-right bg-transparent outline-none text-sm font-mono font-bold ${isLight ? "text-gray-900" : "text-white"
                                    }`}
                            />
                            <span className={`text-xs ${isLight ? "text-gray-400" : "text-gray-500"}`}>%</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdvancedOptions;
