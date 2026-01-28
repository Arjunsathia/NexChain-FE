import React from "react";
import {
  FaArrowUp,
  FaArrowDown,
  FaEye,
  FaToggleOn,
  FaToggleOff,
  FaSpinner,
} from "react-icons/fa";

function CryptoTable({
  currentCoins,
  TC,
  isLight,
  formatCurrency,
  formatLargeNumber,
  setSelectedCoin,
  currentPage,
  totalPages,
  paginate,
  onToggleFreeze,
  loadingId,
}) {
  return (
    <div className={`${TC.bgCard} rounded-2xl overflow-hidden mt-6`}>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className={TC.tableHead}>
            <tr>
              <th className="py-3 px-3 sm:py-4 sm:px-6 text-[10px] sm:text-xs font-semibold uppercase tracking-wider">
                Asset
              </th>
              <th className="py-3 px-3 sm:py-4 sm:px-6 text-[10px] sm:text-xs font-semibold uppercase tracking-wider">
                Price
              </th>
              <th className="py-3 px-3 sm:py-4 sm:px-6 text-[10px] sm:text-xs font-semibold uppercase tracking-wider hidden sm:table-cell">
                24h Change
              </th>
              <th className="py-3 px-3 sm:py-4 sm:px-6 text-[10px] sm:text-xs font-semibold uppercase tracking-wider hidden md:table-cell">
                Market Cap
              </th>
              <th className="py-3 px-3 sm:py-4 sm:px-6 text-[10px] sm:text-xs font-semibold uppercase tracking-wider hidden lg:table-cell">
                Volume (24h)
              </th>
              <th className="py-3 px-3 sm:py-4 sm:px-6 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-center">
                Status
              </th>
              <th className="py-3 px-3 sm:py-4 sm:px-6 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-center">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/50">
            {currentCoins.map((coin) => (
              <tr
                key={coin.id}
                className={`${TC.tableRow} transition-all duration-200 hover:bg-gray-800/30`}
              >
                <td className="py-2.5 px-2.5 sm:py-4 sm:px-6">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <img
                      src={coin.image}
                      alt={coin.name}
                      className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-xs sm:text-sm font-bold ${TC.textPrimary} truncate max-w-[80px] sm:max-w-none`}
                      >
                        {coin.name}
                      </p>
                      <p className="text-[9px] sm:text-xs text-cyan-400 uppercase">
                        {coin.symbol}
                      </p>
                    </div>
                  </div>
                </td>
                <td
                  className={`py-2.5 px-2.5 sm:py-4 sm:px-6 text-xs sm:text-sm font-medium ${TC.textPrimary}`}
                >
                  {formatCurrency(coin.current_price)}
                </td>
                <td className="py-2.5 px-2.5 sm:py-4 sm:px-6 hidden sm:table-cell">
                  <div
                    className={`flex items-center gap-1 text-xs sm:text-sm font-medium ${coin.price_change_percentage_24h >= 0
                      ? "text-green-400"
                      : "text-red-400"
                      }`}
                  >
                    {coin.price_change_percentage_24h >= 0 ? (
                      <FaArrowUp size={10} />
                    ) : (
                      <FaArrowDown size={10} />
                    )}
                    {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                  </div>
                </td>
                <td
                  className={`py-2.5 px-2.5 sm:py-4 sm:px-6 text-xs sm:text-sm ${TC.textSecondary} hidden md:table-cell`}
                >
                  ${formatLargeNumber(coin.market_cap)}
                </td>
                <td
                  className={`py-2.5 px-2.5 sm:py-4 sm:px-6 text-xs sm:text-sm ${TC.textSecondary} hidden lg:table-cell`}
                >
                  ${formatLargeNumber(coin.total_volume)}
                </td>
                <td className="py-2.5 px-2.5 sm:py-4 sm:px-6 text-center">
                  <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                    <span
                      className={`px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-lg text-[9px] sm:text-[10px] uppercase font-bold tracking-wider ${coin.isFrozen
                        ? "bg-red-500/10 text-red-500 border border-red-500/20"
                        : "bg-green-500/10 text-green-500 border border-green-500/20"
                        }`}
                    >
                      {coin.isFrozen ? "Frozen" : "Active"}
                    </span>

                    <button
                      onClick={() => onToggleFreeze && onToggleFreeze(coin)}
                      disabled={loadingId === coin.id}
                      className={`p-1 sm:p-1.5 rounded-lg transition-all duration-300 hover:scale-110 ${coin.isFrozen
                        ? "text-red-500 hover:bg-red-500/10"
                        : "text-green-500 hover:bg-green-500/10"
                        }`}
                      title={coin.isFrozen ? "Unfreeze Coin" : "Freeze Coin"}
                    >
                      {loadingId === coin.id ? (
                        <FaSpinner className="animate-spin text-xs sm:text-sm" />
                      ) : coin.isFrozen ? (
                        <FaToggleOn className="rotate-180 text-base sm:text-lg" />
                      ) : (
                        <FaToggleOff className="rotate-180 text-base sm:text-lg" />
                      )}
                    </button>
                  </div>
                </td>
                <td className="py-2.5 px-2.5 sm:py-4 sm:px-6 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => setSelectedCoin(coin)}
                      className={`p-1.5 sm:p-2.5 rounded-xl transition-all duration-300 hover:scale-110 shadow-sm hover:shadow-cyan-500/20 ${isLight
                        ? "bg-cyan-50 text-cyan-600 hover:bg-cyan-100"
                        : "bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20"
                        }`}
                      title="View Details"
                    >
                      <FaEye className="text-xs sm:text-sm" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      { }
      {totalPages > 1 && (
        <div className="p-4 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => paginate(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${currentPage === 1
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-gray-800/50"
              } ${isLight
                ? "text-gray-600 bg-gray-100"
                : "text-gray-300 bg-gray-800/50"
              }`}
          >
            Previous
          </button>

          {(() => {
            let pages = [];
            if (totalPages <= 7) {
              pages = [...Array(totalPages).keys()].map((i) => i + 1);
            } else {
              if (currentPage <= 4) {
                pages = [1, 2, 3, 4, 5, "...", totalPages];
              } else if (currentPage >= totalPages - 3) {
                pages = [
                  1,
                  "...",
                  totalPages - 4,
                  totalPages - 3,
                  totalPages - 2,
                  totalPages - 1,
                  totalPages,
                ];
              } else {
                pages = [
                  1,
                  "...",
                  currentPage - 1,
                  currentPage,
                  currentPage + 1,
                  "...",
                  totalPages,
                ];
              }
            }
            return pages.map((page, index) => (
              <button
                key={index}
                onClick={() => typeof page === "number" && paginate(page)}
                disabled={typeof page !== "number"}
                className={`w-9 h-9 rounded-xl text-sm font-bold transition-all duration-300 ${page === currentPage
                  ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/25"
                  : typeof page === "number"
                    ? `${isLight
                      ? "bg-gray-100/80 text-gray-600 hover:bg-gray-200"
                      : "bg-white/5 text-gray-300 hover:bg-white/10"
                    }`
                    : `${TC.textSecondary}`
                  }`}
              >
                {page}
              </button>
            ));
          })()}

          <button
            onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${currentPage === totalPages
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-gray-800/50"
              } ${isLight
                ? "text-gray-600 bg-gray-100"
                : "text-gray-300 bg-gray-800/50"
              }`}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default CryptoTable;
