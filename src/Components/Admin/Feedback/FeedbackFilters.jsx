import React from "react";
import { FaSearch } from "react-icons/fa";

function FeedbackFilters({ filters, setFilters, TC, isLight }) {
  return (
    <div className={`${TC.bgCard} rounded-2xl p-3 sm:p-4 lg:p-6`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="md:col-span-2 relative w-full">
          <FaSearch
            className={`absolute left-4 top-1/2 -translate-y-1/2 text-lg transition-colors ${
              isLight
                ? "text-gray-400 group-focus-within:text-cyan-500"
                : "text-gray-500 group-focus-within:text-cyan-400"
            }`}
          />
          <input
            type="text"
            placeholder="Search feedback..."
            className={`w-full rounded-xl py-3 pl-12 pr-4 text-sm font-medium outline-none transition-all focus:ring-4 focus:ring-cyan-500/20 shadow-sm ${
              isLight
                ? "bg-white text-gray-900 placeholder-gray-400"
                : "bg-gray-900/50 text-white placeholder-gray-500"
            }`}
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </div>
        <select
          className={`w-full rounded-xl py-3 px-4 text-sm font-medium outline-none transition-all focus:ring-4 focus:ring-cyan-500/20 shadow-sm ${
            isLight ? "bg-white text-gray-900" : "bg-gray-900/50 text-white"
          }`}
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="">All Status</option>
          <option value="new">New</option>
          <option value="in-progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
        <select
          className={`w-full rounded-xl py-3 px-4 text-sm font-medium outline-none transition-all focus:ring-4 focus:ring-cyan-500/20 shadow-sm ${
            isLight ? "bg-white text-gray-900" : "bg-gray-900/50 text-white"
          }`}
          value={filters.type}
          onChange={(e) => setFilters({ ...filters, type: e.target.value })}
        >
          <option value="">All Types</option>
          <option value="bug">Bug</option>
          <option value="suggestion">Suggestion</option>
          <option value="praise">Praise</option>
          <option value="general">General</option>
        </select>
        <select
          className={`w-full rounded-xl py-3 px-4 text-sm font-medium outline-none transition-all focus:ring-4 focus:ring-cyan-500/20 shadow-sm ${
            isLight ? "bg-white text-gray-900" : "bg-gray-900/50 text-white"
          }`}
          value={filters.priority}
          onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
        >
          <option value="">All Priority</option>
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
