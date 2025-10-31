import React from "react";

function ReportsTable({ data = [] }) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <div className="text-4xl mb-2">👥</div>
        <p>No users data available</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-600">
            <th className="text-left py-3 text-gray-400 font-medium">User</th>
            <th className="text-left py-3 text-gray-400 font-medium">Role</th>
            <th className="text-left py-3 text-gray-400 font-medium">Joined</th>
          </tr>
        </thead>
        <tbody>
          {data.map((user) => (
            <tr 
              key={user.id} 
              className="border-b border-gray-700 hover:bg-gray-800/50 transition-colors"
            >
              <td className="py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-xs font-bold text-white">
                    {user.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="font-medium text-white">{user.name}</p>
                    <p className="text-xs text-gray-400">{user.email}</p>
                  </div>
                </div>
              </td>
              <td className="py-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  user.role === 'admin' 
                    ? 'bg-purple-500/20 text-purple-400' 
                    : 'bg-blue-500/20 text-blue-400'
                }`}>
                  {user.role}
                </span>
              </td>
              <td className="py-3 text-gray-400 text-sm">
                {user.joinDate || 'Unknown'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ReportsTable;