import { deleteById, getData } from "@/api/axiosConfig";
import React, { useCallback, useEffect, useState } from "react";
import {
  FaEye,
  FaPlus,
  FaSearch,
  FaEnvelope,
  FaPhone,
  FaCalendar,
  FaUser,
  FaTimes,
  FaWallet,
  FaCoins,
  FaStar,
  FaChartLine,
  FaTrash,
  FaArrowUp,
  FaArrowDown,
} from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import UserForm from "../Components/Users/UserForm";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function Users() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [showForm, setShowForm] = useState({
    show: false,
    id: "",
  });
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [Loading, setLoading] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getData("/users");
      setData(res);
      setFilteredData(res);
    } catch (err) {
      console.error("Failed to fetch data", err);
      toast.error("Failed to fetch users data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Fetch user details with holdings data when viewing a user
  const fetchUserDetails = useCallback(async (userId) => {
    setModalLoading(true);
    try {
      // Try to get user with full details including purchasedCoins and watchlist
      const userDetails = await getData(`/users/${userId}`);
      return userDetails;
    } catch (err) {
      console.error("Failed to fetch user details", err);
      // If detailed endpoint fails, try to get basic user and separate holdings
      try {
        const basicUser = await getData(`/users/${userId}`);
        // Try to get purchased coins separately
        const purchasedCoins = await getData(
          `/purchased-coins?userId=${userId}`
        );
        // Try to get watchlist separately
        const watchlist = await getData(`/watchlist?userId=${userId}`);

        return {
          ...basicUser,
          purchasedCoins: purchasedCoins || [],
          watchlist: watchlist || [],
        };
      } catch (error) {
        console.error("Failed to fetch separate user data", error);
        return null;
      }
    } finally {
      setModalLoading(false);
    }
  }, []);

  // Search functionality
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredData(data);
      setCurrentPage(1);
    } else {
      const filtered = data.filter(
        (user) =>
          user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.phone?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredData(filtered);
      setCurrentPage(1);
    }
  }, [searchTerm, data]);

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    setLoading(true);
    try {
      await deleteById("/users", userToDelete.id);
      toast.success("User deleted successfully!", {
        icon: "✅",
        style: {
          background: "#111827",
          color: "#22c55e",
          fontWeight: "600",
          fontSize: "14px",
          padding: "12px 16px",
          borderRadius: "8px",
        },
      });
      fetchData();
      setShowDeleteModal(false);
      setUserToDelete(null);
    } catch (err) {
      console.error("Deletion failed:", err);
      toast.error("Failed to delete user. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  const handleViewUser = async (user) => {
    const userDetails = await fetchUserDetails(user.id);
    if (userDetails) {
      setSelectedUser(userDetails);
      setShowViewModal(true);
    } else {
      toast.error("Failed to load user details");
    }
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    setSelectedUser(null);
  };

  // Calculate user statistics with holdings data
  const getUserStats = (user) => {
    if (!user) {
      return {
        walletBalance: 0,
        coinsOwned: 0,
        totalCoinsHeld: 0,
        totalInvested: 0,
        portfolioValue: 0,
        profitLoss: 0,
        profitLossPercentage: 0,
        watchlistItems: 0,
        totalTrades: 0,
        joinDate: "Unknown",
      };
    }

    // Calculate holdings statistics
    const purchasedCoins = user.purchasedCoins || [];
    const holdings = purchasedCoins.reduce(
      (acc, coin) => {
        const quantity = coin.quantity || 0;
        const purchasePrice = coin.purchasePrice || coin.currentPrice || 0;
        const currentPrice = coin.currentPrice || purchasePrice;

        acc.totalCoins += quantity;
        acc.totalInvested += quantity * purchasePrice;
        acc.currentValue += quantity * currentPrice;
        return acc;
      },
      { totalCoins: 0, totalInvested: 0, currentValue: 0 }
    );

    const profitLoss = holdings.currentValue - holdings.totalInvested;
    const profitLossPercentage =
      holdings.totalInvested > 0
        ? (profitLoss / holdings.totalInvested) * 100
        : 0;

    return {
      walletBalance: user.balance || 0,
      coinsOwned: purchasedCoins.length || 0,
      totalCoinsHeld: holdings.totalCoins,
      totalInvested: holdings.totalInvested,
      portfolioValue: holdings.currentValue,
      profitLoss: profitLoss,
      profitLossPercentage: profitLossPercentage,
      watchlistItems: user.watchlist?.length || 0,
      totalTrades: purchasedCoins.length || 0,
      joinDate: user.createdAt
        ? new Date(user.createdAt).toLocaleDateString()
        : "Unknown",
    };
  };

  // Format currency values
  const formatCurrency = (value) => {
    return `$${(value || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredData.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Previous button
    buttons.push(
      <button
        key="prev"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg border border-gray-600 bg-gray-800/50 text-gray-300 
                   disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700/50 transition-all duration-200 
                   text-xs sm:text-sm"
      >
        Previous
      </button>
    );

    // Page numbers
    for (let page = startPage; page <= endPage; page++) {
      buttons.push(
        <button
          key={page}
          onClick={() => handlePageChange(page)}
          className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg border transition-all duration-200 text-xs sm:text-sm
            ${
              currentPage === page
                ? "bg-cyan-600 border-cyan-500 text-white shadow-lg shadow-cyan-500/25"
                : "border-gray-600 bg-gray-800/50 text-gray-300 hover:bg-gray-700/50"
            }`}
        >
          {page}
        </button>
      );
    }

    // Next button
    buttons.push(
      <button
        key="next"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg border border-gray-600 bg-gray-800/50 text-gray-300 
                   disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700/50 transition-all duration-200 
                   text-xs sm:text-sm"
      >
        Next
      </button>
    );

    return buttons;
  };

  return (
    <>
      <main className="flex-1 px-2 sm:px-3 lg:px-4 py-3 sm:py-4 lg:py-6 space-y-3 sm:space-y-4 lg:space-y-6 fade-in">
        {/* Header Section with Search */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3 fade-in">
          <div className="flex-1 w-full sm:w-auto min-w-0 text-center sm:text-left">
<h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-t from-cyan-400 to-blue-500 bg-clip-text text-transparent">
  Users Management
</h1>


            <p className="text-xs sm:text-sm text-gray-400 mt-1 truncate">
              Manage platform users and permissions
            </p>
          </div>

          {/* Search Bar */}
          <div className="w-full sm:w-48 lg:w-56 xl:w-64 order-2 sm:order-none">
            <div className="relative">
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-800/50 border border-gray-600 rounded-lg py-2 px-3 
                         text-white placeholder-gray-400 text-xs sm:text-sm focus:outline-none 
                         focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all duration-300 
                         pr-9"
              />
              <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
            </div>
          </div>

          <button
            className="w-full sm:w-auto bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 
              text-white font-medium py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg sm:rounded-xl transition-all duration-300 
              shadow-lg hover:shadow-cyan-500/25 transform hover:scale-105 flex items-center justify-center gap-2
              text-xs sm:text-sm border border-cyan-500/30 hover:border-cyan-400/50 fade-in order-1 sm:order-none"
            onClick={() => setShowForm({ show: true, id: "" })}
          >
            <FaPlus className="text-xs sm:text-sm" />
            <span>Create User</span>
          </button>
        </div>

        {/* Content Section */}
        {Loading ? (
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4 sm:p-6 lg:p-8 text-center fade-in">
            <div className="flex justify-center items-center gap-2 sm:gap-3 text-cyan-400">
              <div className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs sm:text-sm lg:text-base">
                Loading users...
              </span>
            </div>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4 sm:p-6 lg:p-8 text-center fade-in">
            <div className="text-gray-400 text-sm sm:text-base lg:text-lg">
              {searchTerm
                ? "No users found matching your search"
                : "No users found"}
            </div>
            <button
              className="mt-3 sm:mt-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 
                         text-white font-medium py-2 px-3 sm:px-4 rounded-lg transition-all duration-200 w-full sm:w-auto 
                         text-xs sm:text-sm shadow-lg hover:shadow-cyan-500/25 transform hover:scale-105
                         border border-cyan-500/30 hover:border-cyan-400/50 fade-in"
              onClick={() => setShowForm({ show: true, id: "" })}
            >
              Create First User
            </button>
          </div>
        ) : (
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl overflow-hidden fade-in">
            {/* Mobile/Tablet Card View - Shows up to xl breakpoint */}
            <div className="xl:hidden space-y-2 sm:space-y-3 p-2 sm:p-3 lg:p-4">
              {currentItems.map((user, index) => (
                <div
                  key={user.id}
                  className="bg-gradient-to-br from-gray-800/50 to-gray-800/30 rounded-lg sm:rounded-xl p-2 sm:p-3 lg:p-4 border border-gray-700
                    transition-all duration-300 ease-out hover:bg-gray-800/50 hover:border-cyan-400/50 fade-in"
                  style={{ animationDelay: `${0.3 + index * 0.1}s` }}
                >
                  <div className="flex justify-between items-start mb-2 sm:mb-3">
                    <div className="flex-1 min-w-0 pr-2 sm:pr-3">
                      <h3 className="text-white font-semibold text-sm sm:text-base lg:text-lg truncate">
                        {user.name}
                      </h3>
                      <p className="text-cyan-400 text-xs sm:text-sm break-all truncate">
                        {user.email}
                      </p>
                      {user.phone && (
                        <p className="text-gray-400 text-xs sm:text-sm mt-1 truncate">
                          {user.phone}
                        </p>
                      )}
                    </div>
                    <span className="text-gray-500 text-xs sm:text-sm flex-shrink-0">
                      #{startIndex + index + 1}
                    </span>
                  </div>

                  {/* Responsive button layout - Only View and Delete */}
                  <div className="grid grid-cols-2 gap-1 sm:gap-2">
                    <button
                      className="bg-gray-700/50 hover:bg-cyan-600 text-cyan-400 hover:text-white 
                                rounded-lg p-1.5 sm:p-2 transition-all duration-200 
                                flex flex-col items-center justify-center gap-1
                                border border-gray-600 hover:border-cyan-500
                                shadow-sm hover:shadow-cyan-500/25 transform hover:scale-105"
                      onClick={() => handleViewUser(user)}
                    >
                      <FaEye className="text-xs sm:text-sm lg:text-base" />
                      <span className="text-xs">View</span>
                    </button>

                    <button
                      onClick={() => handleDeleteClick(user)}
                      className="bg-gray-700/50 hover:bg-red-600 text-red-400 hover:text-white 
                                rounded-lg p-1.5 sm:p-2 transition-all duration-200 
                                flex flex-col items-center justify-center gap-1
                                border border-gray-600 hover:border-red-500
                                shadow-sm hover:shadow-red-500/25 transform hover:scale-105"
                    >
                      <MdDeleteForever className="text-xs sm:text-sm lg:text-base" />
                      <span className="text-xs">Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View - Only shows on xl and above */}
            <div className="hidden xl:block overflow-x-auto">
              <table className="w-full table-auto text-left">
                <thead className="text-gray-400 text-sm bg-gray-800/50">
                  <tr className="border-b border-gray-700">
                    <th className="py-3 lg:py-4 px-3 lg:px-4 xl:px-6 font-semibold uppercase tracking-wider text-xs lg:text-sm">
                      #
                    </th>
                    <th className="py-3 lg:py-4 px-3 lg:px-4 xl:px-6 font-semibold uppercase tracking-wider text-xs lg:text-sm">
                      Name
                    </th>
                    <th className="py-3 lg:py-4 px-3 lg:px-4 xl:px-6 font-semibold uppercase tracking-wider text-xs lg:text-sm">
                      Email
                    </th>
                    <th className="py-3 lg:py-4 px-3 lg:px-4 xl:px-6 font-semibold uppercase tracking-wider text-xs lg:text-sm">
                      Phone
                    </th>
                    <th className="py-3 lg:py-4 px-3 lg:px-4 xl:px-6 font-semibold uppercase tracking-wider text-xs lg:text-sm text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="text-sm xl:text-base divide-y divide-gray-700">
                  {currentItems.map((user, index) => (
                    <tr
                      key={user.id}
                      className="transition-all duration-300 ease-out hover:bg-gray-800/40 fade-in"
                      style={{ animationDelay: `${0.3 + index * 0.1}s` }}
                    >
                      <td className="py-3 lg:py-4 px-3 lg:px-4 xl:px-6 text-gray-300 font-medium text-xs lg:text-sm">
                        {startIndex + index + 1}
                      </td>
                      <td className="py-3 lg:py-4 px-3 lg:px-4 xl:px-6">
                        <div className="text-white font-medium text-sm lg:text-base">
                          {user.name}
                        </div>
                      </td>
                      <td className="py-3 lg:py-4 px-3 lg:px-4 xl:px-6 text-gray-300 text-sm lg:text-base">
                        {user.email}
                      </td>
                      <td className="py-3 lg:py-4 px-3 lg:px-4 xl:px-6 text-gray-300 text-sm lg:text-base">
                        {user.phone || "N/A"}
                      </td>
                      <td className="py-3 lg:py-4 px-3 lg:px-4 xl:px-6">
                        <div className="flex items-center justify-end gap-1 lg:gap-2">
                          <button
                            className="
                              bg-gray-700/50 hover:bg-cyan-600 text-cyan-400 hover:text-white 
                              rounded-lg lg:rounded-xl p-2 lg:p-2.5 xl:p-3 transition-all duration-200 
                              hover:shadow-cyan-500/25 transform hover:scale-105 border border-gray-600 hover:border-cyan-500
                              flex items-center gap-1 lg:gap-1.5 xl:gap-2 group text-xs lg:text-sm
                            "
                            onClick={() => handleViewUser(user)}
                            title="View User Details"
                          >
                            <FaEye className="text-xs lg:text-sm group-hover:scale-110 transition-transform" />
                            <span className="font-medium">View</span>
                          </button>

                          <button
                            onClick={() => handleDeleteClick(user)}
                            className="
                              bg-gray-700/50 hover:bg-red-600 text-red-400 hover:text-white 
                              rounded-lg lg:rounded-xl p-2 lg:p-2.5 xl:p-3 transition-all duration-200 
                              hover:shadow-red-500/25 transform hover:scale-105 border border-gray-600 hover:border-red-500
                              flex items-center gap-1 lg:gap-1.5 xl:gap-2 group text-xs lg:text-sm
                            "
                            title="Delete User"
                          >
                            <MdDeleteForever className="text-xs lg:text-sm group-hover:scale-110 transition-transform" />
                            <span className="font-medium">Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Section */}
            {totalPages > 1 && (
              <div className="border-t border-gray-700 bg-gray-800/50 px-4 py-3 sm:px-6 fade-in">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-xs sm:text-sm text-gray-400">
                    Showing {startIndex + 1} to{" "}
                    {Math.min(startIndex + itemsPerPage, filteredData.length)}{" "}
                    of {filteredData.length} results
                    {searchTerm && (
                      <span className="ml-2 text-cyan-400">
                        (filtered from {data.length} total users)
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 sm:gap-2 flex-wrap justify-center">
                    {renderPaginationButtons()}
                  </div>
                </div>
              </div>
            )}

            {/* Table Footer */}
            <div className="bg-gray-800/50 px-2 sm:px-3 lg:px-4 xl:px-6 py-2 sm:py-3 lg:py-4 border-t border-gray-700 fade-in">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 sm:gap-2 text-xs text-gray-400">
                <span>
                  Showing {currentItems.length} of {filteredData.length} user
                  {filteredData.length !== 1 ? "s" : ""}
                </span>
                <span className="flex items-center gap-1 sm:gap-2">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full animate-pulse"></div>
                  System Active
                </span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* User Form Modal */}
      <UserForm
        open={showForm?.show}
        handleClose={() => setShowForm({ show: false, id: "" })}
        fetchData={fetchData}
        id={showForm?.id}
      />

      {/* User View Modal */}
      {showViewModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 fade-in">
          <div className="bg-gray-800/90 backdrop-blur-sm border border-gray-700 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {modalLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-cyan-400 text-sm">
                    Loading user details...
                  </span>
                </div>
              </div>
            ) : selectedUser ? (
              <>
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-700">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                      {selectedUser.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">
                        {selectedUser.name}
                      </h2>
                      <p className="text-cyan-400 text-sm">
                        {selectedUser.role || "User"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={closeViewModal}
                    className="p-2 hover:bg-gray-700 rounded-lg transition-all duration-200 text-gray-400 hover:text-white"
                  >
                    <FaTimes className="text-xl" />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg border border-gray-600">
                      <div className="p-2 bg-cyan-500/20 rounded-lg">
                        <FaEnvelope className="text-cyan-400 text-lg" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Email</p>
                        <p className="text-white font-medium">
                          {selectedUser.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg border border-gray-600">
                      <div className="p-2 bg-green-500/20 rounded-lg">
                        <FaPhone className="text-green-400 text-lg" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Phone</p>
                        <p className="text-white font-medium">
                          {selectedUser.phone || "Not provided"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg border border-gray-600">
                      <div className="p-2 bg-purple-500/20 rounded-lg">
                        <FaCalendar className="text-purple-400 text-lg" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Joined</p>
                        <p className="text-white font-medium">
                          {selectedUser.createdAt
                            ? new Date(
                                selectedUser.createdAt
                              ).toLocaleDateString()
                            : "Unknown"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg border border-gray-600">
                      <div className="p-2 bg-blue-500/20 rounded-lg">
                        <FaUser className="text-blue-400 text-lg" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Status</p>
                        <p className="text-green-400 font-medium">Active</p>
                      </div>
                    </div>
                  </div>

                  {/* User Statistics with Holdings Data */}
                  <div>
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <FaChartLine className="text-cyan-400" />
                      User Statistics & Holdings
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {(() => {
                        const userStats = getUserStats(selectedUser);
                        const stats = [
                          {
                            icon: FaWallet,
                            label: "Wallet Balance",
                            value: formatCurrency(userStats.walletBalance),
                            color: "text-green-400",
                            bg: "bg-green-500/20",
                          },
                          {
                            icon: FaCoins,
                            label: "Coins Owned",
                            value: userStats.coinsOwned,
                            color: "text-cyan-400",
                            bg: "bg-cyan-500/20",
                          },
                          {
                            icon: FaChartLine,
                            label: "Portfolio Value",
                            value: formatCurrency(userStats.portfolioValue),
                            color: "text-purple-400",
                            bg: "bg-purple-500/20",
                          },
                          {
                            icon: FaStar,
                            label: "Watchlist",
                            value: userStats.watchlistItems,
                            color: "text-amber-400",
                            bg: "bg-amber-500/20",
                          },
                        ];
                        return stats.map((stat, index) => (
                          <div
                            key={index}
                            className="text-center p-4 bg-gray-700/30 rounded-lg border border-gray-600"
                          >
                            <div
                              className={`p-2 ${stat.bg} rounded-lg inline-flex mb-2`}
                            >
                              <stat.icon className={`text-lg ${stat.color}`} />
                            </div>
                            <p
                              className={`text-xl font-bold ${stat.color} mb-1`}
                            >
                              {stat.value}
                            </p>
                            <p className="text-xs text-gray-400">
                              {stat.label}
                            </p>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>

                  {/* Holdings Details */}
                  <div className="bg-gray-700/30 rounded-lg border border-gray-600 p-4">
                    <h4 className="text-white font-semibold mb-3">
                      Investment Details
                    </h4>
                    <div className="space-y-2 text-sm">
                      {(() => {
                        const userStats = getUserStats(selectedUser);
                        return (
                          <>
                            <div className="flex justify-between">
                              <span className="text-gray-400">
                                Total Coins Held:
                              </span>
                              <span className="text-white font-medium">
                                {userStats.totalCoinsHeld.toLocaleString(
                                  "en-IN",
                                  { maximumFractionDigits: 2 }
                                )}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">
                                Total Invested:
                              </span>
                              <span className="text-white font-medium">
                                {formatCurrency(userStats.totalInvested)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">
                                Current Value:
                              </span>
                              <span className="text-white font-medium">
                                {formatCurrency(userStats.portfolioValue)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">
                                Profit/Loss:
                              </span>
                              <span
                                className={`font-medium ${
                                  userStats.profitLoss >= 0
                                    ? "text-green-400"
                                    : "text-red-400"
                                }`}
                              >
                                <div className="flex items-center gap-1">
                                  {userStats.profitLoss >= 0 ? (
                                    <FaArrowUp className="text-xs" />
                                  ) : (
                                    <FaArrowDown className="text-xs" />
                                  )}
                                  {formatCurrency(
                                    Math.abs(userStats.profitLoss)
                                  )}
                                  <span>
                                    (
                                    {userStats.profitLossPercentage >= 0
                                      ? "+"
                                      : ""}
                                    {userStats.profitLossPercentage.toFixed(2)}
                                    %)
                                  </span>
                                </div>
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">
                                Total Trades:
                              </span>
                              <span className="text-white font-medium">
                                {userStats.totalTrades}
                              </span>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Additional Information */}
                  <div className="bg-gray-700/30 rounded-lg border border-gray-600 p-4">
                    <h4 className="text-white font-semibold mb-3">
                      Additional Information
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Account Type:</span>
                        <span className="text-cyan-400 font-medium">
                          {selectedUser.role || "Standard User"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Last Active:</span>
                        <span className="text-white font-medium">Recently</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex justify-end gap-3 p-6 border-t border-gray-700">
                  <button
                    onClick={closeViewModal}
                    className="px-6 py-2.5 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700/50 transition-all duration-200 font-medium"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      closeViewModal();
                      navigate("/user-profile/" + selectedUser.id);
                    }}
                    className="px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg hover:from-cyan-500 hover:to-blue-500 transition-all duration-200 font-medium shadow-lg hover:shadow-cyan-500/25"
                  >
                    Full Profile
                  </button>
                </div>
              </>
            ) : (
              <div className="flex justify-center items-center py-12">
                <div className="text-center">
                  <div className="text-red-400 text-lg mb-2">
                    Failed to load user details
                  </div>
                  <button
                    onClick={closeViewModal}
                    className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && userToDelete && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 fade-in">
          <div className="bg-gray-800/90 backdrop-blur-sm border border-gray-700 rounded-2xl max-w-md w-full">
            {/* Modal Header */}
            <div className="flex items-center gap-4 p-6 border-b border-gray-700">
              <div className="p-3 bg-red-500/20 rounded-full">
                <FaTrash className="text-red-400 text-xl" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Delete User</h2>
                <p className="text-gray-400 text-sm">
                  This action cannot be undone
                </p>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-red-600 to-red-700 flex items-center justify-center text-white font-bold">
                  {userToDelete.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <div>
                  <p className="text-white font-semibold">
                    {userToDelete.name}
                  </p>
                  <p className="text-gray-400 text-sm">{userToDelete.email}</p>
                </div>
              </div>

              <p className="text-gray-300 text-sm">
                Are you sure you want to delete{" "}
                <span className="text-white font-semibold">
                  {userToDelete.name}
                </span>
                ? This will permanently remove their account and all associated
                data from the system.
              </p>

              <div className="mt-4 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                <p className="text-yellow-400 text-sm font-medium">
                  ⚠️ Warning: This action is irreversible. All user data will be
                  lost.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 p-6 border-t border-gray-700">
              <button
                onClick={handleDeleteCancel}
                className="px-6 py-2.5 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700/50 transition-all duration-200 font-medium"
                disabled={Loading}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-500 hover:to-red-600 transition-all duration-200 font-medium shadow-lg hover:shadow-red-500/25 flex items-center gap-2"
                disabled={Loading}
              >
                {Loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <FaTrash className="text-sm" />
                    Delete User
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Users;
