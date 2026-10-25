import React from "react";
import { useQuery } from "@tanstack/react-query";
import { FaServer, FaBolt, FaDatabase, FaSignal } from "react-icons/fa";
import api from "@/api/axiosConfig";

const formatUptime = (seconds) => {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return d > 0 ? `${d}d ${h}h` : h > 0 ? `${h}h ${m}m` : `${m}m`;
};

// Live figures from GET /api/health (round-trip time measured here)
function PlatformHealth({ TC }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["platformHealth"],
    queryFn: async () => {
      const started = performance.now();
      const res = await api.get("/health", { validateStatus: () => true });
      return { ...res.data, apiLatencyMs: Math.round(performance.now() - started) };
    },
    refetchInterval: 30000,
    retry: false,
  });

  const items = data
    ? [
        {
          label: "API Round Trip",
          value: `${data.apiLatencyMs}ms`,
          icon: FaBolt,
          color: data.apiLatencyMs < 500 ? "text-green-400" : "text-yellow-400",
        },
        {
          label: "Database",
          value: data.db?.ok ? `Healthy (${data.db.latencyMs}ms)` : "Unreachable",
          icon: FaDatabase,
          color: data.db?.ok ? "text-green-400" : "text-red-400",
        },
        {
          label: "Price Feed",
          value: data.priceFeed?.connected
            ? `${data.priceFeed.freshSymbols}/${data.priceFeed.trackedSymbols} live`
            : "Disconnected",
          icon: FaSignal,
          color: data.priceFeed?.connected ? "text-green-400" : "text-red-400",
        },
      ]
    : [];

  return (
    <div className={`${TC.bgCard} rounded-2xl p-3 sm:p-4`}>
      <h3
        className={`text-sm sm:text-lg font-bold ${TC.textPrimary} mb-2 sm:mb-4 flex items-center gap-2`}
      >
        <FaServer className="text-green-400 text-xs sm:text-base" /> Platform Health
        {data?.uptimeSeconds !== undefined && (
          <span className={`ml-auto text-[10px] sm:text-xs font-normal ${TC.textSecondary}`}>
            up {formatUptime(data.uptimeSeconds)}
          </span>
        )}
      </h3>
      <div className="space-y-2 sm:space-y-3">
        {isLoading ? (
          [0, 1, 2].map((i) => (
            <div key={i} className={`h-10 sm:h-12 rounded-xl ${TC.bgItem} animate-pulse`} />
          ))
        ) : isError ? (
          <p className={`text-xs sm:text-sm ${TC.textSecondary}`}>API unreachable</p>
        ) : (
          items.map((item) => {
            const ItemIcon = item.icon;
            return (
              <div
                key={item.label}
                className={`flex items-center justify-between p-2 sm:p-3 rounded-lg sm:rounded-xl ${TC.bgItem} transition-colors`}
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <ItemIcon className={`text-xs sm:text-sm ${item.color}`} />
                  <span className={`text-[10px] sm:text-sm ${TC.textSecondary}`}>{item.label}</span>
                </div>
                <span className={`text-xs sm:text-sm font-mono font-semibold ${TC.textPrimary}`}>
                  {item.value}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default PlatformHealth;
