import React from "react";
import { FaUsers } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function LatestUsers({ users, isLoading, TC }) {
  const navigate = useNavigate();

  return (
    <div className={`${TC.bgCard} rounded-2xl p-4 sm:p-6`}>
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2
          className={`text-base sm:text-lg font-bold ${TC.textPrimary} flex items-center gap-2`}
        >
          <FaUsers className="text-blue-400 text-sm sm:text-base" /> Newest
          Members
        </h2>
        <button
          onClick={() => navigate("/admin/users")}
          className="text-xs font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          View All
        </button>
      </div>
      {/* Scrollable user list - max 10 users, hidden scrollbar */}
      <div className="max-h-[400px] overflow-y-auto scrollbar-hide space-y-2 sm:space-y-3">
        {isLoading ? (
          <>
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={`flex items-center justify-between p-2 sm:p-3 rounded-xl ${TC.bgItem} animate-pulse`}
              />
            ))}
          </>
        ) : (
          users.map((user, i) => (
            <div
              key={user.id ?? i}
              className={`flex items-center justify-between p-2 sm:p-3 rounded-xl ${TC.bgItem} transition-all duration-200`}
            >
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs sm:text-sm font-bold text-white shadow-lg flex-shrink-0">
                  {(user.name || "U").charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <h4
                    className={`font-medium ${TC.textPrimary} text-xs sm:text-sm truncate`}
                  >
                    {user.name}
                  </h4>
                  <p
                    className={`text-[10px] sm:text-xs ${TC.textSecondary} truncate`}
                  >
                    {user.email}
                  </p>
                </div>
              </div>
              <div className="text-right flex-shrink-0 ml-2">
                <span
                  className={`block text-xs font-medium ${TC.textSecondary}`}
                >
                  {user.role}
                </span>
                <span className={`block text-[10px] ${TC.textTertiary}`}>
                  {user.joinDate}
                </span>
              </div>
            </div>
          ))
        )}
        {!isLoading && users.length === 0 && (
          <div className={`text-center ${TC.textSecondary} py-8 text-sm`}>
            No users found
          </div>
        )}
      </div>

      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}

export default LatestUsers;
