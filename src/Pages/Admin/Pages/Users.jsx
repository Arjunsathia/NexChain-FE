import { deleteById, getData } from "@/api/axiosConfig";
import React, { useCallback, useEffect, useState } from "react";
import { FaEye, FaPlus, FaSearch } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import { CiEdit } from "react-icons/ci";
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
  const [Loading, setLoading] = useState(false);
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

  // Search functionality
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredData(data);
      setCurrentPage(1);
    } else {
      const filtered = data.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredData(filtered);
      setCurrentPage(1);
    }
  }, [searchTerm, data]);

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this user?"
    );
    if (confirmed) {
      setLoading(true);
      try {
        await deleteById("/users", id);
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
      } catch (err) {
        console.error("Deletion failed:", err);
        toast.error("Failed to delete user. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredData.slice(startIndex, startIndex + itemsPerPage);

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
            ${currentPage === page
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
          <div className="flex-1 w-full sm:w-auto min-w-0">
            <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-cyan-400 truncate">Users Management</h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-1 truncate">Manage platform users and permissions</p>
          </div>
          
          {/* Search Bar - Positioned between title and create button */}
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
          <div className="bg-transparent border border-gray-700 rounded-xl p-4 sm:p-6 lg:p-8 text-center fade-in">
            <div className="flex justify-center items-center gap-2 sm:gap-3 text-cyan-400">
              <div className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs sm:text-sm lg:text-base">Loading users...</span>
            </div>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="bg-transparent border border-gray-700 rounded-xl p-4 sm:p-6 lg:p-8 text-center fade-in">
            <div className="text-gray-400 text-sm sm:text-base lg:text-lg">
              {searchTerm ? "No users found matching your search" : "No users found"}
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
          <div className="bg-transparent border border-gray-700 rounded-xl overflow-hidden fade-in">
            {/* Mobile/Tablet Card View - Shows up to xl breakpoint */}
            <div className="xl:hidden space-y-2 sm:space-y-3 p-2 sm:p-3 lg:p-4">
              {currentItems.map((user, index) => (
                <div
                  key={user.id}
                  className="bg-gray-800/30 rounded-lg sm:rounded-xl p-2 sm:p-3 lg:p-4 border border-gray-700
                    transition-all duration-300 ease-out hover:bg-gray-800/50 hover:border-gray-600 fade-in"
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
                  
                  {/* Responsive button layout */}
                  <div className="grid grid-cols-3 gap-1 sm:gap-2">
                    <button
                      className="bg-gray-700/50 hover:bg-cyan-600 text-cyan-400 hover:text-white 
                                rounded-lg p-1.5 sm:p-2 transition-all duration-200 
                                flex flex-col items-center justify-center gap-1
                                border border-gray-600 hover:border-cyan-500
                                shadow-sm hover:shadow-cyan-500/25 transform hover:scale-105"
                      onClick={() => navigate("/user-profile/" + user?.id)}
                    >
                      <FaEye className="text-xs sm:text-sm lg:text-base" />
                      <span className="text-xs">View</span>
                    </button>
                    
                    <button
                      className="bg-gray-700/50 hover:bg-blue-600 text-blue-400 hover:text-white 
                                rounded-lg p-1.5 sm:p-2 transition-all duration-200 
                                flex flex-col items-center justify-center gap-1
                                border border-gray-600 hover:border-blue-500
                                shadow-sm hover:shadow-blue-500/25 transform hover:scale-105"
                      onClick={() => setShowForm({ show: true, id: user?.id })}
                    >
                      <CiEdit className="text-xs sm:text-sm lg:text-base" />
                      <span className="text-xs">Edit</span>
                    </button>
                    
                    <button
                      onClick={() => handleDelete(user?.id)}
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
                    <th className="py-3 lg:py-4 px-3 lg:px-4 xl:px-6 font-semibold uppercase tracking-wider text-xs lg:text-sm">#</th>
                    <th className="py-3 lg:py-4 px-3 lg:px-4 xl:px-6 font-semibold uppercase tracking-wider text-xs lg:text-sm">Name</th>
                    <th className="py-3 lg:py-4 px-3 lg:px-4 xl:px-6 font-semibold uppercase tracking-wider text-xs lg:text-sm">Email</th>
                    <th className="py-3 lg:py-4 px-3 lg:px-4 xl:px-6 font-semibold uppercase tracking-wider text-xs lg:text-sm">Phone</th>
                    <th className="py-3 lg:py-4 px-3 lg:px-4 xl:px-6 font-semibold uppercase tracking-wider text-xs lg:text-sm text-right">Actions</th>
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
                        <div className="text-white font-medium text-sm lg:text-base">{user.name}</div>
                      </td>
                      <td className="py-3 lg:py-4 px-3 lg:px-4 xl:px-6 text-gray-300 text-sm lg:text-base">{user.email}</td>
                      <td className="py-3 lg:py-4 px-3 lg:px-4 xl:px-6 text-gray-300 text-sm lg:text-base">{user.phone || "N/A"}</td>
                      <td className="py-3 lg:py-4 px-3 lg:px-4 xl:px-6">
                        <div className="flex items-center justify-end gap-1 lg:gap-2">
                          <button
                            className="
                              bg-gray-700/50 hover:bg-cyan-600 text-cyan-400 hover:text-white 
                              rounded-lg lg:rounded-xl p-2 lg:p-2.5 xl:p-3 transition-all duration-200 
                              hover:shadow-cyan-500/25 transform hover:scale-105 border border-gray-600 hover:border-cyan-500
                              flex items-center gap-1 lg:gap-1.5 xl:gap-2 group text-xs lg:text-sm
                            "
                            onClick={() => navigate("/user-profile/" + user?.id)}
                            title="View Profile"
                          >
                            <FaEye className="text-xs lg:text-sm group-hover:scale-110 transition-transform" />
                            <span className="font-medium">View</span>
                          </button>

                          <button
                            className="
                              bg-gray-700/50 hover:bg-blue-600 text-blue-400 hover:text-white 
                              rounded-lg lg:rounded-xl p-2 lg:p-2.5 xl:p-3 transition-all duration-200 
                              hover:shadow-blue-500/25 transform hover:scale-105 border border-gray-600 hover:border-blue-500
                              flex items-center gap-1 lg:gap-1.5 xl:gap-2 group text-xs lg:text-sm
                            "
                            onClick={() => setShowForm({ show: true, id: user?.id })}
                            title="Edit User"
                          >
                            <CiEdit className="text-xs lg:text-sm group-hover:scale-110 transition-transform" />
                            <span className="font-medium">Edit</span>
                          </button>

                          <button
                            onClick={() => handleDelete(user?.id)}
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
                    Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredData.length)} of {filteredData.length} results
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
                <span>Showing {currentItems.length} of {filteredData.length} user{filteredData.length !== 1 ? 's' : ''}</span>
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
    </>
  );
}

export default Users;