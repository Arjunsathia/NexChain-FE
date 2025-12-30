import React, { useState, useEffect, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  Search,
  Mail,
  Phone,
  Calendar,
  Shield,
  CheckCircle,
  Ban,
  Wallet,
  FileText,
  Clock,
  Loader2,
  X,
  ArrowUpRight,
  ArrowDownLeft,
  User,
  Archive,
  RefreshCcw,
  Unlock,
  ChevronDown
} from "lucide-react";
import MessageUserModal from "@/Components/Admin/Users/MessageUserModal";
import UserStatDetailModal from "@/Components/Admin/Users/UserStatDetailModal";
import ActionConfirmModal from "@/Components/Admin/Users/ActionConfirmModal";
import { getData, updateById } from "@/api/axiosConfig";
import toast from "react-hot-toast";
import useThemeCheck from "@/hooks/useThemeCheck";
import { SERVER_URL } from "@/api/axiosConfig";
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { jwtDecode } from "jwt-decode";

const Users = () => {
  const isLight = useThemeCheck();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [filterRole, setFilterRole] = useState("all");

  // Current User Role State
  const [currentUserRole, setCurrentUserRole] = useState(null);

  useEffect(() => {
    // 1. Try to get token from localStorage with the key used in AuthPage
    let token = localStorage.getItem('NEXCHAIN_USER_TOKEN') || localStorage.getItem('token');

    // 2. Fallback: Try reading from cookie if localStorage failed (e.g. strict cookie auth)
    if (!token) {
      const match = document.cookie.match(new RegExp('(^| )token=([^;]+)'));
      if (match) token = match[2];
    }

    if (token) {
      try {
        const decoded = jwtDecode(token);
        // Ensure role defaults to 'user' if missing in payload
        setCurrentUserRole(decoded.role || 'user');
      } catch (e) {
        console.error("Token decode error", e);
      }
    }
  }, []);

  // Detailed User Data State
  const [userDetails, setUserDetails] = useState({
    balance: 0,
    holdings: [],
    transactions: [],
    kycData: null,
    kycStatus: "unverified"
  });
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Action Modal State
  const [actionModal, setActionModal] = useState({
    isOpen: false,
    type: null, // 'archive', 'restore', 'role_switch'
    user: null
  });
  const [actionLoading, setActionLoading] = useState(false);

  // Message Modal State
  const [showMessageModal, setShowMessageModal] = useState(false);

  // Stat Detail Modal State
  const [expandedStat, setExpandedStat] = useState(null);

  // Tabs for Detail View
  const [activeTab, setActiveTab] = useState("overview");

  const [showArchived, setShowArchived] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getData(`/users?includeDeleted=${showArchived}`);
      let usersData = response?.users ?? response?.data ?? (Array.isArray(response) ? response : []);

      const NOW = new Date().getTime();
      const INACTIVE_THRESHOLD = 7 * 24 * 60 * 60 * 1000; // 7 days

      if (Array.isArray(usersData)) {
        usersData = usersData.map(user => ({
          ...user,
          recentlyActive: user.lastLogin ? (NOW - new Date(user.lastLogin).getTime()) < INACTIVE_THRESHOLD : false
        }));
      }

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
  }, [showArchived]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const fetchUserDetails = useCallback(async (userId) => {
    if (!userId) return;
    try {
      setLoadingDetails(true);

      // Execute all requests in parallel
      const [balanceRes, holdingsRes, transactionsRes, kycRes] = await Promise.allSettled([
        getData(`/purchases/balance/${userId}`),
        getData(`/purchases/holdings/${userId}`),
        getData(`/purchases/transactions/${userId}`),
        getData(`/kyc/status/${userId}`)
      ]);

      const newDetails = {
        balance: 0,
        holdings: [],
        transactions: [],
        kycData: null,
        kycStatus: selectedUser?.kycStatus || "unverified"
      };

      if (balanceRes.status === 'fulfilled' && balanceRes.value.success) {
        newDetails.balance = balanceRes.value.virtualBalance;
      }
      if (holdingsRes.status === 'fulfilled' && holdingsRes.value.success) {
        newDetails.holdings = holdingsRes.value.holdings;
      }
      if (transactionsRes.status === 'fulfilled' && transactionsRes.value.success) {
        newDetails.transactions = transactionsRes.value.transactions;
      }
      if (kycRes.status === 'fulfilled' && kycRes.value.success) {
        newDetails.kycData = kycRes.value.kycData;
        newDetails.kycStatus = kycRes.value.kycStatus;
      }

      setUserDetails(newDetails);

    } catch (error) {
      console.error("Error fetching user details:", error);
      toast.error("Failed to load user details");
    } finally {
      setLoadingDetails(false);
    }
  }, [selectedUser]);

  // Fetch detailed info when a user is selected
  useEffect(() => {
    if (selectedUser) {
      fetchUserDetails(selectedUser.id || selectedUser._id);
    }
  }, [selectedUser, fetchUserDetails]);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || user.role === filterRole;

    // Filter by archived status based on toggle
    // If showArchived is true, show ONLY deleted users
    // If showArchived is false, show ONLY active users
    const matchesStatus = showArchived ? user.isDeleted : !user.isDeleted;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleAction = async () => {
    const { type, user } = actionModal;
    if (!type || !user) return;

    setActionLoading(true);
    try {
      const targetId = user.id || user._id;
      let updateData = {};

      if (type === 'archive') {
        updateData = { isDeleted: true };
      } else if (type === 'restore') {
        updateData = { isDeleted: false };
      } else if (type === 'promote_admin') {
        updateData = { role: 'admin' };
      } else if (type === 'demote_admin') {
        updateData = { role: 'user' };
      } else if (type === 'promote_super') {
        updateData = { role: 'superadmin' };
      } else if (type === 'demote_super') {
        updateData = { role: 'admin' };
      }

      await updateById("/users", targetId, updateData);

      toast.success(
        type === 'archive' ? "User archived successfully" :
          type === 'restore' ? "User restored successfully" :
            "User role updated successfully"
      );

      fetchUsers();
      if (selectedUser && (selectedUser.id === targetId || selectedUser._id === targetId)) {
        // Refresh selected user details or clear if archived and viewing active list
        if (type === 'archive' && !showArchived) {
          setSelectedUser(null);
        } else {
          // Re-fetch to update local state logic or just patch local
          const updatedUser = { ...user, ...updateData };
          setSelectedUser(updatedUser);
        }
      }

      setActionModal({ isOpen: false, type: null, user: null });

    } catch (error) {
      console.error("Action error:", error);
      toast.error("Failed to perform action");
    } finally {
      setActionLoading(false);
    }
  };

  const openActionModal = (type, user) => {
    setActionModal({
      isOpen: true,
      type,
      user
    });
  };

  const TC = useMemo(() => ({
    bgMain: "bg-transparent",
    bgPanel: isLight
      ? "bg-white/70 backdrop-blur-xl shadow-sm border border-gray-100 glass-card"
      : "bg-gray-900/95 backdrop-blur-none shadow-none border border-gray-700/50",
    bgCard: isLight
      ? "bg-white/70 backdrop-blur-xl shadow-sm border border-gray-100 glass-card"
      : "bg-gray-900/95 backdrop-blur-none shadow-none border border-gray-700/50",
    bgStatsCard: isLight
      ? "bg-white/70 backdrop-blur-xl shadow-sm border border-gray-100 glass-card hover:bg-white/80 hover:shadow-md"
      : "bg-gray-900/95 backdrop-blur-none shadow-none border border-gray-700/50 hover:bg-gray-800/80",
    border: isLight ? "border-gray-200" : "border-white/10",
    textPrimary: isLight ? "text-gray-900" : "text-white",
    textSecondary: isLight ? "text-gray-500" : "text-gray-400",
    textTertiary: isLight ? "text-gray-400" : "text-gray-500",
    bgItem: isLight
      ? "bg-gray-50/50 hover:bg-gray-100/50 border border-gray-100 isolation-isolate"
      : "bg-transparent hover:bg-white/5 isolation-isolate",
    itemHover: isLight ? "hover:bg-gray-100" : "hover:bg-white/5",
    itemActive: isLight ? "bg-blue-50 border-blue-500" : "bg-cyan-500/10 border-cyan-500",
    modalOverlay: "bg-black/60 backdrop-blur-sm",
    modalContent: isLight ? "bg-white" : "bg-[#0B0E11] border border-gray-800 prevent-seam force-layer",
    skeletonBase: isLight ? "#e5e7eb" : "#1f2937",
    skeletonHighlight: isLight ? "#f3f4f6" : "#374151",
    headerGradient: "from-blue-600 to-cyan-500",
  }), [isLight]);

  // UserListItem Component
  const UserListItem = useMemo(() => {
    const Component = ({ user }) => (
      <div
        onClick={() => setSelectedUser(user)}
        className={`
        group flex items-center gap-4 p-3.5 mx-2 my-1.5 rounded-2xl cursor-pointer 
        transition-all duration-300 border-l-4 relative overflow-hidden
        ${selectedUser?._id === user._id
            ? `${isLight ? 'bg-white shadow-sm' : 'bg-white/10 shadow-none'} border-blue-500 scale-[1.02] z-10`
            : `border-transparent ${TC.bgItem} hover:border-blue-500/30 hover:scale-[1.01] hover:shadow-sm`
          }
      `}
      >
        {/* Subtle background glow on hover */}
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none
        ${isLight ? 'bg-gradient-to-r from-blue-50/50 to-transparent' : 'bg-gradient-to-r from-blue-500/5 to-transparent'}`}
        />

        <div className="relative flex-shrink-0 z-10">
          <div className={`w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 p-0.5 shadow-md 
          ${selectedUser?._id === user._id ? 'ring-2 ring-blue-500/20' : ''} 
          group-hover:shadow-blue-500/30 transition-all`}>
            <div className="w-full h-full rounded-[10px] overflow-hidden bg-gray-900 flex items-center justify-center text-xs font-bold text-white relative">
              {user.image ? (
                <img
                  src={user.image.startsWith('http') ? user.image : `${SERVER_URL}/uploads/${user.image}`}
                  alt={user.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              ) : (
                <User className="w-5 h-5 text-gray-400" />
              )}
            </div>
          </div>
          {/* Status indicator with higher contrast border */}
          <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 
          ${isLight ? "border-white" : "border-gray-800"} 
          ${user.recentlyActive ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" : "bg-red-500"}`}
          />
        </div>

        <div className="flex-1 min-w-0 relative z-10">
          <div className="flex justify-between items-center mb-0.5">
            <h4 className={`text-sm font-bold truncate transition-colors ${selectedUser?._id === user._id ? 'text-blue-500' : TC.textPrimary}`}>
              {user.name}
            </h4>
            <div className="flex gap-1">
              {user.isFrozen && (
                <div className="p-1 rounded-md bg-orange-500/10" title="Account Frozen">
                  <Ban className="w-3 h-3 text-orange-500" />
                </div>
              )}
              {user.role === 'admin' && (
                <div className="p-1 rounded-md bg-blue-500/10">
                  <Shield className="w-3 h-3 text-blue-500" />
                </div>
              )}
              {user.isDeleted && (
                <div className="p-1 rounded-md bg-red-500/10" title="Archived">
                  <Archive className="w-3 h-3 text-red-500" />
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <p className={`text-[10px] sm:text-xs truncate transition-colors ${selectedUser?._id === user._id ? 'text-blue-400/80' : TC.textSecondary}`}>
              {user.email}
            </p>
            <span className={`text-[9px] uppercase tracking-widest font-black px-2 py-0.5 rounded-full 
            ${selectedUser?._id === user._id
                ? 'bg-blue-500 text-white'
                : 'bg-blue-500/10 text-blue-500/70 border border-blue-500/10'}`}>
              {user.role}
            </span>
          </div>
        </div>
      </div>
    );
    Component.displayName = "UserListItem";
    return Component;
  }, [selectedUser, isLight, TC]);

  return (
    // Updated Layout: Vertical Flex for Header + Content
    <div className={`flex flex-col h-[calc(100vh-24px)] p-2 sm:p-4 lg:p-4 gap-4 lg:gap-6 ${TC.bgMain} relative fade-in`}>
      {/* 1. Page Header (Admin Styled) */}
      <div className="flex-shrink-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className={`text-2xl lg:text-3xl font-bold tracking-tight mb-1 ${TC.textPrimary}`}>
            User <span className="bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">Management</span>
          </h1>
          <p className={`text-sm font-medium ${TC.textSecondary}`}>
            Manage system users, permissions, and accounts
          </p>
        </div>
        {/* Removed "Add User" button */}
      </div>

      {/* 2. Main Content Area (Split View) */}
      <div className={`
        flex-1 flex gap-4 overflow-hidden min-h-0
        fade-in
      `} style={{ animationDelay: "0.2s" }}>
        {/* Left Pane: User List */}
        <div className={`
          flex-shrink-0 flex flex-col ${TC.bgPanel} z-20 rounded-3xl overflow-hidden
          transition-all duration-200 ease-out
          w-full ${selectedUser ? "md:w-[380px]" : "md:w-full"}
        `}>
          {/* List Toolbar (Search & Filter) */}
          <div className="p-4 sticky top-0 z-10 backdrop-blur-md bg-transparent border-b border-gray-100 dark:border-gray-800/50 space-y-3">
            {/* Search and Filters Row */}
            <div className="flex gap-2">
              <div className="relative group flex-1">
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${TC.textSecondary} group-focus-within:text-blue-500`} />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-9 pr-4 py-2 text-sm rounded-xl outline-none border transition-all ${isLight
                    ? "bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500"
                    : "bg-gray-900/50 border-white/10 focus:bg-black/50 focus:border-cyan-500 text-white placeholder-gray-500"
                    }`}
                />
              </div>
              <button
                onClick={() => setFilterRole(filterRole === "all" ? "admin" : "all")}
                className={`px-3 py-2 rounded-xl border transition-all flex items-center gap-2 text-xs font-bold ${filterRole === "admin"
                  ? "bg-purple-500/10 border-purple-500/50 text-purple-500"
                  : `${TC.border} ${TC.textSecondary} hover:bg-gray-100 dark:hover:bg-white/5`
                  }`}
                title="Toggle Admin Filter"
              >
                <Shield className="w-4 h-4" />
                <span className="hidden sm:inline">Admin</span>
              </button>
              <button
                onClick={() => setShowArchived(!showArchived)}
                className={`px-3 py-2 rounded-xl border transition-all flex items-center gap-2 text-xs font-bold ${showArchived
                  ? "bg-red-500/10 border-red-500/50 text-red-500"
                  : `${TC.border} ${TC.textSecondary} hover:bg-gray-100 dark:hover:bg-white/5`
                  }`}
                title="Toggle Archived"
              >
                <Archive className="w-4 h-4" />
                <span className="hidden sm:inline">Archived</span>
              </button>
            </div>
          </div>

          {/* List Items */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
            {loading ? (
              <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-blue-500" /></div>
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map(user => <UserListItem key={user._id} user={user} />)
            ) : (
              <div className={`p-8 text-center ${TC.textSecondary}`}>No users found</div>
            )}
          </div>
        </div>

        {/* 2. Right Pane: Detail Panel (Responsive Portal Logic) */}
        <UserDetailPane
          selectedUser={selectedUser}
          setSelectedUser={setSelectedUser}
          TC={TC}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          userDetails={userDetails}
          loadingDetails={loadingDetails}
          setExpandedStat={setExpandedStat}

          // Use current user role to determine what buttons to show
          currentUserRole={currentUserRole}
          openActionModal={openActionModal}
          setShowMessageModal={setShowMessageModal}
          isLight={isLight}
        />

        <ActionConfirmModal
          isOpen={actionModal.isOpen}
          onClose={() => setActionModal({ ...actionModal, isOpen: false })}
          onConfirm={handleAction}
          actionType={actionModal.type}
          userName={actionModal.user?.name}
          loading={actionLoading}
          TC={TC}
        />

        <MessageUserModal
          isOpen={showMessageModal}
          onClose={() => setShowMessageModal(false)}
          user={selectedUser}
          TC={TC}
          isLight={isLight}
        />

        {expandedStat && createPortal(
          <UserStatDetailModal
            isOpen={!!expandedStat}
            onClose={() => setExpandedStat(null)}
            statType={expandedStat}
            user={selectedUser}
            userDetails={userDetails}
            TC={TC}
            isLight={isLight}
          />,
          document.body
        )}
      </div>
      {/* Closing Main Content Area */}
    </div >
  );
};
const UserDetailPane = ({
  selectedUser,
  setSelectedUser,
  TC,
  activeTab,
  setActiveTab,
  userDetails,
  loadingDetails,
  setExpandedStat,
  openActionModal,
  setShowMessageModal,
  currentUserRole,
  isLight
}) => {
  // Simple media query hook
  const [isDesktop, setIsDesktop] = useState(window.matchMedia("(min-width: 768px)").matches);

  const { email } = selectedUser || {};

  // Permission Logic Helpers
  const canModify = useCallback((targetRole) => {
    // 1. Super Admin actor
    if (currentUserRole === 'superadmin') {
      // Cannot modify primary system admin
      if (email === 'nexchainsystem@gmail.com') return false;
      return true;
    }

    // 2. Admin actor
    if (currentUserRole === 'admin') {
      // Cannot modify Super Admin or other Admins
      if (targetRole === 'superadmin') return false;
      if (targetRole === 'admin') return false;
      return true;
    }

    // 3. User actor (should not be here anyway)
    return false;
  }, [currentUserRole, email]);

  const canArchive = useMemo(() => {
    if (!selectedUser) return false;
    // Hard Stop for Primary Super Admin
    if (selectedUser.email === 'nexchainsystem@gmail.com') return false;

    if (currentUserRole === 'superadmin') return true;
    if (currentUserRole === 'admin' && selectedUser.role === 'user') return true;
    return false;
  }, [currentUserRole, selectedUser]);

  const renderRoleButton = () => {
    if (!selectedUser) return null;
    const targetRole = selectedUser.role;

    // Hard Stop for Primary Super Admin
    if (selectedUser.email === 'nexchainsystem@gmail.com') return null;

    // IF ACTOR IS SUPER ADMIN
    if (currentUserRole === 'superadmin') {
      if (targetRole === 'user') {
        return (
          <button
            onClick={() => openActionModal('promote_admin', selectedUser)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-500/20 transition-all hover:-translate-y-0.5"
          >
            <Shield className="w-4 h-4" /> Make Admin
          </button>
        );
      }
      if (targetRole === 'admin') {
        return (
          <div className="flex gap-2">
            <button
              onClick={() => openActionModal('demote_admin', selectedUser)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-700 text-white font-bold text-sm shadow-lg shadow-gray-500/20 transition-all hover:-translate-y-0.5"
            >
              <RefreshCcw className="w-4 h-4" /> Revoke Admin
            </button>
            <button
              onClick={() => openActionModal('promote_super', selectedUser)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-lg shadow-purple-500/20 transition-all hover:-translate-y-0.5"
            >
              <Shield className="w-4 h-4" /> Make Super Admin
            </button>
          </div>
        );
      }
      if (targetRole === 'superadmin') {
        return (
          <button
            onClick={() => openActionModal('demote_super', selectedUser)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-lg shadow-orange-500/20 transition-all hover:-translate-y-0.5"
          >
            <RefreshCcw className="w-4 h-4" /> Demote Super Admin
          </button>
        );
      }
    }

    // IF ACTOR IS ADMIN
    if (currentUserRole === 'admin') {
      if (targetRole === 'user') {
        return (
          <button
            onClick={() => openActionModal('promote_admin', selectedUser)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-500/20 transition-all hover:-translate-y-0.5"
          >
            <Shield className="w-4 h-4" /> Make Admin
          </button>
        );
      }
      // Admin cannot modify other admins or superadmins
    }

    return null;
  };

  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)");
    const listener = () => setIsDesktop(media.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);

  const content = (
    <div className={`
      fixed inset-0 z-[99999] md:static md:z-auto
      w-full h-[100dvh] md:w-auto md:h-auto
      ${isLight ? 'bg-white' : 'bg-gray-950'} md:bg-transparent ${/* Solid bg on mobile, transparent/variable on desktop */ ""}
      md:flex-1 md:rounded-3xl md:overflow-hidden md:border md:border-gray-200 md:dark:border-gray-800
      md:backdrop-blur-xl md:shadow-sm md:glass-card
      transition-all duration-500 cubic-bezier(0.32, 0.72, 0, 1)
      flex flex-col
      ${selectedUser
        ? "translate-y-0 opacity-100 md:!translate-y-0 md:translate-x-0"
        : "translate-y-[110%] opacity-100 md:opacity-0 pointers-events-none md:!translate-y-0 md:w-0 md:translate-x-20"}
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
                    <div className="w-full h-full flex items-center justify-center bg-transparent">
                      <User className="w-12 h-12 text-white/50" />
                    </div>
                  )}
                </div>
                <div className="pb-1 mb-1">
                  <h1 className="text-xl md:text-2xl font-black text-white drop-shadow-md">{selectedUser.name}</h1>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${selectedUser.recentlyActive ? "bg-green-500" : "bg-red-500"} text-white`}>
                      {selectedUser.recentlyActive ? "Active" : "Inactive"}
                    </span>
                    {selectedUser.role === 'admin' && <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-purple-500 text-white">Admin</span>}
                    {selectedUser.isDeleted && <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-orange-500 text-white">Archived</span>}
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
                {/* Updated Action Buttons */}
                <div className="flex gap-2 self-end md:self-auto">
                  {renderRoleButton()}

                  {/* Archive Logic */}
                  {(selectedUser.isDeleted && canArchive) ? (
                    <button
                      onClick={() => openActionModal('restore', selectedUser)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold text-sm shadow-lg shadow-green-500/20 transition-all hover:-translate-y-0.5"
                    >
                      <Unlock className="w-4 h-4" /> Restore User
                    </button>
                  ) : (canArchive && (
                    <button
                      onClick={() => openActionModal('archive', selectedUser)}
                      className="p-2 rounded-lg bg-orange-50 text-orange-600 border border-orange-100 hover:bg-orange-100 dark:bg-orange-900/10 dark:text-orange-400 dark:border-orange-900/30 transition-all"
                      title="Archive User"
                    >
                      <Archive className="w-4 h-4" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                {activeTab === "overview" && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {/* Stats cards logic same as before... */}
                      <div
                        onClick={() => setExpandedStat('joined')}
                        className={`p-4 rounded-2xl ${TC.bgStatsCard} flex items-center gap-4 cursor-pointer active:scale-95 transform transition-all group overflow-hidden relative`}
                      >
                        <div className={`absolute -top-10 -right-10 w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 opacity-5 blur-2xl group-hover:opacity-10 transition-opacity duration-300`} />
                        <div className={`p-3 rounded-xl flex-shrink-0 bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg text-white group-hover:shadow-blue-500/40 transition-shadow`}>
                          <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        <div className="flex-1 min-w-0 relative z-10">
                          <p className={`text-[10px] uppercase font-bold tracking-wider leading-none mb-1.5 ${TC.textSecondary}`}>Joined</p>
                          <p className={`text-lg sm:text-xl font-bold leading-tight truncate ${TC.textPrimary} group-hover:text-blue-500 transition-colors`}>
                            {new Date(selectedUser.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div
                        onClick={() => setExpandedStat('balance')}
                        className={`p-4 rounded-2xl ${TC.bgStatsCard} flex items-center gap-4 cursor-pointer active:scale-95 transform transition-all group overflow-hidden relative`}
                      >
                        <div className={`absolute -top-10 -right-10 w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 opacity-5 blur-2xl group-hover:opacity-10 transition-opacity duration-300`} />
                        <div className={`p-3 rounded-xl flex-shrink-0 bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg text-white group-hover:shadow-blue-500/40 transition-shadow`}>
                          <Wallet className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        <div className="flex-1 min-w-0 relative z-10">
                          <p className={`text-[10px] uppercase font-bold tracking-wider leading-none mb-1.5 ${TC.textSecondary}`}>Balance</p>
                          <p className={`text-lg sm:text-xl font-bold leading-tight truncate ${TC.textPrimary} group-hover:text-blue-500 transition-colors`}>
                            {loadingDetails ? <Skeleton width={80} baseColor={TC.skeletonBase} highlightColor={TC.skeletonHighlight} /> : `$${userDetails.balance?.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                          </p>
                        </div>
                      </div>

                      <div
                        onClick={() => setExpandedStat('assets')}
                        className={`p-4 rounded-2xl ${TC.bgStatsCard} flex items-center gap-4 cursor-pointer active:scale-95 transform transition-all group overflow-hidden relative`}
                      >
                        <div className={`absolute -top-10 -right-10 w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 opacity-5 blur-2xl group-hover:opacity-10 transition-opacity duration-300`} />
                        <div className={`p-3 rounded-xl flex-shrink-0 bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg text-white group-hover:shadow-blue-500/40 transition-shadow`}>
                          <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        <div className="flex-1 min-w-0 relative z-10">
                          <p className={`text-[10px] uppercase font-bold tracking-wider leading-none mb-1.5 ${TC.textSecondary}`}>Assets</p>
                          <p className={`text-lg sm:text-xl font-bold leading-tight truncate ${TC.textPrimary} group-hover:text-blue-500 transition-colors`}>
                            {loadingDetails ? <Skeleton width={80} baseColor={TC.skeletonBase} highlightColor={TC.skeletonHighlight} /> : (userDetails.holdings?.length || 0)}
                          </p>
                        </div>
                      </div>

                      <div
                        onClick={() => setExpandedStat('status')}
                        className={`p-4 rounded-2xl ${TC.bgStatsCard} flex items-center gap-4 cursor-pointer active:scale-95 transform transition-all group overflow-hidden relative`}
                      >
                        <div className={`absolute -top-10 -right-10 w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 opacity-5 blur-2xl group-hover:opacity-10 transition-opacity duration-300`} />
                        <div className={`p-3 rounded-xl flex-shrink-0 bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg text-white group-hover:shadow-blue-500/40 transition-shadow`}>
                          {selectedUser.recentlyActive ? <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" /> : <Ban className="w-5 h-5 sm:w-6 sm:h-6" />}
                        </div>
                        <div className="flex-1 min-w-0 relative z-10">
                          <p className={`text-[10px] uppercase font-bold tracking-wider leading-none mb-1.5 ${TC.textSecondary}`}>Status</p>
                          <p className={`text-lg sm:text-xl font-bold leading-tight truncate ${TC.textPrimary} group-hover:text-blue-500 transition-colors`}>
                            {selectedUser.recentlyActive ? "Active" : "Inactive"}
                          </p>
                        </div>
                      </div>
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

                        <div className="pt-2 flex gap-3">
                          <button
                            onClick={() => setShowMessageModal(true)}
                            className={`flex-1 py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${isLight ? "bg-blue-50 text-blue-600 hover:bg-blue-100" : "bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"}`}
                          >
                            <Mail className="w-4 h-4" /> Send Email
                          </button>
                        </div>
                      </div>
                      <div className={`p-6 rounded-2xl border ${TC.bgCard} ${TC.border}`}>
                        <h3 className={`font-bold mb-4 ${TC.textPrimary}`}>Admin Notes</h3>
                        <textarea
                          className={`w-full h-32 p-3 rounded-xl resize-none outline-none text-sm ${isLight ? "bg-gray-50 text-gray-800" : "bg-[#0f111a] text-gray-300 border border-gray-800 focus:border-blue-500"}`}
                          placeholder="Add note..."
                        ></textarea>
                        <button className="mt-3 w-full py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm shadow-lg shadow-blue-500/20 hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all text-center flex items-center justify-center gap-2">Save Note</button>
                      </div>
                    </div>
                  </div>
                )}
                {/* History & Docs Tabs remain largely unchanged in rendering logic, just simple display */}
                {activeTab === "history" && (
                  <div className="space-y-4">
                    {loadingDetails ? (
                      <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-blue-500" /></div>
                    ) : userDetails.transactions && userDetails.transactions.length > 0 ? (
                      userDetails.transactions.map((tx) => (
                        <div key={tx._id} className={`flex items-center justify-between p-4 rounded-xl border ${TC.bgCard} ${TC.border}`}>
                          <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-full ${tx.type === 'buy' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                              {tx.type === 'buy' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                            </div>
                            <div>
                              <p className={`font-bold ${TC.textPrimary}`}>{tx.coinName} ({tx.coinSymbol?.toUpperCase()})</p>
                              <p className={`text-xs ${TC.textSecondary}`}>{new Date(tx.transactionDate).toLocaleString()}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-bold ${tx.type === 'buy' ? 'text-green-500' : 'text-red-500'}`}>
                              {tx.type === 'buy' ? '+' : '-'}{tx.quantity?.toFixed(6)}
                            </p>
                            <p className={`text-xs ${TC.textSecondary}`}>${tx.totalValue?.toFixed(2)}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className={`h-64 flex flex-col items-center justify-center border-2 border-dashed rounded-2xl ${isLight ? "border-gray-200" : "border-gray-800"}`}>
                        <Clock className="w-10 h-10 text-gray-300 mb-3" />
                        <p className={`font-bold ${TC.textSecondary}`}>No transactions found</p>
                      </div>
                    )}
                  </div>
                )}
                {activeTab === "docs" && (
                  <div className="grid grid-cols-2 gap-4">
                    {userDetails.kycData?.documentImage ? (
                      <div className="col-span-2">
                        <div className={`p-4 rounded-xl border ${TC.bgCard} ${TC.border} mb-4`}>
                          <h3 className={`font-bold mb-2 ${TC.textPrimary}`}>KYC Status: <span className={`${userDetails.kycStatus === 'verified' ? 'text-green-500' : 'text-yellow-500'} uppercase`}>{userDetails.kycStatus}</span></h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className={`text-xs ${TC.textSecondary}`}>Full Name</p>
                              <p className={`text-sm font-medium ${TC.textPrimary}`}>{userDetails.kycData.fullName}</p>
                            </div>
                            <div>
                              <p className={`text-xs ${TC.textSecondary}`}>ID Type</p>
                              <p className={`text-sm font-medium ${TC.textPrimary}`}>{userDetails.kycData.idType}</p>
                            </div>
                            <div>
                              <p className={`text-xs ${TC.textSecondary}`}>ID Number</p>
                              <p className={`text-sm font-medium ${TC.textPrimary}`}>{userDetails.kycData.idNumber}</p>
                            </div>
                          </div>
                        </div>
                        <div className={`rounded-xl border border-dashed overflow-hidden ${isLight ? "border-gray-200" : "border-gray-800"}`}>
                          <img
                            src={userDetails.kycData.documentImage.startsWith('http') ? userDetails.kycData.documentImage : `${SERVER_URL}/uploads/${userDetails.kycData.documentImage}`}
                            alt="KYC Document"
                            className="w-full h-auto object-contain max-h-[500px]"
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className={`h-40 col-span-2 rounded-xl border-2 border-dashed flex items-center justify-center ${isLight ? "border-gray-200" : "border-gray-800"}`}>
                          <div className="text-center">
                            <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                            <p className={`text-xs font-bold ${TC.textSecondary}`}>No KYC Documents Submitted</p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // If NOT Desktop (Mobile) and a user is selected, render via Portal to body.
  if (!isDesktop) {
    return createPortal(content, document.body);
  }

  // Otherwise (Desktop), render inline.
  return content;
};

export default Users;