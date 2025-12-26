import React from "react";
import { useSelector } from "react-redux";
import useThemeCheck from "@/hooks/useThemeCheck";
import useUserContext from "@/hooks/useUserContext";
import { FaUserCircle, FaCheckCircle, FaWallet } from "react-icons/fa";
import { SERVER_URL } from "@/api/axiosConfig";

export default function UserProfileCard() {
  const isLight = useThemeCheck();
  const { user } = useUserContext();
  const { balance } = useSelector((state) => state.wallet);

  return (
    <div
      className={`
        p-3 rounded-xl shadow-lg h-full flex flex-col justify-center
        transition-all duration-300 ease-in-out hover:shadow-lg
        ${isLight
          ? "bg-white/70 backdrop-blur-xl shadow-md border border-gray-100 glass-card"
          : "bg-gray-900/95 backdrop-blur-none shadow-none border border-gray-700/50"
        }
      `}
    >
      <div className="flex items-center gap-3">
        { }
        <div className="relative">
          <div
            className={`
              w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden
              text-white font-bold text-lg shadow-lg transform hover:scale-105 transition-transform duration-300
              ${isLight
                ? "bg-gradient-to-br from-blue-500 to-cyan-400"
                : "bg-gradient-to-br from-blue-600 to-cyan-600"
              }
            `}
          >
            {user?.image ? (
              <img
                src={user.image.startsWith('http') ? user.image : `${SERVER_URL}/uploads/${user.image}`}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <FaUserCircle size={24} />
            )}
          </div>
          { }
          <div className="absolute -bottom-1 -right-1 bg-white dark:bg-gray-800 rounded-full p-0.5">
            <FaCheckCircle className="text-green-500 text-sm" />
          </div>
        </div>

        { }
        <div className="flex-1 min-w-0">
          <h3 className={`font-bold text-base truncate ${isLight ? "text-gray-900" : "text-white"}`}>
            {user?.name || "Guest User"}
          </h3>

          <div className="flex items-center gap-2 mt-0.5">
            <span
              className={`
                  px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider border
                  ${isLight
                  ? "bg-blue-50 text-blue-600 border-blue-100"
                  : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                }
                `}
            >
              {user?.role || "Trader"}
            </span>
            <span className={`text-xs ${isLight ? "text-gray-500" : "text-gray-400"}`}>
              • Verified
            </span>
          </div>
        </div>
      </div>

      { }
      <div className={`mt-4 pt-3 border-t ${isLight ? "border-gray-200" : "border-gray-700"}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 opacity-80">
            <div className={`p-1.5 rounded-lg ${isLight ? "bg-cyan-100 text-cyan-600" : "bg-cyan-400/10 text-cyan-400"}`}>
              <FaWallet className="text-xs" />
            </div>
            <span className={`text-xs font-medium ${isLight ? "text-gray-500" : "text-gray-400"}`}>
              Available Balance
            </span>
          </div>
          <div className={`font-bold text-lg ${isLight ? "text-gray-900" : "text-white"}`}>
            ${balance?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
      </div>
    </div>
  );
}
