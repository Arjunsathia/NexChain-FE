import useThemeCheck from "@/hooks/useThemeCheck";
import React, { useMemo } from "react";
import { FaGraduationCap, FaCommentDots, FaArrowRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function LearningHubWidget() {
  const isLight = useThemeCheck();
  const navigate = useNavigate();

  const TC = useMemo(
    () => ({
      bgCard: isLight
        ? "bg-white/70 backdrop-blur-xl shadow-md border border-gray-100 glass-card"
        : "bg-gray-900/95 backdrop-blur-none shadow-none border border-gray-700/50 glass-card",
      textPrimary: isLight ? "text-gray-900" : "text-white",
      textSecondary: isLight ? "text-gray-600" : "text-gray-400",
      iconBg: isLight
        ? "bg-blue-100 text-blue-600"
        : "bg-blue-500/20 text-blue-400",
      bgButton: isLight
        ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md hover:shadow-lg"
        : "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md hover:shadow-lg",
    }),
    [isLight],
  );

  return (
    <div
      className={`rounded-xl p-3 h-full flex flex-col transition-all duration-300 ease-in-out hover:shadow-lg ${TC.bgCard}`}
    >
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center gap-3 mb-2 flex-shrink-0">
          <div className={`p-2 rounded-lg ${TC.iconBg}`}>
            <FaGraduationCap className="text-sm" />
          </div>
          <div>
            <h3 className={`font-bold text-sm leading-tight ${TC.textPrimary}`}>
              Learning Hub
            </h3>
            <p className={`text-[10px] ${TC.textSecondary}`}>
              Educational Resources
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-2 pr-1">
          {[
            "Master crypto fundamentals and trading strategies. 📚",
            "Learn about DeFi, NFTs and Web3 ecosystem. 🌐",
            "Stay updated with latest market trends. 📈",
          ].map((text, i) => (
            <div key={i} className="flex items-start gap-2 flex-shrink-0">
              <div
                className={`w-1.5 h-1.5 mt-1.5 rounded-full ${isLight ? "bg-blue-400" : "bg-blue-500"}`}
              ></div>
              <div
                className={`flex-1 p-2 rounded-lg ${isLight ? "bg-gray-50 border border-gray-100" : "bg-gray-800/50 border border-gray-700/30"}`}
              >
                <p
                  className={`text-[11px] leading-relaxed font-medium ${TC.textSecondary}`}
                >
                  {text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-3 mt-auto flex-shrink-0">
        <button
          onClick={() => navigate("/learning")}
          className={`w-full py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${TC.bgButton}`}
        >
          Go to Learning Hub <FaArrowRight className="text-[10px]" />
        </button>
      </div>
    </div>
  );
}
