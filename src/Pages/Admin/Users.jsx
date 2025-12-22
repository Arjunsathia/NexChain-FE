import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Plus,
  Mail,
  Phone,
  Calendar,
  Shield,
  CheckCircle,
  Ban,
  Wallet,
  FileText,
  Clock,
  Edit,
  Trash2,
  Loader2,
  X,
  Filter,
} from "lucide-react";
import UserForm from "@/Components/Admin/Users/UserForm";
import UserDeleteModal from "@/Components/Admin/Users/UserDeleteModal";
import api, { getData, deleteById } from "@/api/axiosConfig";
import toast from "react-hot-toast";
import useThemeCheck from "@/hooks/useThemeCheck";
import { SERVER_URL } from "@/api/axiosConfig";

const Users = () => {
  const isLight = useThemeCheck();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [filterRole, setFilterRole] = useState("all");

  // Modal States
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Tabs for Detail View
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getData("/users");
      const usersData = response?.users ?? response?.data ?? (Array.isArray(response) ? response : []);
      setUsers(Array.isArray(usersData) ? usersData.sort((a, b) => {
        // 1. Admins always on top
        if (a.role === 'admin' && b.role !== 'admin') return -1;
        if (a.role !== 'admin' && b.role === 'admin') return 1;

        // 2. Then sort alphabetically by name
        return (a.name || "").localeCompare(b.name || "");
      }) : []);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const handleDelete = async () => {
    if (!userToDelete) return;
    try {
      setDeleteLoading(true);
      const targetId = userToDelete.id || userToDelete._id;
      setUsers(users.filter((u) => u._id !== userToDelete._id));
      if (selectedUser?._id === userToDelete._id) setSelectedUser(null);
      setShowDeleteModal(false);
      try {
        await deleteById("/users", targetId);
        toast.success("User deleted successfully");
      } catch (err) {
        await api.post("/users/delete", { id: userToDelete._id });
        toast.success("Delete successful (fallback)");
      }
    } catch (error) {
      toast.error("Failed to delete user");
      fetchUsers();
    } finally {
      setDeleteLoading(false);
      setUserToDelete(null);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setShowUserForm(true);
  };

  const TC = useMemo(() => ({
    bgMain: "bg-transparent",
    bgPanel: isLight ? "bg-white" : "bg-gray-800/50 backdrop-blur-xl", // Matching Sidebar
    border: isLight ? "border-gray-200" : "border-white/10",
    textPrimary: isLight ? "text-gray-900" : "text-white",
    textSecondary: isLight ? "text-gray-500" : "text-gray-400",
    itemHover: isLight ? "hover:bg-gray-100" : "hover:bg-white/5",
    itemActive: isLight ? "bg-blue-50 border-blue-500" : "bg-cyan-500/10 border-cyan-500",
    bgCard: isLight ? "bg-white border-gray-200 shadow-sm" : "bg-gray-900 border-white/10 shadow-md",
    modalOverlay: "bg-black/60 backdrop-blur-sm",
    modalContent: isLight ? "bg-white shadow-2xl border border-gray-100" : "bg-[#1A1D26] shadow-2xl border border-gray-800",
  }), [isLight]);

  const UserListItem = ({ user }) => (
    <div
      onClick={() => setSelectedUser(user)}
      className={`group flex items-center gap-4 p-4 cursor-pointer transition-all border-b ${TC.border} ${selectedUser?._id === user._id
        ? `border-l-4 ${TC.itemActive}`
        : `${TC.itemHover} border-l-4 border-l-transparent`
        }`}
    >
      <div className="relative flex-shrink-0">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold overflow-hidden shadow-sm ${isLight ? "bg-gray-200 text-gray-600" : "bg-gray-800 text-gray-300"
          }`}>
          {user.image ? (
            <img
              src={user.image.startsWith('http') ? user.image : `${SERVER_URL}/uploads/${user.image}`}
              alt={user.name}
              className="w-full h-full object-cover"
            />
          ) : (
            user.name?.charAt(0).toUpperCase()
          )}
        </div>
        <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 ${isLight ? "border-white" : "border-[#1f2937]"} ${user.isActive ? "bg-green-500" : "bg-red-500"
          }`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center">
          <h4 className={`text-sm font-bold truncate ${TC.textPrimary}`}>{user.name}</h4>
          {user.role === 'admin' && <Shield className="w-3 h-3 text-cyan-500" />}
        </div>
        <p className={`text-xs truncate ${TC.textSecondary}`}>{user.email}</p>
      </div>
    </div>
  );

  const StatCard = ({ label, value, icon: Icon, colorClass }) => (
    <div className={`p-4 rounded-xl border ${TC.bgCard} flex items-center gap-3 hover:shadow-lg transition-shadow duration-300`}>
      <div className={`p-3 rounded-lg flex-shrink-0 ${colorClass} bg-opacity-10 dark:bg-opacity-20`}>
        <Icon className={`w-5 h-5 ${colorClass.replace("bg-", "text-")}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-[10px] uppercase font-bold tracking-wider leading-none mb-1.5 ${TC.textSecondary}`}>{label}</p>
        <p className={`text-lg font-black leading-tight truncate ${TC.textPrimary}`}>{value}</p>
      </div>
    </div>
  );

  return (
    // Update: Added p-4 gap-4 for Floating Layout
    <div className={`flex h-[calc(100vh-64px)] p-4 gap-4 overflow-hidden ${TC.bgMain} transition-colors duration-500 relative`}>

      {/* 1. Middle Pane: User List (Updated: rounded-3xl) */}
      <div className={`
        flex-shrink-0 flex flex-col ${TC.bgPanel} z-20 rounded-3xl overflow-hidden shadow-md
        transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
        w-full ${selectedUser ? "md:w-[380px]" : "md:w-full"}
      `}>
        {/* List Header (Updated: No BG/Border) */}
        <div className={`p-4 sticky top-0 z-10 backdrop-blur-md bg-transparent`}>
          <div className="flex justify-between items-center mb-4">
            <h1 className={`text-xl font-bold tracking-tight ${TC.textPrimary}`}>Users</h1>
            <div className="flex gap-2">
              <button
                onClick={() => setFilterRole(filterRole === "all" ? "admin" : "all")}
                className={`p-2 rounded-lg border transition-all ${filterRole === "admin" ? "bg-purple-100 border-purple-200 text-purple-600" : `${TC.border} ${TC.textSecondary} hover:bg-gray-100 dark:hover:bg-white/5`}`}
              >
                <Shield className="w-4 h-4" />
              </button>
              <button
                onClick={() => { setEditingUser(null); setShowUserForm(true); }}
                className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg shadow-blue-500/20 transition-all hover:scale-105 active:scale-95"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="relative group">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${TC.textSecondary} group-focus-within:text-blue-500`} />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-9 pr-4 py-2.5 text-sm rounded-lg outline-none border transition-all ${isLight
                ? "bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500"
                : "bg-gray-900/50 border-white/10 focus:bg-black/50 focus:border-cyan-500 text-white placeholder-gray-500"
                }`}
            />
          </div>
        </div>

        {/* List Items */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-blue-500" /></div>
          ) : filteredUsers.length > 0 ? (
            filteredUsers.map(user => <UserListItem key={user._id} user={user} />)
          ) : (
            <div className={`p-8 text-center ${TC.textSecondary}`}>No users found</div>
          )}
        </div>
      </div>

      {/* 2. Right Pane: Detail Panel (Updated: rounded-3xl & Glass Background) */}
      <div className={`
         fixed inset-0 z-[9999] md:static md:z-auto
         ${TC.bgPanel} md:flex-1 md:rounded-3xl md:overflow-hidden shadow-md
         transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
         ${selectedUser
          ? "translate-y-0 opacity-100 md:translate-y-0 md:translate-x-0"
          : "translate-y-full opacity-100 pointer-events-none md:pointer-events-none md:w-0 md:opacity-0 md:translate-x-20 md:translate-y-0"}
      `}>
        {selectedUser && (
          <div className="h-full w-full flex flex-col relative bg-transparent">
            <div className="absolute top-4 right-4 z-40">
              <button
                onClick={() => setSelectedUser(null)}
                className={`p-2 rounded-full bg-black/20 backdrop-blur-md text-white hover:bg-black/40 transition-all`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {/* Cover - Updated styling to match Detail Panel roundedness */}
              <div className="relative h-48 bg-gradient-to-r from-blue-600 to-indigo-700">
                <div className="absolute bottom-6 left-6 md:left-8 flex items-end gap-5">
                  <div className={`w-24 h-24 md:w-28 md:h-28 rounded-2xl border-4 shadow-xl overflow-hidden border-white/20 bg-white/10 backdrop-blur-md`}>
                    {selectedUser.image ? (
                      <img src={selectedUser.image.startsWith('http') ? selectedUser.image : `${SERVER_URL}/uploads/${selectedUser.image}`} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl font-bold bg-transparent text-white">{selectedUser.name?.charAt(0)}</div>
                    )}
                  </div>
                  <div className="pb-1 mb-1">
                    <h1 className="text-xl md:text-2xl font-black text-white drop-shadow-md">{selectedUser.name}</h1>
                    <div className="flex items-center gap-2 mt-1">
                      {/* FIXED ERROR HERE: selectedUser.isActive instead of user.isActive */}
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${selectedUser.isActive ? "bg-green-500" : "bg-red-500"} text-white`}>
                        {selectedUser.isActive ? "Active" : "Banned"}
                      </span>
                      {selectedUser.role === 'admin' && <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-purple-500 text-white">Admin</span>}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-14 px-6 md:px-8 pb-10">
                <div className="flex flex-col-reverse md:flex-row md:items-center justify-between gap-6 mb-8">
                  <div className="flex gap-4 border-b border-gray-200 dark:border-gray-800 overflow-x-auto">
                    {["Overview", "History", "Docs"].map(tab => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab.toLowerCase())}
                        className={`pb-2 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${activeTab === tab.toLowerCase() ? "text-blue-500 border-blue-500" : "text-gray-400 border-transparent hover:text-gray-500"
                          }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2 self-end md:self-auto">
                    <button
                      onClick={() => handleEdit(selectedUser)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5"
                    >
                      <Edit className="w-4 h-4" /> Edit Profile
                    </button>
                    <button
                      onClick={() => { setUserToDelete(selectedUser); setShowDeleteModal(true); }}
                      className="p-2 rounded-lg bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 dark:bg-red-900/10 dark:text-red-400 dark:border-red-900/30 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  {activeTab === "overview" && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <StatCard label="Joined" value={new Date(selectedUser.createdAt).toLocaleDateString()} icon={Calendar} colorClass="bg-blue-500" />
                        <StatCard label="Balance" value="$0.00" icon={Wallet} colorClass="bg-green-500" />
                        <StatCard label="Assets" value={selectedUser.purchasedCoins?.length || 0} icon={FileText} colorClass="bg-purple-500" />
                        <StatCard label="Status" value={selectedUser.isActive ? "Good" : "Suspended"} icon={CheckCircle} colorClass="bg-teal-500" />
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className={`p-6 rounded-2xl border ${TC.bgCard} ${TC.border} space-y-4`}>
                          <h3 className={`font-bold ${TC.textPrimary}`}>Contact Information</h3>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center"><Mail className="w-4 h-4 text-gray-500" /></div>
                            <div>
                              <p className={`text-xs ${TC.textSecondary}`}>Email Address</p>
                              <p className={`text-sm font-medium ${TC.textPrimary}`}>{selectedUser.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center"><Phone className="w-4 h-4 text-gray-500" /></div>
                            <div>
                              <p className={`text-xs ${TC.textSecondary}`}>Phone Number</p>
                              <p className={`text-sm font-medium ${TC.textPrimary}`}>{selectedUser.phone || "Not Set"}</p>
                            </div>
                          </div>
                        </div>
                        <div className={`p-6 rounded-2xl border ${TC.bgCard} ${TC.border}`}>
                          <h3 className={`font-bold mb-4 ${TC.textPrimary}`}>Admin Notes</h3>
                          <textarea
                            className={`w-full h-32 p-3 rounded-xl resize-none outline-none text-sm ${isLight ? "bg-gray-50 text-gray-800" : "bg-[#0f111a] text-gray-300 border border-gray-800 focus:border-blue-500"}`}
                            placeholder="Add note..."
                          ></textarea>
                          <button className="mt-2 text-xs font-bold text-blue-500 uppercase tracking-wider">Save Note</button>
                        </div>
                      </div>
                    </div>
                  )}
                  {activeTab === "history" && (
                    <div className={`h-64 flex flex-col items-center justify-center border-2 border-dashed rounded-2xl ${isLight ? "border-gray-200" : "border-gray-800"}`}>
                      <Clock className="w-10 h-10 text-gray-300 mb-3" />
                      <p className={`font-bold ${TC.textSecondary}`}>No transactions found</p>
                    </div>
                  )}
                  {activeTab === "docs" && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className={`h-40 rounded-xl border-2 border-dashed flex items-center justify-center ${isLight ? "border-gray-200" : "border-gray-800"}`}>
                        <div className="text-center">
                          <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                          <p className={`text-xs font-bold ${TC.textSecondary}`}>ID Card Front</p>
                        </div>
                      </div>
                      <div className={`h-40 rounded-xl border-2 border-dashed flex items-center justify-center ${isLight ? "border-gray-200" : "border-gray-800"}`}>
                        <div className="text-center">
                          <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                          <p className={`text-xs font-bold ${TC.textSecondary}`}>ID Card Back</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <UserForm
        open={showUserForm}
        handleClose={() => setShowUserForm(false)}
        fetchData={fetchUsers}
        id={editingUser?.id || editingUser?._id}
      />

      <UserDeleteModal
        showDeleteModal={showDeleteModal}
        setShowDeleteModal={setShowDeleteModal}
        userToDelete={userToDelete}
        handleDelete={handleDelete}
        deleteLoading={deleteLoading}
        TC={TC}
        isLight={isLight}
      />
    </div>
  );
};
export default Users;