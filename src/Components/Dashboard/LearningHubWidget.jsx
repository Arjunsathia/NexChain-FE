import useThemeCheck from '@/hooks/useThemeCheck';
import React, { useMemo } from "react";
import { FaGraduationCap, FaCommentDots, FaArrowRight } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';

export default function LearningHubWidget() {
  const isLight = useThemeCheck();
  const navigate = useNavigate();

  const TC = useMemo(() => ({
    bgCard: isLight 
      ? "bg-white/70 backdrop-blur-xl shadow-[0_6px_25px_rgba(0,0,0,0.12),0_0_10px_rgba(0,0,0,0.04)] border border-gray-100" 
      : "bg-gray-800/50 backdrop-blur-xl shadow-xl border border-gray-700/50",
    textPrimary: isLight ? "text-gray-900" : "text-white",
    textSecondary: isLight ? "text-gray-600" : "text-gray-400",
    iconBg: isLight ? "bg-blue-100 text-blue-600" : "bg-blue-500/20 text-blue-400",
    bgButton: isLight 
       ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md hover:shadow-lg" 
       : "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md hover:shadow-lg",
  }), [isLight]);

  return (
    <div className={`rounded-xl p-3 h-full flex flex-col justify-between ${TC.bgCard}`}>
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${TC.iconBg}`}>
          <FaGraduationCap className="text-sm" />
        </div>
        <div>
           <h3 className={`font-bold text-sm leading-tight ${TC.textPrimary}`}>Learning Hub</h3>
           <p className={`text-[10px] ${TC.textSecondary}`}>Educational Resources</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center py-2 space-y-2">
        <div className="flex items-start gap-2">
           <div className={`p-1.5 rounded-br-xl rounded-tr-xl rounded-bl-xl bg-gray-100 dark:bg-gray-700/50`}>
              <p className={`text-[11px] leading-relaxed line-clamp-2 ${TC.textSecondary}`}>
                 Master crypto fundamentals and trading strategies. 📚
              </p>
           </div>
        </div>
      </div>

      <button 
        onClick={() => navigate('/learning')} 
        className={`w-full py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${TC.bgButton}`}
      >
        Go to Learning Hub <FaArrowRight className="text-[10px]" />
      </button>
    </div>
  );
}
