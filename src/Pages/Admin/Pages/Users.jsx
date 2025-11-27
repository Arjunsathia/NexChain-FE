import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Trash2,
  Eye,
  Shield,
  User,
  Mail,
  Phone,
  Calendar,
  Wallet,
  LineChart,
  Coins,
  X,
  AlertTriangle,
  CheckCircle,
  Ban,
  Loader2,
  Plus,
  Pencil,
} from "lucide-react";
import UserForm from "../Components/Users/UserForm";

import { getData, deleteById } from "@/api/axiosConfig";
import { toast } from "react-toastify";

// ----------------------------------------------------

// Utility to check if light mode is active based on global class
const useThemeCheck = () => {
    const [isLight, setIsLight] = useState(!document.documentElement.classList.contains('dark'));

    useEffect(() => {
        const observer = new MutationObserver(() => {
            setIsLight(!document.documentElement.classList.contains('dark'));
        });

        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

        return () => observer.disconnect();
    }, []);

    return isLight;
};

const Users = () => {
  const isLight = useThemeCheck();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  // State to trigger content loaded visibility, matching the animation pattern
  const [contentLoaded, setContentLoaded] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const usersPerPage = 10;

  // Premium Theme Classes - Matches User Dashboard
  const TC = useMemo(() => ({
    textPrimary: isLight ? "text-gray-900" : "text-white",
    textSecondary: isLight ? "text-gray-500" : "text-gray-400",
    textTertiary: isLight ? "text-gray-400" : "text-gray-500",
    
    // Updated bgCard and headerGradient to match the provided AdminDashboard component's aesthetic for better continuity
    bgCard: isLight 
      ? "bg-white shadow-[0_6px_25px_rgba(0,0,0,0.12)]" 
      : "bg-gray-800/50 backdrop-blur-xl shadow-xl shadow-black/20",
    bgItem: isLight ? "bg-gray-50" : "bg-white/5",
    bgInput: isLight ? "bg-white text-gray-900 placeholder-gray-500 shadow-sm" : "bg-gray-900/50 text-white placeholder-gray-500 shadow-inner",
    
    tableHead: isLight ? "bg-gray-100 text-gray-600" : "bg-gray-900/50 text-gray-400",
    tableRow: isLight ? "hover:bg-gray-50" : "hover:bg-white/5",
    
    modalOverlay: "bg-black/80 backdrop-blur-sm",
    modalContent: isLight ? "bg-white shadow-2xl" : "bg-[#0a0b14] shadow-2xl shadow-black/50",
    
    // Copied from AdminDashboard to match heading style
    headerGradient: "from-cyan-400 to-blue-500", 
  }), [isLight]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setContentLoaded(false); // Reset contentLoaded before fetching
      const response = await getData("/users");
      // Robustly handle different response structures
      const usersData = response?.users ?? response?.data ?? (Array.isArray(response) ? response : []);
      setUsers(Array.isArray(usersData) ? usersData : []);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users");
      setUsers([]);
    } finally {
      // Small delay so the fade/slide animation looks smooth like your User Dashboard
      setLoading(false);
      setTimeout(() => setContentLoaded(true), 300); 
    }
  };

  const handleDelete = async () => {
    if (!userToDelete) return;

    try {
      setDeleteLoading(true);
      await deleteById("/users", userToDelete._id);
      setUsers(users.filter((u) => u._id !== userToDelete._id));
      toast.success("User deleted successfully");
      setShowDeleteModal(false);
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user");
    } finally {
      setDeleteLoading(false);
      setUserToDelete(null);
    }
  };

  const confirmDelete = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Loading skeleton state matching the AdminDashboard pattern
  const UsersTableSkeleton = () => (
    <div className={`${TC.bgCard} rounded-2xl overflow-hidden p-4`}>
        <div className="space-y-4">
            <div className={`h-10 w-full ${TC.tableHead} rounded animate-pulse`} />
            {[...Array(5)].map((_, i) => (
                <div key={i} className={`flex items-center justify-between p-3 ${TC.bgItem} rounded-xl animate-pulse`}>
                    <div className="flex items-center gap-3 w-1/2">
                        <div className="w-10 h-10 rounded-full bg-gray-700/30" />
                        <div className="space-y-1 w-full">
                            <div className="h-3 w-3/4 bg-gray-700/30 rounded" />
                            <div className="h-2 w-1/2 bg-gray-700/30 rounded" />
                        </div>
                    </div>
                    <div className="h-4 w-16 bg-gray-700/30 rounded" />
                    <div className="h-4 w-12 bg-gray-700/30 rounded" />
                    <div className="flex gap-2">
                        <div className="w-8 h-8 bg-gray-700/30 rounded-lg" />
                        <div className="w-8 h-8 bg-gray-700/30 rounded-lg" />
                    </div>
                </div>
            ))}
        </div>
    </div>
  );

  // Use the animation classes for the whole content area
  return (
    <div className={`flex-1 p-4 lg:p-8 space-y-4 lg:space-y-6 min-h-screen ${TC.textPrimary}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className={`text-2xl sm:text-3xl font-bold bg-gradient-to-r ${TC.headerGradient} bg-clip-text text-transparent`}>
            Users Management
          </h1>
          <p className={`${TC.textSecondary} mt-1 text-xs sm:text-sm`}>
            Manage and monitor user accounts
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
          {loading ? (
             <div className="flex items-center text-sm text-gray-300 h-[40px] sm:h-[44px] justify-end">
              <Loader2 className="w-4 h-4 text-cyan-400 animate-spin mr-2" />
              Loading...
            </div>
          ) : (
            <>
              <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${isLight ? "text-gray-400 group-focus-within:text-cyan-500" : "text-gray-500 group-focus-within:text-cyan-400"}`} />
              <input
                type="text"
                placeholder="Search users..."
                className={`w-full rounded-xl py-2.5 sm:py-3 pl-12 pr-4 text-sm font-medium outline-none transition-all focus:ring-4 focus:ring-cyan-500/20 shadow-sm ${isLight ? "bg-white text-gray-900 placeholder-gray-400" : "bg-gray-900/50 text-white placeholder-gray-500"}`}
                value={searchTerm}
                onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1); // Reset to page 1 on search
                }}
              />
            </>
          )}
          </div>
          
          <button
            onClick={() => {
              setEditingUser(null);
              setShowUserForm(true);
            }}
            className="flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-200 transform hover:-translate-y-0.5"
          >
            <Plus className="w-5 h-5" />
            <span className="text-sm">Add User</span>
          </button>
        </div>
      </div>

      {/* Users Table / Skeleton */}
      {loading ? (
        <UsersTableSkeleton />
      ) : (
        <div 
          className={`transition-all duration-500 ease-in-out space-y-4 lg:space-y-6 ${
            contentLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
        <div className={`${TC.bgCard} rounded-2xl overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className={TC.tableHead}>
                <tr>
                  <th className="py-3 px-3 sm:py-4 sm:px-6 text-[10px] sm:text-xs font-semibold uppercase tracking-wider">User</th>
                  <th className="py-3 px-3 sm:py-4 sm:px-6 text-[10px] sm:text-xs font-semibold uppercase tracking-wider hidden md:table-cell">Role</th>
                  <th className="py-3 px-3 sm:py-4 sm:px-6 text-[10px] sm:text-xs font-semibold uppercase tracking-wider hidden lg:table-cell">Status</th>
                  <th className="py-3 px-3 sm:py-4 sm:px-6 text-[10px] sm:text-xs font-semibold uppercase tracking-wider hidden sm:table-cell">Joined</th>
                  <th className="py-3 px-3 sm:py-4 sm:px-6 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {currentUsers.map((user) => (
                  <tr key={user._id} className={`${TC.tableRow} transition-all duration-200 hover:${isLight ? "bg-gray-50" : "bg-white/5"}`}>
                    <td className="py-3 px-3 sm:py-4 sm:px-6">
                      <div className="flex items-center gap-2 sm:gap-3">
                        {/* Avatar */}
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-lg text-xs sm:text-base flex-shrink-0">
                          {user.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className={`font-semibold text-sm sm:text-base ${TC.textPrimary} truncate`}>{user.name}</p>
                          <p className={`text-xs sm:text-sm ${TC.textSecondary} truncate`}>{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className={`py-3 px-3 sm:py-4 sm:px-6 text-sm ${TC.textSecondary} hidden md:table-cell`}>
                      <span className={`px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-medium whitespace-nowrap ${
                        user.role === 'admin' 
                          ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' 
                          : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3 px-3 sm:py-4 sm:px-6 hidden lg:table-cell">
                      <span className={`px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-medium whitespace-nowrap ${
                        user.isActive 
                          ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className={`py-3 px-3 sm:py-4 sm:px-6 text-xs sm:text-sm ${TC.textSecondary} hidden sm:table-cell`}>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-3 sm:py-4 sm:px-6">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className={`p-1.5 sm:p-2 rounded-lg transition-all duration-200 hover:scale-110 ${isLight ? "bg-gray-100 text-gray-600 hover:bg-gray-200" : "bg-gray-700/50 text-gray-300 hover:bg-gray-700 hover:text-white"}`}
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingUser(user);
                            setShowUserForm(true);
                          }}
                          className={`p-1.5 sm:p-2 rounded-lg transition-all duration-200 hover:scale-110 ${isLight ? "bg-blue-50 text-blue-600 hover:bg-blue-100" : "bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"}`}
                          title="Edit User"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => confirmDelete(user)}
                          className={`p-1.5 sm:p-2 rounded-lg transition-all duration-200 hover:scale-110 ${isLight ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-red-500/10 text-red-400 hover:bg-red-500/20"}`}
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
                        <td colSpan="5" className={`text-center py-8 text-sm ${TC.textSecondary}`}>
                            No users found matching your search.
                        </td>
                    </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className={`p-4 flex justify-center gap-2`}>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => paginate(i + 1)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-all duration-200 ${
                    currentPage === i + 1
                      ? "bg-cyan-600 text-white shadow-lg shadow-cyan-500/25"
                      : `${isLight ? "bg-gray-100 text-gray-600 hover:bg-gray-200" : "bg-gray-800/50 text-gray-300 hover:bg-gray-800"}`
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
        </div>
      )}

      {/* View User Modal */}
      {selectedUser && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${TC.modalOverlay}`}>
          {/* Apply fade-in animation to the modal content as well */}
          <div className={`w-full max-w-2xl rounded-2xl overflow-hidden ${TC.modalContent} animate-in fade-in zoom-in duration-300`}>
            {/* Modal Header */}
            <div className={`p-6 flex justify-between items-center bg-gradient-to-r from-cyan-500/10 to-blue-500/10`}>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 p-1 shadow-lg shadow-cyan-500/20">
                  <div className={`w-full h-full rounded-full flex items-center justify-center text-2xl font-bold text-white ${isLight ? "bg-white/20" : "bg-black/40"}`}>
                    {selectedUser.name?.charAt(0).toUpperCase()}
                  </div>
                </div>
                <div>
                  <h2 className={`text-2xl font-bold ${TC.textPrimary}`}>{selectedUser.name}</h2>
                  <p className="text-cyan-400 text-sm font-medium flex items-center gap-2">
                    <Shield className="w-4 h-4" /> {selectedUser.role}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedUser(null)}
                className={`transition-all duration-200 p-1 rounded-lg hover:rotate-90 transform group ${isLight ? "text-gray-500 hover:text-red-600 hover:bg-red-100" : "text-gray-400 hover:text-white hover:bg-red-500/20"}`}
              >
                <X className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`p-4 rounded-xl ${TC.bgItem}`}>
                  <p className={`text-xs uppercase mb-1 ${TC.textSecondary}`}>Email Address</p>
                  <div className={`flex items-center gap-2 font-medium ${TC.textPrimary}`}>
                    <Mail className="w-4 h-4 text-cyan-400" />
                    {selectedUser.email}
                  </div>
                </div>
                {/* Note: Mock data doesn't have a phone field, displaying placeholder */}
                <div className={`p-4 rounded-xl ${TC.bgItem}`}>
                  <p className={`text-xs uppercase mb-1 ${TC.textSecondary}`}>Phone Number</p>
                  <div className={`flex items-center gap-2 font-medium ${TC.textPrimary}`}>
                    <Phone className="w-4 h-4 text-purple-400" />
                    {selectedUser.phone || "Not provided"}
                  </div>
                </div>
                <div className={`p-4 rounded-xl ${TC.bgItem}`}>
                  <p className={`text-xs uppercase mb-1 ${TC.textSecondary}`}>Joined Date</p>
                  <div className={`flex items-center gap-2 font-medium ${TC.textPrimary}`}>
                    <Calendar className="w-4 h-4 text-blue-400" />
                    {new Date(selectedUser.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className={`p-4 rounded-xl ${TC.bgItem}`}>
                  <p className={`text-xs uppercase mb-1 ${TC.textSecondary}`}>Account Status</p>
                  <div className={`flex items-center gap-2 font-medium ${selectedUser.isActive ? 'text-green-400' : 'text-red-400'}`}>
                    {selectedUser.isActive ? <CheckCircle className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                    {selectedUser.isActive ? 'Active' : 'Inactive'}
                  </div>
                </div>
              </div>

              {/* Stats Overview */}
              <div>
                <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${TC.textPrimary}`}>
                  <LineChart className="w-4 h-4 text-cyan-400" /> Investment Overview
                </h3>
                <div className="grid grid-cols-3 gap-4">
                   <div className={`p-4 rounded-xl text-center ${TC.bgItem}`}>
                      <Wallet className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                      <p className={`text-2xl font-bold ${TC.textPrimary}`}>$0</p>
                      <p className={`text-xs ${TC.textSecondary}`}>Total Balance</p>
                   </div>
                   <div className={`p-4 rounded-xl text-center ${TC.bgItem}`}>
                      <Coins className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                      <p className={`text-2xl font-bold ${TC.textPrimary}`}>{selectedUser.purchasedCoins?.length || 0}</p>
                      <p className={`text-xs ${TC.textSecondary}`}>Coins Owned</p>
                   </div>
                   <div className={`p-4 rounded-xl text-center ${TC.bgItem}`}>
                      <AlertTriangle className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                      <p className={`text-2xl font-bold ${TC.textPrimary}`}>0</p>
                      <p className={`text-xs ${TC.textSecondary}`}>Reports</p>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${TC.modalOverlay}`}>
          <div className={`w-full max-w-md rounded-2xl ${TC.modalContent} animate-in fade-in zoom-in duration-200`}>
            <div className={`p-6 flex justify-between items-center`}>
              <h3 className={`text-xl font-bold ${TC.textPrimary}`}>Delete User?</h3>
              <button onClick={() => setShowDeleteModal(false)} className={`transition-all duration-200 p-1 rounded-lg hover:rotate-90 transform group ${isLight ? "text-gray-500 hover:text-red-600 hover:bg-red-100" : "text-gray-400 hover:text-white hover:bg-red-500/20"}`}>
                <X className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </button>
            </div>
            <div className="p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="text-red-500 w-8 h-8" />
              </div>
              <p className={`mb-6 ${TC.textSecondary}`}>Are you sure you want to delete <span className="font-bold">{userToDelete?.name}</span>? This action cannot be undone.</p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => setShowDeleteModal(false)} className={`px-5 py-2.5 rounded-xl ${isLight ? "bg-gray-100 text-gray-700 hover:bg-gray-200" : "bg-gray-800 text-gray-300 hover:bg-gray-700"}`}>Cancel</button>
                <button onClick={handleDelete} disabled={deleteLoading} className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20 flex items-center gap-2">
                  {deleteLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />} Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* User Form Modal */}
      <UserForm
        open={showUserForm}
        handleClose={() => setShowUserForm(false)}
        fetchData={fetchUsers}
        id={editingUser?._id}
      />
    </div>
  );
};

export default Users;