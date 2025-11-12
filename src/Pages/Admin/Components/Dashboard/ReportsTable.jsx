import React from "react";

function ReportsTable({ data = [] }) {
  // Get the latest 8 users
  const latestUsers = data.slice(0, 8);

  if (!latestUsers || latestUsers.length === 0) {
    return (
      <div className="text-center py-8 border-2 border-dashed border-gray-700 rounded-lg bg-gray-800/20">
        <div className="text-5xl mb-3">👥</div>
        <p className="text-gray-300 text-base font-semibold mb-1">No users data available</p>
        <p className="text-gray-500 text-sm">Users will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {latestUsers.map((user) => (
        <div
          key={user.id}
          className="flex items-center justify-between p-3 bg-gradient-to-br from-gray-800/50 to-gray-800/30 rounded-lg border border-gray-700 transition-all duration-200 hover:border-cyan-400/50 hover:scale-105 group cursor-pointer"
        >
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm border border-gray-600">
                {user.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-white text-base truncate group-hover:text-cyan-300 transition-colors">
                {user.name}
              </p>
              <p className="text-sm text-gray-400 font-semibold truncate">
                {user.email}
              </p>
            </div>
          </div>

          <div className="text-right min-w-[120px]">
            <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${
              user.role === 'admin' 
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' 
                : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
            }`}>
              {user.role}
            </span>
            <p className="text-xs text-gray-500 mt-2">
              {user.joinDate || 'Unknown'}
            </p>
          </div>
        </div>
      ))}
      
      {/* Show count badge if there are more than 8 users */}
      {data.length > 8 && (
        <div className="text-center pt-2">
          <span className="text-xs text-gray-400 bg-gray-800/50 px-3 py-1.5 rounded-full border border-gray-600">
            +{data.length - 8} more users
          </span>
        </div>
      )}
    </div>
  );
}

export default ReportsTable;