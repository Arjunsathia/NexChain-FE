import React from "react";

const WatchlistPagination = ({ currentPage, totalPages, setCurrentPage, TC, isLight }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center gap-2 pt-4 fade-in">
      <button
        onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
        disabled={currentPage === 1}
        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-50 ${
          isLight ? "bg-gray-200 text-gray-900 hover:bg-gray-300" : "bg-gray-700 text-white hover:bg-gray-600"
        }`}>
        Prev
      </button>
      <span className={TC.textSecondary}>
        Page {currentPage} of {totalPages}
      </span>
      <button
        onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
        disabled={currentPage === totalPages}
        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-50 ${
          isLight ? "bg-gray-200 text-gray-900 hover:bg-gray-300" : "bg-gray-700 text-white hover:bg-gray-600"
        }`}>
        Next
      </button>
    </div>
  );
};

export default WatchlistPagination;
