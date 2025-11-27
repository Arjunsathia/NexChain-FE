import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  FaBug,
  FaLightbulb,
  FaStar,
  FaComments,
  FaSearch,
  FaTrash,
  FaEye,
  FaChartBar,
  FaFilter,
  FaSync,
  FaExclamationTriangle,
  FaCalendarDay,
  FaTimes,
  FaUser,
  FaClock,
  FaCheckCircle,
  FaCheck,
} from "react-icons/fa";
import axios from "axios";

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

const AdminFeedback = () => {
  const isLight = useThemeCheck();
  
  // Premium Theme Classes - Matches User Dashboard
  const TC = useMemo(() => ({
    textPrimary: isLight ? "text-gray-900" : "text-white",
    textSecondary: isLight ? "text-gray-500" : "text-gray-400",
    textTertiary: isLight ? "text-gray-400" : "text-gray-500",
    
    bgCard: isLight 
      ? "bg-white shadow-[0_6px_25px_rgba(0,0,0,0.12)]" 
      : "bg-gray-800/50 backdrop-blur-xl shadow-xl shadow-black/20",
    bgStatsCard: isLight
      ? "bg-white shadow-[0_6px_25px_rgba(0,0,0,0.12)]"
      : "bg-gray-800/50 backdrop-blur-xl shadow-2xl hover:shadow-cyan-400/25",
    bgItem: isLight ? "bg-gray-50" : "bg-white/5",
    bgInput: isLight ? "bg-white text-gray-900 placeholder-gray-500 shadow-sm" : "bg-gray-900/50 text-white placeholder-gray-500 shadow-inner",
    
    btnPrimary: "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg hover:shadow-cyan-500/25 transition-all duration-300",
    btnSecondary: isLight ? "text-gray-600 hover:bg-gray-100" : "text-gray-300 hover:bg-gray-800/50 hover:text-white",
    btnDanger: "bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all duration-200",
    
    tableHead: isLight ? "bg-gray-100 text-gray-600" : "bg-gray-900/50 text-gray-400",
    tableRow: isLight ? "hover:bg-gray-50" : "hover:bg-white/5",
    
    modalOverlay: "bg-black/80 backdrop-blur-sm",
    modalContent: isLight ? "bg-white shadow-2xl" : "bg-[#0a0b14] shadow-2xl shadow-black/50",
    
    headerGradient: "from-cyan-400 to-blue-500",
  }), [isLight]);

  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [contentLoaded, setContentLoaded] = useState(false);
  const [stats, setStats] = useState({});
  const [filters, setFilters] = useState({
    status: "",
    type: "",
    priority: "",
    search: "",
  });
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [feedbackToDelete, setFeedbackToDelete] = useState(null);
  const [editNotes, setEditNotes] = useState("");
  const [error, setError] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [resolveLoading, setResolveLoading] = useState(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    fetchFeedbacks();
    fetchStats();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      setContentLoaded(false);
      setError("");
      const response = await axios.get("http://localhost:5050/api/feedback");
      if (response.data && response.data.success) {
        setFeedbacks(response.data.data || []);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("❌ Error fetching feedbacks:", error);
      setError("Failed to load feedback data. Please check if backend is running.");
      setFeedbacks([]);
    } finally {
      setLoading(false);
      setTimeout(() => setContentLoaded(true), 300);
    }
  };

  const fetchStats = useCallback(async () => {
    try {
      const response = await axios.get("http://localhost:5050/api/feedback/stats");
      if (response.data && response.data.success) {
        setStats(response.data.data || {});
      }
    } catch (error) {
      console.error("❌ Error fetching stats:", error);
      const localStats = {
        total: feedbacks.length,
        today: feedbacks.filter((fb) => {
          const feedbackDate = new Date(fb.createdAt);
          const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
          return feedbackDate >= twentyFourHoursAgo;
        }).length,
        new: feedbacks.filter((f) => f.status === "new").length,
        inProgress: feedbacks.filter((f) => f.status === "in-progress").length,
        resolved: feedbacks.filter((f) => f.status === "resolved").length,
      };
      setStats(localStats);
    }
  }, [feedbacks]);

  const updateFeedbackStatus = async (id, status) => {
    try {
      const response = await axios.put(`http://localhost:5050/api/feedback/${id}`, { status });
      if (response.data.success) {
        setFeedbacks((prev) => prev.map((fb) => (fb._id === id ? { ...fb, status } : fb)));
        fetchStats();
      }
    } catch (error) {
      console.error("❌ Error updating feedback status:", error);
      alert("Error updating feedback status. Please try again.");
    }
  };

  const markAsResolved = async (id) => {
    try {
      setResolveLoading(id);
      const response = await axios.put(`http://localhost:5050/api/feedback/${id}`, { status: "resolved" });
      if (response.data.success) {
        setFeedbacks((prev) => prev.map((fb) => (fb._id === id ? { ...fb, status: "resolved" } : fb)));
        fetchStats();
      }
    } catch (error) {
      console.error("❌ Error marking as resolved:", error);
      alert("Error marking feedback as resolved. Please try again.");
    } finally {
      setResolveLoading(null);
    }
  };

  const updateFeedbackNotes = async (id, adminNotes) => {
    try {
      const response = await axios.put(`http://localhost:5050/api/feedback/${id}`, { adminNotes });
      if (response.data.success) {
        setFeedbacks((prev) => prev.map((fb) => (fb._id === id ? { ...fb, adminNotes } : fb)));
        setShowModal(false);
        alert("✅ Notes updated successfully!");
      }
    } catch (error) {
      console.error("❌ Error updating notes:", error);
      alert("❌ Error updating notes. Please try again.");
    }
  };

  const confirmDelete = (feedback) => {
    setFeedbackToDelete(feedback);
    setShowDeleteModal(true);
  };

  const deleteFeedback = async () => {
    if (!feedbackToDelete) return;
    try {
      setDeleteLoading(true);
      const response = await axios.delete(`http://localhost:5050/api/feedback/${feedbackToDelete._id}`);
      if (response.data.success) {
        setFeedbacks((prev) => prev.filter((fb) => fb._id !== feedbackToDelete._id));
        fetchStats();
        setShowDeleteModal(false);
        setFeedbackToDelete(null);
        alert("✅ Feedback deleted successfully!");
      }
    } catch (error) {
      console.error("❌ Error deleting feedback:", error);
      alert("❌ Error deleting feedback. Please try again.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const getTypeIcon = (type) => {
    const iconConfig = {
      bug: { icon: FaBug, color: "text-red-400", bgColor: "bg-red-500/10", borderColor: "border-red-500/20" },
      suggestion: { icon: FaLightbulb, color: "text-yellow-400", bgColor: "bg-yellow-500/10", borderColor: "border-yellow-500/20" },
      praise: { icon: FaStar, color: "text-green-400", bgColor: "bg-green-500/10", borderColor: "border-green-500/20" },
      general: { icon: FaComments, color: "text-blue-400", bgColor: "bg-blue-500/10", borderColor: "border-blue-500/20" },
    };
    const config = iconConfig[type] || iconConfig.general;
    const IconComponent = config.icon;
    return (
      <div className={`p-2 rounded-lg ${config.bgColor} border ${config.borderColor}`}>
        <IconComponent className={`text-sm ${config.color}`} />
      </div>
    );
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      new: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20", dot: "bg-blue-400" },
      "in-progress": { bg: "bg-yellow-500/10", text: "text-yellow-400", border: "border-yellow-500/20", dot: "bg-yellow-400" },
      resolved: { bg: "bg-green-500/10", text: "text-green-400", border: "border-green-500/20", dot: "bg-green-400" },
      closed: { bg: "bg-gray-500/10", text: "text-gray-400", border: "border-gray-500/20", dot: "bg-gray-400" },
    };
    const config = statusConfig[status] || statusConfig.new;
    return (
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${config.bg} border ${config.border}`}>
        <div className={`w-2 h-2 rounded-full ${config.dot} animate-pulse`}></div>
        <span className={`text-xs font-semibold capitalize ${config.text}`}>{status.replace("-", " ")}</span>
      </div>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      low: { bg: "bg-green-500/10", text: "text-green-400", border: "border-green-500/20", dot: "bg-green-400" },
      medium: { bg: "bg-yellow-500/10", text: "text-yellow-400", border: "border-yellow-500/20", dot: "bg-yellow-400" },
      high: { bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/20", dot: "bg-orange-400" },
      critical: { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/20", dot: "bg-red-400" },
    };
    const config = priorityConfig[priority] || priorityConfig.medium;
    return (
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${config.bg} border ${config.border}`}>
        <div className={`w-2 h-2 rounded-full ${config.dot}`}></div>
        <span className={`text-xs font-semibold capitalize ${config.text}`}>{priority}</span>
      </div>
    );
  };

  const filteredFeedbacks = feedbacks.filter((feedback) => {
    const matchesSearch = !filters.search || feedback.message.toLowerCase().includes(filters.search.toLowerCase()) || (feedback.userEmail && feedback.userEmail.toLowerCase().includes(filters.search.toLowerCase()));
    const matchesStatus = !filters.status || feedback.status === filters.status;
    const matchesType = !filters.type || feedback.type === filters.type;
    const matchesPriority = !filters.priority || feedback.priority === filters.priority;
    return matchesSearch && matchesStatus && matchesType && matchesPriority;
  });

  // Loading Skeleton Component
  const FeedbackSkeleton = () => (
    <div className="space-y-6">
      {/* Stats Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className={`${TC.bgCard} h-32 rounded-2xl animate-pulse`} />
        ))}
      </div>
      
      {/* Filters Skeleton */}
      <div className={`${TC.bgCard} h-20 rounded-2xl animate-pulse`} />

      {/* Table Skeleton */}
      <div className={`${TC.bgCard} rounded-2xl overflow-hidden p-4`}>
        <div className="space-y-4">
            <div className={`h-10 w-full ${TC.tableHead} rounded animate-pulse`} />
            {[...Array(5)].map((_, i) => (
                <div key={i} className={`h-16 w-full ${TC.bgItem} rounded-xl animate-pulse`} />
            ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className={`flex-1 p-4 lg:p-8 space-y-4 lg:space-y-6 min-h-screen ${TC.textPrimary}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className={`text-2xl sm:text-3xl font-bold bg-gradient-to-r ${TC.headerGradient} bg-clip-text text-transparent`}>
            Feedback & Reports
          </h1>
          <p className={`${TC.textSecondary} mt-1 text-xs sm:text-sm`}>
            Manage user feedback and reports
          </p>
        </div>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          {loading && (
            <div className="flex items-center text-sm text-gray-300">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Loading...
            </div>
          )}
          <button
            onClick={() => { fetchFeedbacks(); fetchStats(); }}
            disabled={loading}
            className={`px-3 sm:px-4 py-2 rounded-xl font-medium text-xs sm:text-sm flex items-center gap-2 ${TC.btnPrimary} flex-1 sm:flex-initial justify-center disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <FaSync className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <FeedbackSkeleton />
      ) : (
        <div 
          className={`transition-all duration-500 ease-in-out space-y-4 lg:space-y-6 ${
            contentLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: "Total", value: stats.total || 0, icon: FaChartBar, color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20" },
          { label: "Today", value: stats.today || 0, icon: FaCalendarDay, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
          { label: "In Progress", value: stats.inProgress || 0, icon: FaLightbulb, color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
          { label: "Resolved", value: stats.resolved || 0, icon: FaCheckCircle, color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20" },
        ].map((stat, i) => (
          <div key={i} className={`${TC.bgStatsCard} p-4 sm:p-6 rounded-2xl relative overflow-hidden group transform hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300 will-change-transform`}>
            <div className="flex justify-between items-start">
              <div>
                <p className={`text-xs sm:text-sm ${TC.textSecondary}`}>{stat.label}</p>
                <h3 className={`text-xl sm:text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</h3>
              </div>
              <div className={`p-2 sm:p-3 rounded-xl ${stat.bg} ${stat.border}`}>
                <stat.icon className={`text-base sm:text-lg ${stat.color}`} />
              </div>
            </div>
            {/* Glow Effect */}
            <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full ${stat.bg} blur-2xl opacity-0 group-hover:opacity-50 transition-opacity duration-500`} />
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className={`${TC.bgCard} rounded-2xl p-3 sm:p-4 lg:p-6`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
          <div className="md:col-span-2 relative w-full">
            <FaSearch className={`absolute left-4 top-1/2 -translate-y-1/2 text-lg transition-colors ${isLight ? "text-gray-400 group-focus-within:text-cyan-500" : "text-gray-500 group-focus-within:text-cyan-400"}`} />
            <input
              type="text"
              placeholder="Search feedback..."
              className={`w-full rounded-xl py-3 pl-12 pr-4 text-sm font-medium outline-none transition-all focus:ring-4 focus:ring-cyan-500/20 shadow-sm ${isLight ? "bg-white text-gray-900 placeholder-gray-400" : "bg-gray-900/50 text-white placeholder-gray-500"}`}
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
          <select
            className={`w-full rounded-xl py-3 px-4 text-sm font-medium outline-none transition-all focus:ring-4 focus:ring-cyan-500/20 shadow-sm ${isLight ? "bg-white text-gray-900" : "bg-gray-900/50 text-white"}`}
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">All Status</option>
            <option value="new">New</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
          <select
            className={`w-full rounded-xl py-3 px-4 text-sm font-medium outline-none transition-all focus:ring-4 focus:ring-cyan-500/20 shadow-sm ${isLight ? "bg-white text-gray-900" : "bg-gray-900/50 text-white"}`}
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
          >
            <option value="">All Types</option>
            <option value="bug">Bug</option>
            <option value="suggestion">Suggestion</option>
            <option value="praise">Praise</option>
            <option value="general">General</option>
          </select>
          <select
            className={`w-full rounded-xl py-3 px-4 text-sm font-medium outline-none transition-all focus:ring-4 focus:ring-cyan-500/20 shadow-sm ${isLight ? "bg-white text-gray-900" : "bg-gray-900/50 text-white"}`}
            value={filters.priority}
            onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
          >
            <option value="">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </div>

      {/* Feedback List */}
      <div className={`${TC.bgCard} rounded-2xl overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className={TC.tableHead}>
              <tr>
                <th className="py-3 px-3 sm:py-4 sm:px-6 uppercase tracking-wider text-[10px] sm:text-xs font-semibold">Feedback</th>
                <th className="py-3 px-3 sm:py-4 sm:px-6 uppercase tracking-wider text-[10px] sm:text-xs font-semibold hidden md:table-cell">Type & Priority</th>
                <th className="py-3 px-3 sm:py-4 sm:px-6 uppercase tracking-wider text-[10px] sm:text-xs font-semibold">Status</th>
                <th className="py-3 px-3 sm:py-4 sm:px-6 uppercase tracking-wider text-[10px] sm:text-xs font-semibold hidden sm:table-cell">Date</th>
                <th className="py-3 px-3 sm:py-4 sm:px-6 uppercase tracking-wider text-[10px] sm:text-xs font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {filteredFeedbacks.map((feedback) => (
                <tr key={feedback._id} className={`${TC.tableRow}`}>
                  <td className="py-3 px-3 sm:py-4 sm:px-6">
                    <div className="max-w-xs sm:max-w-md">
                      <p className={`text-xs sm:text-sm font-medium ${TC.textPrimary} line-clamp-2`}>{feedback.message}</p>
                      {feedback.userEmail && <p className={`text-[10px] sm:text-xs ${TC.textSecondary} mt-1 truncate`}>{feedback.userEmail}</p>}
                    </div>
                  </td>
                  <td className="py-3 px-3 sm:py-4 sm:px-6 hidden md:table-cell">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(feedback.type)}
                        <span className={`text-xs font-semibold capitalize ${TC.textSecondary}`}>{feedback.type}</span>
                      </div>
                      {getPriorityBadge(feedback.priority)}
                    </div>
                  </td>
                  <td className="py-3 px-3 sm:py-4 sm:px-6">
                    <select
                      value={feedback.status}
                      onChange={(e) => updateFeedbackStatus(feedback._id, e.target.value)}
                      className={`text-[10px] sm:text-xs font-medium rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 border-0 focus:ring-1 focus:ring-cyan-500 cursor-pointer transition-all ${isLight ? "bg-gray-100 text-gray-700" : "bg-gray-900/50 text-gray-300"}`}
                    >
                      <option value="new">New</option>
                      <option value="in-progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </td>
                  <td className={`py-3 px-3 sm:py-4 sm:px-6 text-xs sm:text-sm ${TC.textSecondary} hidden sm:table-cell`}>
                    {new Date(feedback.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-3 sm:py-4 sm:px-6">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => { setSelectedFeedback(feedback); setEditNotes(feedback.adminNotes || ""); setShowModal(true); }}
                        className={`p-1.5 sm:p-2 rounded-lg ${TC.btnSecondary}`}
                        title="View Details"
                      >
                        <FaEye className="text-sm" />
                      </button>
                      <button
                        onClick={() => handleDeleteFeedback(feedback._id)}
                        className={`p-1.5 sm:p-2 rounded-lg transition-all duration-200 ${isLight ? "text-red-600 hover:bg-red-50" : "text-red-400 hover:bg-red-500/10"}`}
                        title="Delete"
                      >
                        <FaTrash className="text-sm" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )}

      {/* View Modal */}
      {showModal && selectedFeedback && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${TC.modalOverlay}`}>
          <div className={`w-full max-w-2xl rounded-2xl overflow-hidden ${TC.modalContent} animate-in fade-in zoom-in duration-300`}>
            <div className={`p-6 flex justify-between items-center`}>
              <h2 className={`text-xl font-bold ${TC.textPrimary}`}>Feedback Details</h2>
              <button onClick={() => setShowModal(false)} className={`transition-all duration-200 p-1 rounded-lg hover:rotate-90 transform group ${isLight ? "text-gray-500 hover:text-red-600 hover:bg-red-100" : "text-gray-400 hover:text-white hover:bg-red-500/20"}`}>
                <FaTimes className="text-lg group-hover:scale-110 transition-transform" />
              </button>
            </div>
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-2 gap-4">
                <div className={`p-4 rounded-xl ${TC.bgItem}`}>
                  <p className={`text-xs uppercase mb-1 ${TC.textSecondary}`}>User</p>
                  <p className={`font-medium flex items-center gap-2 ${TC.textPrimary}`}><FaUser className="text-cyan-500" /> {selectedFeedback.userEmail || "Anonymous"}</p>
                </div>
                <div className={`p-4 rounded-xl ${TC.bgItem}`}>
                  <p className={`text-xs uppercase mb-1 ${TC.textSecondary}`}>Date</p>
                  <p className={`font-medium flex items-center gap-2 ${TC.textPrimary}`}><FaClock className="text-purple-500" /> {new Date(selectedFeedback.createdAt).toLocaleString()}</p>
                </div>
              </div>
              <div className={`p-4 rounded-xl ${TC.bgItem}`}>
                <p className={`text-xs uppercase mb-2 ${TC.textSecondary}`}>Message</p>
                <p className={`leading-relaxed ${TC.textPrimary}`}>{selectedFeedback.message}</p>
              </div>
              <div>
                <label className={`text-xs uppercase mb-2 block ${TC.textSecondary}`}>Admin Notes</label>
                <textarea
                  className={`w-full rounded-xl p-4 min-h-[100px] outline-none focus:ring-1 focus:ring-cyan-500/50 ${TC.bgInput}`}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Add internal notes..."
                />
              </div>
            </div>
            <div className={`p-6 flex justify-end gap-3`}>
              <button onClick={() => setShowModal(false)} className={`px-4 py-2 rounded-xl ${TC.btnSecondary}`}>Close</button>
              <button onClick={() => updateFeedbackNotes(selectedFeedback._id, editNotes)} className={`px-4 py-2 rounded-xl ${TC.btnPrimary}`}>Save Notes</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${TC.modalOverlay}`}>
          <div className={`w-full max-w-md rounded-2xl ${TC.modalContent} animate-in fade-in zoom-in duration-200`}>
            <div className={`p-6 flex justify-between items-center`}>
              <h3 className={`text-xl font-bold ${TC.textPrimary}`}>Delete Feedback?</h3>
              <button onClick={() => setShowDeleteModal(false)} className={`transition-all duration-200 p-1 rounded-lg hover:rotate-90 transform group ${isLight ? "text-gray-500 hover:text-red-600 hover:bg-red-100" : "text-gray-400 hover:text-white hover:bg-red-500/20"}`}>
                <FaTimes className="text-lg group-hover:scale-110 transition-transform" />
              </button>
            </div>
            <div className="p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                <FaTrash className="text-red-500 text-2xl" />
              </div>
              <p className={`mb-6 ${TC.textSecondary}`}>Are you sure you want to delete this feedback? This action cannot be undone.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setShowDeleteModal(false)} className={`px-5 py-2.5 rounded-xl ${isLight ? "bg-gray-100 text-gray-700 hover:bg-gray-200" : "bg-gray-800 text-gray-300 hover:bg-gray-700"}`}>Cancel</button>
              <button onClick={deleteFeedback} className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20">Delete</button>
            </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFeedback;