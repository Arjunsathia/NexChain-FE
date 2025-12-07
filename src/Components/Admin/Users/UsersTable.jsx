import React from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";

function UsersTable({
  currentUsers,
  TC,
  isLight,
  setSelectedUser,
  setEditingUser,
  setShowUserForm,
  confirmDelete,
}) {
  return (
    <div className={`${TC.bgCard} rounded-2xl overflow-hidden`}>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className={TC.tableHead}>
            <tr>
              <th className="py-3 px-3 sm:py-4 sm:px-6 text-[10px] sm:text-xs font-semibold uppercase tracking-wider">
                User
              </th>
              <th className="py-3 px-3 sm:py-4 sm:px-6 text-[10px] sm:text-xs font-semibold uppercase tracking-wider hidden md:table-cell">
                Role
              </th>
              <th className="py-3 px-3 sm:py-4 sm:px-6 text-[10px] sm:text-xs font-semibold uppercase tracking-wider hidden lg:table-cell">
                Status
              </th>
              <th className="py-3 px-3 sm:py-4 sm:px-6 text-[10px] sm:text-xs font-semibold uppercase tracking-wider hidden sm:table-cell">
                Joined
              </th>
              <th className="py-3 px-3 sm:py-4 sm:px-6 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-center">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/50">
            {currentUsers.map((user) => (
              <tr
                key={user._id}
                className={`${TC.tableRow} transition-all duration-200 hover:${
                  isLight ? "bg-gray-50" : "bg-white/5"
                }`}
              >
                <td className="py-3 px-3 sm:py-4 sm:px-6">
                  <div className="flex items-center gap-2 sm:gap-3">
                    {/* Avatar */}
                    {/* Avatar */}
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-lg text-xs sm:text-base flex-shrink-0 overflow-hidden">
                      {user.image ? (
                        <img 
                          src={user.image.startsWith('http') ? user.image : `http://localhost:5050/uploads/${user.image}`} 
                          alt={user.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        user.name?.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p
                        className={`font-semibold text-sm sm:text-base ${TC.textPrimary} truncate`}
                      >
                        {user.name}
                      </p>
                      <p
                        className={`text-xs sm:text-sm ${TC.textSecondary} truncate`}
                      >
                        {user.email}
                      </p>
                    </div>
                  </div>
                </td>
                <td
                  className={`py-3 px-3 sm:py-4 sm:px-6 text-sm ${TC.textSecondary} hidden md:table-cell`}
                >
                  <span
                    className={`px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-medium whitespace-nowrap ${
                      user.role === "admin"
                        ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                        : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="py-3 px-3 sm:py-4 sm:px-6 hidden lg:table-cell">
                  <span
                    className={`px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-medium whitespace-nowrap ${
                      user.isActive
                        ? "bg-green-500/10 text-green-400 border border-green-500/20"
                        : "bg-red-500/10 text-red-400 border border-red-500/20"
                    }`}
                  >
                    {user.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td
                  className={`py-3 px-3 sm:py-4 sm:px-6 text-xs sm:text-sm ${TC.textSecondary} hidden sm:table-cell`}
                >
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="py-3 px-3 sm:py-4 sm:px-6">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => setSelectedUser(user)}
                      className={`p-1.5 sm:p-2 rounded-lg transition-all duration-200 hover:scale-110 ${
                        isLight
                          ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          : "bg-gray-700/50 text-gray-300 hover:bg-gray-700 hover:text-white"
                      }`}
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setEditingUser(user);
                        setShowUserForm(true);
                      }}
                      className={`p-1.5 sm:p-2 rounded-lg transition-all duration-200 hover:scale-110 ${
                        isLight
                          ? "bg-blue-50 text-blue-600 hover:bg-blue-100"
                          : "bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"
                      }`}
                      title="Edit User"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => confirmDelete(user)}
                      className={`p-1.5 sm:p-2 rounded-lg transition-all duration-200 hover:scale-110 ${
                        isLight
                          ? "bg-red-50 text-red-600 hover:bg-red-100"
                          : "bg-red-500/10 text-red-400 hover:bg-red-500/20"
                      }`}
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {currentUsers.length === 0 && (
              <tr>
                <td
                  colSpan="5"
                  className={`text-center py-8 text-sm ${TC.textSecondary}`}
                >
                  No users found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default UsersTable;
