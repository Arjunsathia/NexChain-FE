import React from "react";
import { FaUsers } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import { SERVER_URL } from "@/api/axiosConfig";

function LatestUsers({ users, isLoading, TC }) {
  const navigate = useNavigate();

  return (
    <div className={`${TC.bgCard} rounded-2xl p-4 sm:p-6`}>
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2
          className={`text-sm sm:text-lg font-bold ${TC.textPrimary} flex items-center gap-2`}
        >
          <FaUsers className="text-blue-400 text-xs sm:text-base" /> Newest
          Members
        </h2>
        <button
          onClick={() => navigate("/admin/users")}
          className="text-[10px] sm:text-xs font-bold px-3 py-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 transition-all"
        >
          View All
        </button>
      </div>
      {/* Users List */}
      <div className="max-h-[400px] overflow-y-auto no-scrollbar space-y-3">
        {isLoading ? (
          <>
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 p-3 rounded-xl ${TC.bgItem} animate-pulse`}
              >
                <div className="w-10 h-10 rounded-full bg-gray-700/20" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-20 bg-gray-700/20 rounded" />
                  <div className="h-2 w-32 bg-gray-700/20 rounded" />
                </div>
              </div>
            ))}
          </>
        ) : (
          users.map((user, i) => (
            <div
              key={user.id ?? i}
              className={`group flex items-center gap-3 p-3 rounded-2xl ${TC.bgItem} transition-all duration-300 hover:shadow-lg hover:shadow-black/5`}
            >
              {/* Avatar Section */}
              <div className="relative">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 p-0.5 shadow-md group-hover:shadow-blue-500/20 transition-all">
                  <div className="w-full h-full rounded-[10px] overflow-hidden bg-gray-900 flex items-center justify-center text-xs font-bold text-white relative">
                    {user.image ? (
                      <img
                        src={user.image.startsWith('http') ? user.image : `${SERVER_URL}/uploads/${user.image}`}
                        alt={user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      (user.name || "U").charAt(0)
                    )}
                  </div>
                </div>
              </div>

              {/* Info Details - Split Layout */}
              <div className="min-w-0 flex-1 flex flex-col justify-center gap-0.5">
                <div className="flex justify-between items-center">
                  <h4 className={`font-bold ${TC.textPrimary} text-xs sm:text-sm truncate pr-2`}>
                    {user.name}
                  </h4>
                  <span className={`text-[10px] font-medium ${TC.textTertiary} whitespace-nowrap opacity-70`}>
                    {user.joinDate}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <p className={`text-[10px] sm:text-xs ${TC.textSecondary} truncate mr-2`}>
                    {user.email}
                  </p>
                  <span className={`text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/10`}>
                    {user.role}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
        {!isLoading && users.length === 0 && (
          <div className={`text-center ${TC.textSecondary} py-8 text-xs sm:text-sm`}>
            No users found
          </div>
        )}
      </div>
    </div>
  );
}

export default LatestUsers;
