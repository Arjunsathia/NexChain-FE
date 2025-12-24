import React from "react";
import { FaSearch, FaArrowUp, FaArrowDown, FaEye } from "react-icons/fa";
import SimpleSparkline from "./SimpleSparkline";

function MarketTable({
  currentItems,
  filteredData,
  itemsPerPage,
  currentPage,
  paginate,
  searchTerm,
  setSearchTerm,
  TC,
  isLight,
  formatCurrency,
  formatCompactNumber,
  setSelectedCoin,
}) {
  return (
    <div className={`${TC.bgCard} rounded-2xl overflow-hidden`}>
      <div className="p-3 sm:p-4 border-b border-gray-800/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <h3 className={`text-base sm:text-lg font-bold ${TC.textPrimary}`}>
          Market Overview
        </h3>
        <div className="relative w-full sm:w-72 group">
          <FaSearch className={`absolute left-4 top-1/2 -translate-y-1/2 text-sm transition-colors ${TC.textSecondary} group-focus-within:text-cyan-500`} />
          <input
            type="text"
            placeholder="Search coins..."
            className={`w-full rounded-xl py-2.5 pl-12 pr-4 text-sm font-medium outline-none transition-all border ${TC.bgInput}`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
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
                7d Trend
              </th>
              <th className="py-3 px-3 sm:py-4 sm:px-6 text-[10px] sm:text-xs font-semibold uppercase tracking-wider hidden lg:table-cell">
                Market Cap
              </th>
              <th className="py-3 px-3 sm:py-4 sm:px-6 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-center">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/50">
            {currentItems.map((coin) => (
              <tr
                key={coin.id}
                className={`${TC.tableRow} transition-all duration-200 hover:bg-gray-800/30`}
              >
                <td className="py-3 px-3 sm:py-4 sm:px-6">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span
                      className={`text-[10px] sm:text-xs ${TC.textSecondary} w-3 sm:w-4`}
                    >
                      {coin.market_cap_rank}
                    </span>
                    <img
                      src={coin.image}
                      alt={coin.name}
                      className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p
                        className={`font-bold text-xs sm:text-sm ${TC.textPrimary} truncate`}
                      >
                        {coin.name}
                      </p>
                      <p
                        className={`text-[10px] sm:text-xs ${TC.textSecondary} uppercase`}
                      >
                        {coin.symbol}
                      </p>
                    </div>
                  </div>
                </td>
                <td
                  className={`py-3 px-3 sm:py-4 sm:px-6 font-medium text-xs sm:text-sm ${TC.textPrimary}`}
                >
                  {formatCurrency(coin.current_price)}
                </td>
                <td className="py-3 px-3 sm:py-4 sm:px-6 hidden sm:table-cell">
                  <span
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
                  </span>
                </td>
                <td className="py-3 px-3 sm:py-4 sm:px-6 w-24 sm:w-32 hidden md:table-cell">
                  <SimpleSparkline
                    data={coin.sparkline_in_7d.price}
                    color={
                      coin.price_change_percentage_7d_in_currency >= 0
                        ? "#4ade80"
                        : "#f87171"
                    }
                    width={100}
                    height={30}
                  />
                </td>
                <td
                  className={`py-3 px-3 sm:py-4 sm:px-6 text-xs sm:text-sm ${TC.textSecondary} hidden lg:table-cell`}
                >
                  {formatCompactNumber(coin.market_cap)}
                </td>
                <td className="py-3 px-3 sm:py-4 sm:px-6 text-center">
                  <button
                    onClick={() => setSelectedCoin(coin)}
                    className={`p-1.5 sm:p-2 rounded-lg ${TC.btnSecondary}`}
                  >
                    <FaEye className="text-sm" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      { }
      {filteredData.length > itemsPerPage && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-4 py-1.5 rounded-xl text-sm font-bold transition-all ${currentPage === 1
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-gray-800/50 hover:scale-105 active:scale-95"
              } ${isLight
                ? "text-gray-600 bg-gray-100"
                : "text-gray-300 bg-white/5"
              }`}
          >
            Previous
          </button>

          <div className="flex items-center gap-1">
            {Array.from({
              length: Math.ceil(filteredData.length / itemsPerPage),
            }).map((_, i) => {

              if (
                i + 1 === 1 ||
                i + 1 === Math.ceil(filteredData.length / itemsPerPage) ||
                (i + 1 >= currentPage - 1 && i + 1 <= currentPage + 1)
              ) {
                return (
                  <button
                    key={i}
                    onClick={() => paginate(i + 1)}
                    className={`w-9 h-9 rounded-xl text-sm font-bold transition-all duration-300 ${currentPage === i + 1
                      ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/25"
                      : TC.btnSecondary
                      }`}
                  >
                    {i + 1}
                  </button>
                );
              } else if (
                (i + 1 === currentPage - 2 && currentPage > 3) ||
                (i + 1 === currentPage + 2 &&
                  currentPage < Math.ceil(filteredData.length / itemsPerPage) - 2)
              ) {
                return (
                  <span key={i} className={`px-1 ${TC.textSecondary}`}>
                    ...
                  </span>
                );
              }
              return null;
            })}
          </div>

          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={
              currentPage === Math.ceil(filteredData.length / itemsPerPage)
            }
            className={`px-4 py-1.5 rounded-xl text-sm font-bold transition-all ${currentPage === Math.ceil(filteredData.length / itemsPerPage)
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-gray-800/50 hover:scale-105 active:scale-95"
              } ${isLight
                ? "text-gray-600 bg-gray-100"
                : "text-gray-300 bg-white/5"
              }`}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default MarketTable;
