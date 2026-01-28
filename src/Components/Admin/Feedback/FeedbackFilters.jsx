import React from "react";
import { FaSearch } from "react-icons/fa";

function FeedbackFilters({ filters, setFilters, TC }) {
  return (
    <div className={`${TC.bgCard} rounded-2xl p-3 mb-4`}>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-4">
        <div className="col-span-2 relative w-full group">
          <FaSearch
            className={`absolute left-3.5 top-1/2 -translate-y-1/2 text-xs sm:text-sm transition-colors ${TC.textSecondary} group-focus-within:text-cyan-500`}
          />
          <input
            type="text"
            placeholder="Search feedback..."
            className={`w-full rounded-xl py-2 sm:py-2.5 pl-10 pr-4 text-xs sm:text-sm font-medium outline-none transition-all border ${TC.bgInput}`}
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </div>
        <select
          className={`w-full rounded-xl py-2 sm:py-2.5 px-3 text-xs sm:text-sm font-medium outline-none transition-all border ${TC.bgInput}`}
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="">Status</option>
          <option value="new">New</option>
          <option value="in-progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
        <select
          className={`w-full rounded-xl py-2 sm:py-2.5 px-3 text-xs sm:text-sm font-medium outline-none transition-all border ${TC.bgInput}`}
          value={filters.type}
          onChange={(e) => setFilters({ ...filters, type: e.target.value })}
        >
          <option value="">Type</option>
          <option value="bug">Bug</option>
          <option value="suggestion">Suggestion</option>
          <option value="praise">Praise</option>
          <option value="general">General</option>
        </select>
        <select
          className={`w-full rounded-xl py-2 sm:py-2.5 px-3 text-xs sm:text-sm font-medium outline-none transition-all border ${TC.bgInput} col-span-2 sm:col-span-1`}
          value={filters.priority}
          onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
        >
          <option value="">Priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
      </div>
    </div>
  );
}

export default FeedbackFilters;
