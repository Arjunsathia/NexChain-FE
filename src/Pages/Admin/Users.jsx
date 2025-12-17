import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Loader2,
  Plus,
} from "lucide-react";
import UserForm from "@/Components/Admin/Users/UserForm";
import UsersTable from "@/Components/Admin/Users/UsersTable";
import UserDeleteModal from "@/Components/Admin/Users/UserDeleteModal";
import UserDetailsModal from "@/Components/Admin/Users/UserDetailsModal";

import api, { getData, deleteById, deleteWatchList } from "@/api/axiosConfig";
import toast from "react-hot-toast";

// ----------------------------------------------------

import useThemeCheck from "@/hooks/useThemeCheck";

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
      ? "bg-white shadow-sm sm:shadow-[0_6px_25px_rgba(0,0,0,0.12)]" 
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
      toast.error("Failed to fetch users", {
        style: {
          background: "#FEE2E2",
          color: "#991B1B",
          boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
          borderRadius: "8px",
          fontWeight: "600",
          fontSize: "14px",
          padding: "12px 16px",
          border: "none",
        },
        iconTheme: { primary: "#DC2626", secondary: "#FFFFFF" },
      });
      setUsers([]);
    } finally {
      // Small delay so the fade/slide animation looks smooth like your User Dashboard
      setLoading(false);
      setTimeout(() => setContentLoaded(true), 300); 
    }
  };

  const handleDelete = async () => {
    if (!userToDelete) return;

    // Optimistic Update: Immediately remove from UI
    const previousUsers = [...users];
    setUsers(users.filter((u) => u._id !== userToDelete._id));
    setShowDeleteModal(false);

    try {
      setDeleteLoading(true);
      
      // Try Strategy 1: Standard REST DELETE /users/:id using _id
      try {
        await deleteById("/users", userToDelete._id);
      } catch (err1) {
        console.warn("Delete Strategy 1 failed:", err1);
        
        // Try Strategy 2: REST DELETE /users/:id using .id property if different
        if (userToDelete.id && userToDelete.id !== userToDelete._id) {
           await deleteById("/users", userToDelete.id);
        } else {
           // If Strategy 2 is not applicable or failed, try Strategy 3
           throw err1; 
        }
      }
      
      toast.success("User deleted successfully", {
        style: {
          background: "#DCFCE7",
          color: "#166534",
          boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
          borderRadius: "8px",
          fontWeight: "600",
          fontSize: "14px",
          padding: "12px 16px",
          border: "none",
        },
        iconTheme: { primary: "#16A34A", secondary: "#FFFFFF" },
      });
    } catch (error) {
       // Deep fallback: Manual axios attempts if helper failed completely
       try {
          console.warn("Helpers failed, trying manual fallbacks...");
          // Strategy 3: POST /users/delete { id }
          await api.post("/users/delete", { id: userToDelete._id });
          toast.success("User deleted successfully", {
            style: {
              background: "#DCFCE7",
              color: "#166534",
              boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
              borderRadius: "8px",
              fontWeight: "600",
              fontSize: "14px",
              padding: "12px 16px",
              border: "none",
            },
            iconTheme: { primary: "#16A34A", secondary: "#FFFFFF" },
          });
       } catch (finalError) {
          console.error("All delete strategies failed:", finalError);
          // Revert optimistic update on total failure
          setUsers(previousUsers);
          toast.error("Failed to delete user", {
            style: {
              background: "#FEE2E2",
              color: "#991B1B",
              boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
              borderRadius: "8px",
              fontWeight: "600",
              fontSize: "14px",
              padding: "12px 16px",
              border: "none",
            },
            iconTheme: { primary: "#DC2626", secondary: "#FFFFFF" },
          });
       }
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
    <div className={`flex-1 p-2 sm:p-4 lg:p-8 space-y-4 lg:space-y-6 min-h-screen ${TC.textPrimary}`}>
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
          <UsersTable 
            currentUsers={currentUsers} 
            TC={TC} 
            isLight={isLight} 
            setSelectedUser={setSelectedUser} 
            setEditingUser={setEditingUser} 
            setShowUserForm={setShowUserForm} 
            confirmDelete={confirmDelete} 
          />

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
      )}

      {/* View User Modal */}
      <UserDetailsModal 
        selectedUser={selectedUser} 
        setSelectedUser={setSelectedUser} 
        TC={TC} 
        isLight={isLight} 
      />

      {/* Delete Modal */}
      <UserDeleteModal 
        showDeleteModal={showDeleteModal} 
        setShowDeleteModal={setShowDeleteModal} 
        userToDelete={userToDelete} 
        handleDelete={handleDelete} 
        deleteLoading={deleteLoading} 
        TC={TC} 
        isLight={isLight} 
      />

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