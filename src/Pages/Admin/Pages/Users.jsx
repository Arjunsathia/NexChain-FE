import { deleteById, getData } from "@/api/axiosConfig";
import React, { useCallback, useEffect, useState } from "react";
import { FaEye, FaPlus } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import { CiEdit } from "react-icons/ci";
import UserForm from "../Components/Users/UserForm";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function Users() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [showForm, setShowForm] = useState({
    show: false,
    id: "",
  });
  const [Loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getData("/users");
      setData(res);
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

  return (
    <>
      <main className="flex-1 px-4 md:px-6 py-4 md:py-6 space-y-4 md:space-y-6 fade-in">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 fade-in">
          <div className="flex-1 w-full sm:w-auto">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-cyan-400">Users Management</h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-1 sm:mt-2">Manage platform users and permissions</p>
          </div>
          <button
            className="w-full sm:w-auto bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 
              text-white font-medium py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl transition-all duration-300 
              shadow-lg hover:shadow-cyan-500/25 transform hover:scale-105 flex items-center justify-center gap-2
              text-sm sm:text-base border border-cyan-500/30 hover:border-cyan-400/50 fade-in"
            onClick={() => setShowForm({ show: true, id: "" })}
            style={{ animationDelay: "0.2s" }}
          >
            <FaPlus className="text-sm" />
            <span>Create User</span>
          </button>
        </div>

        {/* Content Section */}
        {Loading ? (
          <div className="bg-transparent border border-gray-700 shadow-lg rounded-xl p-6 md:p-8 text-center fade-in">
            <div className="flex justify-center items-center gap-3 text-cyan-400">
              <div className="w-5 h-5 md:w-6 md:h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm md:text-base">Loading users...</span>
            </div>
          </div>
        ) : data.length === 0 ? (
          <div className="bg-transparent border border-gray-700 shadow-lg rounded-xl p-6 md:p-8 text-center fade-in">
            <div className="text-gray-400 text-base md:text-lg">No users found</div>
            <button
              className="mt-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 
                         text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 w-full sm:w-auto 
                         text-sm md:text-base shadow-lg hover:shadow-cyan-500/25 transform hover:scale-105
                         border border-cyan-500/30 hover:border-cyan-400/50 fade-in"
              onClick={() => setShowForm({ show: true, id: "" })}
              style={{ animationDelay: "0.3s" }}
            >
              Create First User
            </button>
          </div>
        ) : (
          <div className="bg-transparent border border-gray-700 shadow-lg rounded-xl overflow-hidden fade-in">
            {/* Mobile/Tablet Card View - Shows up to xl breakpoint */}
            <div className="xl:hidden space-y-3 p-3 md:p-4">
              {data.map((user, index) => (
                <div
                  key={user.id}
                  className="bg-gray-800/30 rounded-xl p-3 md:p-4 border border-gray-700
                    transition-all duration-300 ease-out hover:bg-gray-800/50 hover:border-gray-600 fade-in"
                  style={{ animationDelay: `${0.3 + index * 0.1}s` }}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 min-w-0 pr-3">
                      <h3 className="text-white font-semibold text-sm sm:text-base md:text-lg truncate">
                        {user.name}
                      </h3>
                      <p className="text-cyan-400 text-xs sm:text-sm break-all">
                        {user.email}
                      </p>
                      {user.phone && (
                        <p className="text-gray-400 text-xs sm:text-sm mt-1">
                          {user.phone}
                        </p>
                      )}
                    </div>
                    <span className="text-gray-500 text-xs sm:text-sm flex-shrink-0">
                      #{index + 1}
                    </span>
                  </div>
                  
                  {/* Responsive button layout */}
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      className="bg-gray-700/50 hover:bg-cyan-600 text-cyan-400 hover:text-white 
                                rounded-lg p-2 md:p-2.5 transition-all duration-200 
                                flex flex-col items-center justify-center gap-1
                                border border-gray-600 hover:border-cyan-500
                                shadow-sm hover:shadow-cyan-500/25 transform hover:scale-105"
                      onClick={() => navigate("/user-profile/" + user?.id)}
                    >
                      <FaEye className="text-sm md:text-base" />
                      <span className="text-xs">View</span>
                    </button>
                    
                    <button
                      className="bg-gray-700/50 hover:bg-blue-600 text-blue-400 hover:text-white 
                                rounded-lg p-2 md:p-2.5 transition-all duration-200 
                                flex flex-col items-center justify-center gap-1
                                border border-gray-600 hover:border-blue-500
                                shadow-sm hover:shadow-blue-500/25 transform hover:scale-105"
                      onClick={() => setShowForm({ show: true, id: user?.id })}
                    >
                      <CiEdit className="text-sm md:text-base" />
                      <span className="text-xs">Edit</span>
                    </button>
                    
                    <button
                      onClick={() => handleDelete(user?.id)}
                      className="bg-gray-700/50 hover:bg-red-600 text-red-400 hover:text-white 
                                rounded-lg p-2 md:p-2.5 transition-all duration-200 
                                flex flex-col items-center justify-center gap-1
                                border border-gray-600 hover:border-red-500
                                shadow-sm hover:shadow-red-500/25 transform hover:scale-105"
                    >
                      <MdDeleteForever className="text-sm md:text-base" />
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
                    <th className="py-4 px-4 xl:px-6 font-semibold uppercase tracking-wider">#</th>
                    <th className="py-4 px-4 xl:px-6 font-semibold uppercase tracking-wider">Name</th>
                    <th className="py-4 px-4 xl:px-6 font-semibold uppercase tracking-wider">Email</th>
                    <th className="py-4 px-4 xl:px-6 font-semibold uppercase tracking-wider">Phone</th>
                    <th className="py-4 px-4 xl:px-6 font-semibold uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm xl:text-base divide-y divide-gray-700">
                  {data.map((user, index) => (
                    <tr
                      key={user.id}
                      className="transition-all duration-300 ease-out hover:bg-gray-800/40 fade-in"
                      style={{ animationDelay: `${0.3 + index * 0.1}s` }}
                    >
                      <td className="py-4 px-4 xl:px-6 text-gray-300 font-medium">
                        {index + 1}
                      </td>
                      <td className="py-4 px-4 xl:px-6">
                        <div className="text-white font-medium">{user.name}</div>
                      </td>
                      <td className="py-4 px-4 xl:px-6 text-gray-300">{user.email}</td>
                      <td className="py-4 px-4 xl:px-6 text-gray-300">{user.phone || "N/A"}</td>
                      <td className="py-4 px-4 xl:px-6">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            className="
                              bg-gray-700/50 hover:bg-cyan-600 text-cyan-400 hover:text-white 
                              rounded-xl p-2.5 xl:p-3 transition-all duration-200 
                              hover:shadow-cyan-500/25 transform hover:scale-105 border border-gray-600 hover:border-cyan-500
                              flex items-center gap-1.5 xl:gap-2 group
                            "
                            onClick={() => navigate("/user-profile/" + user?.id)}
                            title="View Profile"
                          >
                            <FaEye className="text-sm group-hover:scale-110 transition-transform" />
                            <span className="text-xs xl:text-sm font-medium">View</span>
                          </button>

                          <button
                            className="
                              bg-gray-700/50 hover:bg-blue-600 text-blue-400 hover:text-white 
                              rounded-xl p-2.5 xl:p-3 transition-all duration-200 
                              hover:shadow-blue-500/25 transform hover:scale-105 border border-gray-600 hover:border-blue-500
                              flex items-center gap-1.5 xl:gap-2 group
                            "
                            onClick={() => setShowForm({ show: true, id: user?.id })}
                            title="Edit User"
                          >
                            <CiEdit className="text-sm group-hover:scale-110 transition-transform" />
                            <span className="text-xs xl:text-sm font-medium">Edit</span>
                          </button>

                          <button
                            onClick={() => handleDelete(user?.id)}
                            className="
                              bg-gray-700/50 hover:bg-red-600 text-red-400 hover:text-white 
                              rounded-xl p-2.5 xl:p-3 transition-all duration-200 
                              hover:shadow-red-500/25 transform hover:scale-105 border border-gray-600 hover:border-red-500
                              flex items-center gap-1.5 xl:gap-2 group
                            "
                            title="Delete User"
                          >
                            <MdDeleteForever className="text-sm group-hover:scale-110 transition-transform" />
                            <span className="text-xs xl:text-sm font-medium">Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="bg-gray-800/50 px-3 md:px-4 xl:px-6 py-3 md:py-4 border-t border-gray-700 fade-in">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs sm:text-sm text-gray-400">
                <span>Showing {data.length} user{data.length !== 1 ? 's' : ''}</span>
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
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