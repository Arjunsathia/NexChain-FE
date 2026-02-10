import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { FaCrown, FaTrophy, FaMedal } from "react-icons/fa";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import useThemeCheck from "@/hooks/useThemeCheck";
import api from "@/api/axiosConfig";
import { useSelector } from "react-redux";

const LeaderboardWidget = () => {
    const isLight = useThemeCheck();
    const { user: currentUser } = useSelector((state) => state.user);

    // --- Fetch Leaderboard Data ---
    const { data: users = [], isLoading, error } = useQuery({
        queryKey: ["leaderboard"],
        queryFn: async () => {
            const { data } = await api.get("/users/leaderboard");
            return Array.isArray(data) ? data : [];
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    // --- Theme Config ---
    const TC = useMemo(
        () => ({
            bgCard: isLight
                ? "bg-white/80 backdrop-blur-xl border border-white/50 shadow-xl shadow-blue-500/5 ring-1 ring-white/50"
                : "bg-[#0B1221]/80 backdrop-blur-xl border border-white/10 shadow-2xl shadow-cyan-500/10 ring-1 ring-white/5",
            textPrimary: isLight ? "text-slate-900" : "text-white",
            textSecondary: isLight ? "text-slate-500" : "text-slate-400",
            podiumBase: isLight
                ? "bg-gradient-to-t from-slate-100 to-white/50 border-t border-white"
                : "bg-gradient-to-t from-slate-900/50 to-slate-800/30 border-t border-white/5",
            itemHover: isLight
                ? "hover:bg-white hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-0.5 border-transparent hover:border-blue-100"
                : "hover:bg-white/5 hover:shadow-lg hover:shadow-cyan-500/10 hover:-translate-y-0.5 border-transparent hover:border-white/10",
            crown: "text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]",
            rankBadge: isLight ? "bg-slate-100 text-slate-600" : "bg-slate-800 text-slate-400",
        }),
        [isLight]
    );

    const top3 = users.slice(0, 3);
    const rest = users.slice(3, 10);

    if (isLoading) {
        return (
            <div className={`p-8 rounded-3xl ${TC.bgCard} w-full h-[400px] flex items-center justify-center`}>
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                    <span className="text-sm font-medium opacity-50">Loading rankings...</span>
                </div>
            </div>
        );
    }

    if (error) return null;

    return (
        <div className={`rounded-3xl w-full overflow-hidden relative ${TC.bgCard}`}>
            {/* Ambient Glows */}
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-blue-500/20 blur-[120px] rounded-full pointer-events-none -z-10 mix-blend-screen" />
            <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-purple-500/20 blur-[100px] rounded-full pointer-events-none -z-10 mix-blend-screen" />

            <div className="p-6 md:p-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl ${isLight ? "bg-blue-50 text-blue-600" : "bg-blue-500/20 text-blue-400"}`}>
                            <FaTrophy className="text-xl" />
                        </div>
                        <div>
                            <h3 className={`font-black text-xl tracking-tight ${TC.textPrimary}`}>Leaderboard</h3>
                            <p className={`text-xs font-medium uppercase tracking-wider ${TC.textSecondary}`}>Top Performers</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 lg:gap-12 items-end">

                    {/* Podium Section (Left - 5 Cols) */}
                    <div className="xl:col-span-5 flex items-end justify-center gap-2 sm:gap-4 h-[320px] pb-4 select-none">
                        {/* 2nd Place */}
                        {top3[1] && (
                            <motion.div
                                initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                                className="flex flex-col items-center group relative cursor-pointer"
                            >
                                <div className="relative mb-3 transition-transform duration-300 group-hover:scale-105">
                                    <div className="absolute inset-0 bg-gray-300 rounded-full blur-lg opacity-40 group-hover:opacity-60 transition-opacity"></div>
                                    <img
                                        src={top3[1].image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${top3[1].name}`}
                                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-gray-300 shadow-xl object-cover relative z-10"
                                        alt={top3[1].name}
                                    />
                                    <div className="absolute -bottom-2 lg:-right-0 left-1/2 -translate-x-1/2 lg:translate-x-0 bg-gray-300 text-white text-[10px] sm:text-xs font-black px-2 py-0.5 rounded-full shadow-lg border-2 border-white dark:border-gray-800 z-20">
                                        #2
                                    </div>
                                </div>
                                <div className={`w-20 sm:w-24 flex flex-col items-center justify-end rounded-t-2xl pt-4 pb-3 h-28 sm:h-36 relative overflow-hidden backdrop-blur-md transition-colors ${TC.podiumBase} group-hover:bg-gray-400/10`}>
                                    <div className="absolute top-0 inset-x-0 h-[100px] bg-gradient-to-b from-gray-400/20 to-transparent pointer-events-none" />
                                    <span className={`text-xs font-bold ${TC.textPrimary} mb-0.5 truncate max-w-full px-2`}>{top3[1].user_name}</span>
                                    <span className={`text-[10px] font-mono font-medium ${TC.textSecondary}`}>${(top3[1].virtualBalance / 1000).toFixed(1)}k</span>
                                </div>
                            </motion.div>
                        )}

                        {/* 1st Place */}
                        {top3[0] && (
                            <motion.div
                                initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                                className="flex flex-col items-center z-10 relative -mx-2 -top-2 group cursor-pointer"
                            >
                                <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex flex-col items-center animate-bounce-slow">
                                    <FaCrown className={`text-3xl sm:text-4xl ${TC.crown}`} />
                                </div>

                                <div className="relative mb-3 transition-transform duration-300 group-hover:scale-110">
                                    <div className="absolute inset-0 bg-yellow-400 rounded-full blur-xl opacity-50 group-hover:opacity-70 transition-opacity"></div>
                                    <img
                                        src={top3[0].image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${top3[0].name}`}
                                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-yellow-400 shadow-2xl object-cover relative z-10 ring-2 ring-yellow-400/50 ring-offset-2 ring-offset-transparent"
                                        alt={top3[0].name}
                                    />
                                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-500 to-amber-500 text-white text-xs sm:text-sm font-black px-3 py-0.5 rounded-full shadow-lg border-2 border-white dark:border-gray-800 z-20 flex items-center gap-1">
                                        <FaMedal size={10} /> #1
                                    </div>
                                </div>

                                <div className={`w-24 sm:w-28 flex flex-col items-center justify-end rounded-t-2xl pt-4 pb-4 h-36 sm:h-48 relative overflow-hidden backdrop-blur-md shadow-2xl shadow-yellow-500/10 transition-colors ${TC.podiumBase} group-hover:bg-yellow-400/10`}>
                                    <div className="absolute top-0 inset-x-0 h-[120px] bg-gradient-to-b from-yellow-400/20 to-transparent pointer-events-none" />
                                    <span className={`text-sm font-black ${TC.textPrimary} mb-0.5 truncate max-w-full px-2`}>{top3[0].user_name}</span>
                                    <span className="text-xs font-mono font-bold text-yellow-500">${(top3[0].virtualBalance / 1000).toFixed(1)}k</span>
                                </div>
                            </motion.div>
                        )}

                        {/* 3rd Place */}
                        {top3[2] && (
                            <motion.div
                                initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                                className="flex flex-col items-center group relative cursor-pointer"
                            >
                                <div className="relative mb-3 transition-transform duration-300 group-hover:scale-105">
                                    <div className="absolute inset-0 bg-orange-400 rounded-full blur-lg opacity-40 group-hover:opacity-60 transition-opacity"></div>
                                    <img
                                        src={top3[2].image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${top3[2].name}`}
                                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-orange-300 shadow-xl object-cover relative z-10"
                                        alt={top3[2].name}
                                    />
                                    <div className="absolute -bottom-2 lg:-right-0 left-1/2 -translate-x-1/2 lg:translate-x-0 bg-orange-400 text-white text-[10px] sm:text-xs font-black px-2 py-0.5 rounded-full shadow-lg border-2 border-white dark:border-gray-800 z-20">
                                        #3
                                    </div>
                                </div>
                                <div className={`w-20 sm:w-24 flex flex-col items-center justify-end rounded-t-2xl pt-4 pb-3 h-24 sm:h-32 relative overflow-hidden backdrop-blur-md transition-colors ${TC.podiumBase} group-hover:bg-orange-400/10`}>
                                    <div className="absolute top-0 inset-x-0 h-[80px] bg-gradient-to-b from-orange-400/20 to-transparent pointer-events-none" />
                                    <span className={`text-xs font-bold ${TC.textPrimary} mb-0.5 truncate max-w-full px-2`}>{top3[2].user_name}</span>
                                    <span className={`text-[10px] font-mono font-medium ${TC.textSecondary}`}>${(top3[2].virtualBalance / 1000).toFixed(1)}k</span>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* List Section (Right - 7 Cols) */}
                    <div className="xl:col-span-7 h-full flex flex-col justify-center">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-2">
                            {rest.map((user, index) => {
                                const rank = index + 4;
                                const isMe = currentUser?.id === user.id;

                                return (
                                    <motion.div
                                        key={user.id || index}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 + (index * 0.05) }}
                                        className={`
                                            flex items-center justify-between p-3 rounded-xl transition-all border cursor-pointer group
                                            ${TC.itemHover}
                                            ${isMe
                                                ? "bg-blue-500/10 border-blue-500/50 shadow-lg shadow-blue-500/10"
                                                : isLight ? "bg-slate-50 border-slate-100" : "bg-white/5 border-white/5"}
                                        `}
                                    >
                                        <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
                                            <div className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold ${TC.rankBadge}`}>
                                                {rank}
                                            </div>
                                            <img
                                                src={user.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                                                className="w-10 h-10 rounded-full object-cover shadow-sm bg-gray-100 ring-2 ring-transparent group-hover:ring-blue-400/30 transition-all"
                                                alt={user.name}
                                            />
                                            <div className="flex flex-col truncate">
                                                <span className={`font-bold text-sm ${TC.textPrimary} flex items-center gap-2 truncate group-hover:text-blue-500 transition-colors`}>
                                                    {user.user_name}
                                                    {isMe && <span className="text-[9px] bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-1.5 py-0.5 rounded uppercase tracking-wider font-black shadow-sm">You</span>}
                                                </span>
                                                <span className={`text-[10px] ${TC.textSecondary} truncate group-hover:opacity-70`}>{user.email || "Trader"}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <div className={`font-mono text-sm font-bold ${isLight ? "text-slate-700" : "text-white group-hover:text-cyan-400 transition-colors"}`}>
                                                ${user.virtualBalance?.toLocaleString()}
                                            </div>
                                            {/* Optional Mini Graph or Change Indicator could go here */}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LeaderboardWidget;
