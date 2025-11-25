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
  FaCheck, // Added FaCheck here as it was missing from the import list
} from "react-icons/fa";
import axios from "axios";

// Utility to check if light mode is active based on global class
const useThemeCheck = () => {
    const [isLight, setIsLight] = useState(!document.documentElement.classList.contains('dark'));

    useEffect(() => {
        const observer = new MutationObserver(() => {
            // Check if 'dark' class is present on the document element
            setIsLight(!document.documentElement.classList.contains('dark'));
        });

        // Observe changes to the 'class' attribute of the document element
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

        return () => observer.disconnect();
    }, []);

    return isLight;
};

const AdminFeedback = () => {
  const isLight = useThemeCheck();

  // 💡 Theme Classes Helper - Defined once and memoized
  const TC = useMemo(() => ({
    // Text Colors
    textPrimary: isLight ? "text-gray-900" : "text-white",
    textSecondary: isLight ? "text-gray-600" : "text-gray-400",
    textTertiary: isLight ? "text-gray-500" : "text-gray-500",

    // Backgrounds & Borders
    bgContainer: isLight ? "bg-white border border-gray-300 shadow-lg" : "bg-gray-800/50 backdrop-blur-sm border border-gray-700",
    bgCard: isLight ? "bg-white border border-gray-300 shadow-md hover:scale-[1.02]" : "bg-gray-800/50 backdrop-blur-sm border border-gray-700 shadow-lg hover:scale-105",
    bgCardHover: isLight ? "hover:bg-gray-50/50 hover:border-cyan-600/50" : "hover:bg-gray-800/40 hover:border-cyan-400/50",
    bgTableHead: isLight ? "bg-gray-100/70 border-b border-gray-300 text-gray-600" : "bg-gray-700/50 border-b border-gray-700 text-gray-400",
    borderDivide: isLight ? "divide-gray-300" : "divide-gray-700",

    // Inputs & Selects
    inputBg: isLight ? "bg-white border border-gray-300 text-gray-800 placeholder-gray-500" : "bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400",
    inputFocus: "focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500",

    // Button - Primary (Refresh)
    btnPrimary: "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl",
    
    // Button - Secondary (View/Edit)
    btnSecondary: isLight ? "bg-gray-100 hover:bg-cyan-600 text-cyan-600 hover:text-white border border-gray-300 hover:border-cyan-600" : "bg-gray-700/50 hover:bg-cyan-600 text-cyan-400 hover:text-white border border-gray-600 hover:border-cyan-500",
    
    // Button - Danger (Delete)
    btnDanger: isLight ? "bg-gray-100 hover:bg-red-600 text-red-600 hover:text-white border border-gray-300 hover:border-red-600" : "bg-gray-700/50 hover:bg-red-600 text-red-400 hover:text-white border border-gray-600 hover:border-red-500",
    
    // Button - Resolve
    btnResolve: (id, status, resolveLoading) => {
        if (resolveLoading === id) {
            return isLight ? "bg-green-500 text-white disabled:bg-green-300 disabled:text-gray-500" : "disabled:bg-green-400 disabled:text-green-200";
        }
        return isLight ? "bg-gray-100 hover:bg-green-600 text-green-600 hover:text-white border border-gray-300 hover:border-green-600" : "bg-gray-700/50 hover:bg-green-600 text-green-400 hover:text-white border border-gray-600 hover:border-green-500";
    },

    // Modal Specific
    modalBg: isLight ? "bg-white shadow-2xl" : "bg-gray-800/90 backdrop-blur-sm border border-gray-700",
    modalHeader: isLight ? "bg-gray-50 border-gray-300" : "bg-gray-800/90 border-gray-700",
    modalCloseBtn: isLight ? "text-gray-600 hover:text-gray-900 hover:bg-gray-200" : "text-gray-400 hover:text-white hover:bg-gray-700",
    modalInfoBg: isLight ? "bg-gray-100 border border-gray-300" : "bg-gray-700/50 border border-gray-600",
    modalMessageBg: isLight ? "bg-gray-200 border border-gray-300 text-gray-800" : "bg-gray-600/30 border border-gray-500 text-white",
    modalTimestampBg: isLight ? "bg-gray-100 border border-gray-300" : "bg-gray-700/30 border border-gray-600",

    // Status Select
    statusSelectClass: (status) => {
      const base = "w-full text-xs font-medium rounded-lg px-3 py-2 border-0 focus:ring-2 focus:ring-cyan-500 cursor-pointer transition-all duration-200";
      const lightConfig = {
        new: "bg-blue-100 text-blue-700 border border-blue-300",
        "in-progress": "bg-yellow-100 text-yellow-700 border border-yellow-300",
        resolved: "bg-green-100 text-green-700 border border-green-300",
        closed: "bg-gray-100 text-gray-700 border border-gray-300",
      };
      const darkConfig = {
        new: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
        "in-progress": "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
        resolved: "bg-green-500/20 text-green-400 border border-green-500/30",
        closed: "bg-gray-500/20 text-gray-400 border border-gray-500/30",
      };
      const config = isLight ? lightConfig[status] : darkConfig[status];
      return `${base} ${config || (isLight ? lightConfig.new : darkConfig.new)}`;
    },
    
    // Error
    bgError: isLight ? "bg-red-100 border border-red-500" : "bg-red-900/20 border border-red-600",
    textError: isLight ? "text-red-700" : "text-red-400",
    textErrorSecondary: isLight ? "text-red-600" : "text-red-300",

  }), [isLight]);

  // --- State and Handlers (Unchanged Logic, only class updates in return) ---

  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get("http://localhost:5050/api/feedback");

      if (response.data && response.data.success) {
        const feedbackData = response.data.data || [];
        setFeedbacks(feedbackData);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("❌ Error fetching feedbacks:", error);
      setError(
        "Failed to load feedback data. Please check if backend is running."
      );
      setFeedbacks([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = useCallback(async () => {
    try {
      const response = await axios.get(
        "http://localhost:5050/api/feedback/stats"
      );
      if (response.data && response.data.success) {
        setStats(response.data.data || {});
      }
    } catch (error) {
      console.error("❌ Error fetching stats:", error);
      // Fallback: Calculate stats from local data if API fails
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
      const response = await axios.put(
        `http://localhost:5050/api/feedback/${id}`,
        { status }
      );

      if (response.data.success) {
        setFeedbacks((prev) =>
          prev.map((fb) => (fb._id === id ? { ...fb, status } : fb))
        );
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
      const response = await axios.put(
        `http://localhost:5050/api/feedback/${id}`,
        { status: "resolved" }
      );

      if (response.data.success) {
        setFeedbacks((prev) =>
          prev.map((fb) => (fb._id === id ? { ...fb, status: "resolved" } : fb))
        );
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
      const response = await axios.put(
        `http://localhost:5050/api/feedback/${id}`,
        { adminNotes }
      );

      if (response.data.success) {
        setFeedbacks((prev) =>
          prev.map((fb) => (fb._id === id ? { ...fb, adminNotes } : fb))
        );
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

      const response = await axios.delete(
        `http://localhost:5050/api/feedback/${feedbackToDelete._id}`
      );

      if (response.data.success) {
        setFeedbacks((prev) =>
          prev.filter((fb) => fb._id !== feedbackToDelete._id)
        );
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

  // Enhanced Type Icons with better colors - Color logic is now dynamic
  const getTypeIcon = (type) => {
    const iconConfig = {
      bug: {
        icon: FaBug,
        color: isLight ? "text-red-700" : "text-red-400",
        bgColor: isLight ? "bg-red-100" : "bg-red-500/20",
        borderColor: isLight ? "border-red-300" : "border-red-500/30",
      },
      suggestion: {
        icon: FaLightbulb,
        color: isLight ? "text-yellow-700" : "text-yellow-400",
        bgColor: isLight ? "bg-yellow-100" : "bg-yellow-500/20",
        borderColor: isLight ? "border-yellow-300" : "border-yellow-500/30",
      },
      praise: {
        icon: FaStar,
        color: isLight ? "text-green-700" : "text-green-400",
        bgColor: isLight ? "bg-green-100" : "bg-green-500/20",
        borderColor: isLight ? "border-green-300" : "border-green-500/30",
      },
      general: {
        icon: FaComments,
        color: isLight ? "text-blue-700" : "text-blue-400",
        bgColor: isLight ? "bg-blue-100" : "bg-blue-500/20",
        borderColor: isLight ? "border-blue-300" : "border-blue-500/30",
      },
    };

    const config = iconConfig[type] || iconConfig.general;
    const IconComponent = config.icon;

    return (
      <div
        className={`p-2 rounded-lg ${config.bgColor} border ${config.borderColor}`}
      >
        <IconComponent className={`text-sm ${config.color}`} />
      </div>
    );
  };

  // Enhanced Status Badges with beautiful colors - Color logic is now dynamic
  const getStatusBadge = (status) => {
    const statusConfig = {
      new: {
        bg: isLight ? "bg-blue-100" : "bg-blue-500/20",
        text: isLight ? "text-blue-700" : "text-blue-400",
        border: isLight ? "border-blue-300" : "border-blue-500/30",
        dot: isLight ? "bg-blue-700" : "bg-blue-400",
      },
      "in-progress": {
        bg: isLight ? "bg-yellow-100" : "bg-yellow-500/20",
        text: isLight ? "text-yellow-700" : "text-yellow-400",
        border: isLight ? "border-yellow-300" : "border-yellow-500/30",
        dot: isLight ? "bg-yellow-700" : "bg-yellow-400",
      },
      resolved: {
        bg: isLight ? "bg-green-100" : "bg-green-500/20",
        text: isLight ? "text-green-700" : "text-green-400",
        border: isLight ? "border-green-300" : "border-green-500/30",
        dot: isLight ? "bg-green-700" : "bg-green-400",
      },
      closed: {
        bg: isLight ? "bg-gray-200" : "bg-gray-500/20",
        text: isLight ? "text-gray-700" : "text-gray-400",
        border: isLight ? "border-gray-400" : "border-gray-500/30",
        dot: isLight ? "bg-gray-700" : "bg-gray-400",
      },
    };

    const config = statusConfig[status] || statusConfig.new;

    return (
      <div
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${config.bg} border ${config.border}`}
      >
        <div
          className={`w-2 h-2 rounded-full ${config.dot} animate-pulse`}
        ></div>
        <span className={`text-xs font-semibold capitalize ${config.text}`}>
          {status.replace("-", " ")}
        </span>
      </div>
    );
  };

  // Enhanced Priority Badges with beautiful colors - Color logic is now dynamic
  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      low: {
        bg: isLight ? "bg-green-100" : "bg-green-500/20",
        text: isLight ? "text-green-700" : "text-green-400",
        border: isLight ? "border-green-300" : "border-green-500/30",
        dot: isLight ? "bg-green-700" : "bg-green-400",
      },
      medium: {
        bg: isLight ? "bg-yellow-100" : "bg-yellow-500/20",
        text: isLight ? "text-yellow-700" : "text-yellow-400",
        border: isLight ? "border-yellow-300" : "border-yellow-500/30",
        dot: isLight ? "bg-yellow-700" : "bg-yellow-400",
      },
      high: {
        bg: isLight ? "bg-orange-100" : "bg-orange-500/20",
        text: isLight ? "text-orange-700" : "text-orange-400",
        border: isLight ? "border-orange-300" : "border-orange-500/30",
        dot: isLight ? "bg-orange-700" : "bg-orange-400",
      },
      critical: {
        bg: isLight ? "bg-red-100" : "bg-red-500/20",
        text: isLight ? "text-red-700" : "text-red-400",
        border: isLight ? "border-red-300" : "border-red-500/30",
        dot: isLight ? "bg-red-700" : "bg-red-400",
      },
    };

    const config = priorityConfig[priority] || priorityConfig.medium;

    return (
      <div
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${config.bg} border ${config.border}`}
      >
        <div className={`w-2 h-2 rounded-full ${config.dot}`}></div>
        <span className={`text-xs font-semibold capitalize ${config.text}`}>
          {priority}
        </span>
      </div>
    );
  };

  // Enhanced Type Display with colors - Color logic is now dynamic
  const getTypeDisplay = (type) => {
    const typeConfig = {
      bug: isLight ? "text-red-700 bg-red-100 border-red-300" : "text-red-300 bg-red-500/10 border-red-500/20",
      suggestion: isLight ? "text-yellow-700 bg-yellow-100 border-yellow-300" : "text-yellow-300 bg-yellow-500/10 border-yellow-500/20",
      praise: isLight ? "text-green-700 bg-green-100 border-green-300" : "text-green-300 bg-green-500/10 border-green-500/20",
      general: isLight ? "text-blue-700 bg-blue-100 border-blue-300" : "text-blue-300 bg-blue-500/10 border-blue-500/20",
    };

    const config = typeConfig[type] || typeConfig.general;

    return (
      <span
        className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize border ${config}`}
      >
        {type}
      </span>
    );
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      return `${diffInDays}d ago`;
    }
  };

  // Filter feedbacks based on search and filters
  const filteredFeedbacks = feedbacks.filter((feedback) => {
    const matchesSearch =
      !filters.search ||
      feedback.message.toLowerCase().includes(filters.search.toLowerCase()) ||
      (feedback.userEmail &&
        feedback.userEmail
          .toLowerCase()
          .includes(filters.search.toLowerCase()));

    const matchesStatus = !filters.status || feedback.status === filters.status;
    const matchesType = !filters.type || feedback.type === filters.type;
    const matchesPriority =
      !filters.priority || feedback.priority === filters.priority;

    return matchesSearch && matchesStatus && matchesType && matchesPriority;
  });

  if (loading) {
    return (
      <div className={`min-h-screen ${TC.bgScreen} flex items-center justify-center p-4 fade-in`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className={`${TC.textPrimary} text-lg`}>Loading feedback data...</p>
          <p className={`${TC.textSecondary} text-sm`}>
            Please wait while we fetch your feedback
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`min-h-screen ${TC.textPrimary} p-4 sm:p-6 fade-in ${TC.bgScreen}`}>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8 fade-in">
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-t from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Feedback & Reports
              </h1>
              <p className={`${TC.textSecondary} mt-1 sm:mt-2 text-sm sm:text-base`}>
                Manage user feedback and reports
              </p>
            </div>
            <div className="flex gap-2 justify-center sm:justify-start">
              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className={`sm:hidden ${isLight ? "bg-gray-200 hover:bg-gray-300 text-gray-700" : "bg-gray-700 hover:bg-gray-600 text-white"} p-3 rounded-lg transition-all duration-200 fade-in`}
              >
                <FaFilter />
              </button>
              <button
                onClick={() => {
                  fetchFeedbacks();
                  fetchStats();
                }}
                className={`${TC.btnPrimary} px-3 sm:px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 text-sm sm:text-base fade-in`}
              >
                <FaSync className={loading ? "animate-spin" : ""} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className={`${TC.bgError} rounded-xl p-4 mb-6 fade-in`}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <FaExclamationTriangle className={`${TC.textError} flex-shrink-0`} />
                  <div>
                    <p className={`${TC.textError} font-semibold text-sm sm:text-base`}>
                      Failed to load data
                    </p>
                    <p className={`${TC.textErrorSecondary} text-xs sm:text-sm`}>{error}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    fetchFeedbacks();
                    fetchStats();
                  }}
                  className={`bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-3 sm:px-4 py-2 rounded text-sm w-full sm:w-auto transition-all duration-200 fade-in`}
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
            {[
              {
                label: "Total",
                value: stats.total || 0,
                icon: FaChartBar,
                color: "text-cyan",
                delay: "0.1s",
              },
              {
                label: "Today",
                value: stats.today || 0,
                icon: FaCalendarDay,
                color: "text-blue",
                delay: "0.2s",
              },
              {
                label: "In Progress",
                value: stats.inProgress || 0,
                icon: FaLightbulb,
                color: "text-yellow",
                delay: "0.3s",
              },
              {
                label: "Resolved",
                value: stats.resolved || 0,
                icon: FaCheckCircle,
                color: "text-green",
                delay: "0.4s",
              },
            ].map((stat) => {
                // Dynamically adjust colors for light mode
                const statColor = isLight ? stat.color + "-700" : stat.color + "-400";
                const statBg = isLight ? stat.color + "-100" : stat.color + "-500/20";
                const statBorder = isLight ? `border-${stat.color.split('-')[0]}-300` : `border-${stat.color.split('-')[0]}-500/30`;

              return (
                <div
                  key={stat.label}
                  className={`${TC.bgCard} rounded-xl p-4 sm:p-6 transition-all duration-300 group cursor-pointer fade-in`}
                  style={{ animationDelay: stat.delay }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`${TC.textSecondary} text-xs sm:text-sm`}>
                        {stat.label}
                      </p>
                      <p
                        className={`text-xl sm:text-2xl font-bold ${statColor} mb-1 group-hover:scale-110 transition-transform`}
                      >
                        {stat.value}
                      </p>
                      {stat.label === "Today" && (
                        <p className={`${TC.textSecondary} text-xs mt-1 hidden sm:block`}>
                          Last 24 hours
                        </p>
                      )}
                    </div>
                    <div
                      className={`p-3 rounded-lg ${statBg} border ${statBorder}`}
                    >
                      <stat.icon
                        className={`text-lg sm:text-xl md:text-2xl ${statColor}`}
                      />
                    </div>
                  </div>
                </div>
            )})}
          </div>

          {/* Mobile Filters */}
          {showMobileFilters && (
            <div className={`sm:hidden ${TC.bgContainer} rounded-xl p-4 mb-4 fade-in`}>
              <div className="space-y-3">
                <div className="relative">
                  <FaSearch className={`absolute left-3 top-3 ${TC.textSecondary}`} />
                  <input
                    type="text"
                    placeholder="Search feedback..."
                    className={`w-full border rounded-lg pl-10 pr-4 py-2 ${TC.inputBg} ${TC.inputFocus} text-sm fade-in`}
                    value={filters.search}
                    onChange={(e) =>
                      setFilters({ ...filters, search: e.target.value })
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <select
                    className={`border rounded-lg px-3 py-2 ${TC.inputBg} ${TC.inputFocus} text-sm fade-in`}
                    value={filters.status}
                    onChange={(e) =>
                      setFilters({ ...filters, status: e.target.value })
                    }
                  >
                    <option value="">All Status</option>
                    <option value="new">New</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>

                  <select
                    className={`border rounded-lg px-3 py-2 ${TC.inputBg} ${TC.inputFocus} text-sm fade-in`}
                    value={filters.type}
                    onChange={(e) =>
                      setFilters({ ...filters, type: e.target.value })
                    }
                  >
                    <option value="">All Types</option>
                    <option value="bug">Bug</option>
                    <option value="suggestion">Suggestion</option>
                    <option value="praise">Praise</option>
                  </select>
                </div>

                <button
                  onClick={() => setShowMobileFilters(false)}
                  className={`w-full ${TC.btnPrimary} py-2 rounded-lg transition-all duration-200 text-sm fade-in`}
                >
                  Apply Filters
                </button>
              </div>
            </div>
          )}

          {/* Desktop Filters */}
          <div className={`hidden sm:block ${TC.bgContainer} rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 fade-in`}>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 sm:gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <FaSearch className={`absolute left-3 top-3 ${TC.textSecondary}`} />
                  <input
                    type="text"
                    placeholder="Search feedback messages or emails..."
                    className={`w-full border rounded-lg pl-10 pr-4 py-2 ${TC.inputBg} ${TC.inputFocus} text-sm fade-in`}
                    value={filters.search}
                    onChange={(e) =>
                      setFilters({ ...filters, search: e.target.value })
                    }
                  />
                </div>
              </div>

              <select
                className={`border rounded-lg px-3 py-2 ${TC.inputBg} ${TC.inputFocus} text-sm fade-in`}
                value={filters.status}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value })
                }
              >
                <option value="">All Status</option>
                <option value="new">New</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>

              <select
                className={`border rounded-lg px-3 py-2 ${TC.inputBg} ${TC.inputFocus} text-sm fade-in`}
                value={filters.type}
                onChange={(e) =>
                  setFilters({ ...filters, type: e.target.value })
                }
              >
                <option value="">All Types</option>
                <option value="bug">Bug</option>
                <option value="suggestion">Suggestion</option>
                <option value="praise">Praise</option>
                <option value="general">General</option>
              </select>

              <select
                className={`border rounded-lg px-3 py-2 ${TC.inputBg} ${TC.inputFocus} text-sm fade-in`}
                value={filters.priority}
                onChange={(e) =>
                  setFilters({ ...filters, priority: e.target.value })
                }
              >
                <option value="">All Priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          {/* Feedback Content */}
          <div className={`${TC.bgContainer} rounded-xl overflow-hidden fade-in`}>
            {/* Desktop Table - Scrollable without visible scrollbar */}
            <div className="hidden lg:block">
              <div className="max-h-[480px] overflow-y-auto custom-scrollbar">
                <table className="w-full">
                  <thead className={TC.bgTableHead}>
                    <tr>
                      <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${TC.textSecondary}`}>
                        Feedback
                      </th>
                      <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${TC.textSecondary}`}>
                        Type & Priority
                      </th>
                      <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${TC.textSecondary}`}>
                        Status
                      </th>
                      <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${TC.textSecondary}`}>
                        Date & Time
                      </th>
                      <th className={`px-4 py-3 text-center text-xs font-medium uppercase tracking-wider ${TC.textSecondary}`}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${TC.borderDivide}`}>
                    {filteredFeedbacks.map((feedback, index) => (
                      <tr
                        key={feedback._id}
                        className={`transition-all duration-300 ease-out ${TC.bgCardHover} fade-in`}
                        style={{ animationDelay: `${0.3 + index * 0.1}s` }}
                      >
                        <td className="px-4 py-4">
                          <div className="max-w-md">
                            <p className={`text-sm font-medium ${TC.textPrimary} line-clamp-2`}>
                              {feedback.message}
                            </p>
                            {feedback.userEmail && (
                              <p className={`text-xs ${TC.textSecondary} mt-1`}>
                                📧 {feedback.userEmail}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              {getTypeIcon(feedback.type)}
                              {getTypeDisplay(feedback.type)}
                            </div>
                            <div>{getPriorityBadge(feedback.priority)}</div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <select
                            value={feedback.status}
                            onChange={(e) =>
                              updateFeedbackStatus(feedback._id, e.target.value)
                            }
                            className={TC.statusSelectClass(feedback.status)}
                          >
                            <option value="new">New</option>
                            <option value="in-progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                            <option value="closed">Closed</option>
                          </select>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm space-y-1">
                            <div className={TC.textSecondary}>
                              {new Date(feedback.createdAt).toLocaleDateString()}
                            </div>
                            <div className={TC.textTertiary}>
                              {getTimeAgo(feedback.createdAt)}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2 justify-center">
                            {/* View Button */}
                            <button
                              onClick={() => {
                                setSelectedFeedback(feedback);
                                setEditNotes(feedback.adminNotes || "");
                                setShowModal(true);
                              }}
                              className={`${TC.btnSecondary} rounded-lg p-2 transition-all duration-200 hover:shadow-cyan-500/25 
                                        transform hover:scale-105 flex items-center gap-2 group text-sm fade-in`}
                              title="View Details"
                            >
                              <FaEye className="text-xs group-hover:scale-110 transition-transform" />
                              <span className="font-medium">View</span>
                            </button>
                            {/* Resolve Button */}
                            {feedback.status !== "resolved" && (
                              <button
                                onClick={() => markAsResolved(feedback._id)}
                                disabled={resolveLoading === feedback._id}
                                className={`${TC.btnResolve(feedback._id, feedback.status, resolveLoading)} rounded-lg p-2 
                                          transition-all duration-200 hover:shadow-green-500/25 
                                          transform hover:scale-105 border disabled:cursor-not-allowed 
                                          flex items-center gap-2 group text-sm fade-in`}
                                title="Mark as Resolved"
                              >
                                {resolveLoading === feedback._id ? (
                                  <div className={`w-3 h-3 border-2 ${isLight ? "border-gray-500 border-t-transparent" : "border-white border-t-transparent"} rounded-full animate-spin`}></div>
                                ) : (
                                  <FaCheck className="text-xs group-hover:scale-110 transition-transform" />
                                )}
                                <span className="font-medium">
                                  {resolveLoading === feedback._id
                                    ? "..."
                                    : "Resolve"}
                                </span>
                              </button>
                            )}
                            {/* Delete Button */}
                            <button
                              onClick={() => confirmDelete(feedback)}
                              className={`${TC.btnDanger} rounded-lg p-2 transition-all duration-200 hover:shadow-red-500/25 
                                        transform hover:scale-105 flex items-center gap-2 group text-sm fade-in`}
                              title="Delete"
                            >
                              <FaTrash className="text-xs group-hover:scale-110 transition-transform" />
                              <span className="font-medium">Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Cards - Scrollable without visible scrollbar */}
            <div className="lg:hidden">
              <div className="max-h-[500px] overflow-y-auto custom-scrollbar p-4 space-y-4">
                {filteredFeedbacks.map((feedback, index) => (
                  <div
                    key={feedback._id}
                    className={`rounded-lg p-4 border transition-all duration-300 ease-out ${isLight ? "bg-white" : "bg-gradient-to-br from-gray-800/50 to-gray-800/30"} ${TC.bgCardHover} fade-in`}
                    style={{ animationDelay: `${0.3 + index * 0.1}s` }}
                  >
                    {/* Header */}
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(feedback.type)}
                        <select
                          value={feedback.status}
                          onChange={(e) =>
                            updateFeedbackStatus(feedback._id, e.target.value)
                          }
                          className={TC.statusSelectClass(feedback.status)}
                        >
                          <option value="new">New</option>
                          <option value="in-progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                          <option value="closed">Closed</option>
                        </select>
                      </div>
                      {getPriorityBadge(feedback.priority)}
                    </div>

                    {/* Message */}
                    <p className={`${TC.textPrimary} text-sm mb-3 line-clamp-3`}>
                      {feedback.message}
                    </p>

                    {/* User Email */}
                    {feedback.userEmail && (
                      <p className={`${TC.textSecondary} text-xs mb-3`}>
                        📧 {feedback.userEmail}
                      </p>
                    )}

                    {/* Date & Time */}
                    <div className={`text-xs ${TC.textTertiary} mb-3`}>
                      <div>
                        {new Date(feedback.createdAt).toLocaleDateString()}
                      </div>
                      <div>{getTimeAgo(feedback.createdAt)}</div>
                    </div>

                    {/* Actions - Centered */}
                    <div className="flex flex-wrap gap-2 justify-center">
                      {/* View Button */}
                      <button
                        onClick={() => {
                          setSelectedFeedback(feedback);
                          setEditNotes(feedback.adminNotes || "");
                          setShowModal(true);
                        }}
                        className={`flex-1 min-w-[80px] ${TC.btnSecondary} rounded-lg p-2 transition-all duration-200 hover:shadow-cyan-500/25 
                                  transform hover:scale-105 flex items-center justify-center gap-1 group text-xs fade-in`}
                      >
                        <FaEye className="text-xs group-hover:scale-110 transition-transform" />
                        <span className="font-medium">View</span>
                      </button>
                      {/* Resolve Button */}
                      {feedback.status !== "resolved" && (
                        <button
                          onClick={() => markAsResolved(feedback._id)}
                          disabled={resolveLoading === feedback._id}
                          className={`flex-1 min-w-[80px] ${TC.btnResolve(feedback._id, feedback.status, resolveLoading)} rounded-lg p-2 
                                    transition-all duration-200 hover:shadow-green-500/25 
                                    transform hover:scale-105 border disabled:cursor-not-allowed flex items-center justify-center gap-1 group text-xs fade-in`}
                        >
                          {resolveLoading === feedback._id ? (
                            <div className={`w-3 h-3 border-2 ${isLight ? "border-gray-500 border-t-transparent" : "border-white border-t-transparent"} rounded-full animate-spin`}></div>
                          ) : (
                            <FaCheck className="text-xs group-hover:scale-110 transition-transform" />
                          )}
                          <span className="font-medium">
                            {resolveLoading === feedback._id
                              ? "..."
                              : "Resolve"}
                          </span>
                        </button>
                      )}
                      {/* Delete Button */}
                      <button
                        onClick={() => confirmDelete(feedback)}
                        className={`flex-1 min-w-[80px] ${TC.btnDanger} rounded-lg p-2 transition-all duration-200 hover:shadow-red-500/25 
                                  transform hover:scale-105 flex items-center justify-center gap-1 group text-xs fade-in`}
                      >
                        <FaTrash className="text-xs group-hover:scale-110 transition-transform" />
                        <span className="font-medium">Delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Empty States */}
            {filteredFeedbacks.length === 0 &&
              feedbacks.length === 0 &&
              !error && (
                <div className="text-center py-8 sm:py-12 fade-in">
                  <FaComments className={`mx-auto text-3xl sm:text-4xl ${TC.textTertiary} mb-3 sm:mb-4`} />
                  <p className={`${TC.textSecondary} text-sm sm:text-base`}>
                    No feedback data available
                  </p>
                  <p className={`${TC.textTertiary} text-xs sm:text-sm mt-1 sm:mt-2`}>
                    Submit feedback through the website footer first
                  </p>
                </div>
              )}

            {filteredFeedbacks.length === 0 && feedbacks.length > 0 && (
              <div className="text-center py-8 sm:py-12 fade-in">
                <FaFilter className={`mx-auto text-3xl sm:text-4xl ${TC.textTertiary} mb-3 sm:mb-4`} />
                <p className={`${TC.textSecondary} text-sm sm:text-base`}>
                  No feedback matches your current filters
                </p>
                <button
                  onClick={() =>
                    setFilters({
                      status: "",
                      type: "",
                      priority: "",
                      search: "",
                    })
                  }
                  className={`mt-2 ${isLight ? "text-cyan-600 hover:text-cyan-500" : "text-cyan-400 hover:text-cyan-300"} text-xs sm:text-sm fade-in`}
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced View Modal */}
      {showModal && selectedFeedback && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4 fade-in">
          <div className={`${TC.modalBg} rounded-xl w-full max-w-md max-h-[85vh] overflow-y-auto`}>
            {/* Modal Header */}
            <div className={`flex items-center justify-between p-4 border-b sticky top-0 rounded-t-xl ${TC.modalHeader}`}>
              <div className="flex items-center gap-3">
                {getTypeIcon(selectedFeedback.type)}
                <div>
                  <h3 className={`text-lg font-semibold ${TC.textPrimary} capitalize`}>
                    {selectedFeedback.type} Feedback
                  </h3>
                  <p className={`text-sm ${TC.textSecondary} flex items-center gap-1`}>
                    <FaClock className="text-xs" />
                    {getTimeAgo(selectedFeedback.createdAt)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className={`p-2 rounded-lg transition-colors transform hover:scale-110 ${TC.modalCloseBtn}`}
              >
                <FaTimes />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 space-y-4">
              {/* Status & Priority */}
              <div className="grid grid-cols-2 gap-3">
                <div className={`${TC.modalInfoBg} p-3 rounded-lg`}>
                  <label className={`text-xs ${TC.textSecondary} block mb-1`}>
                    Status
                  </label>
                  {getStatusBadge(selectedFeedback.status)}
                </div>
                <div className={`${TC.modalInfoBg} p-3 rounded-lg`}>
                  <label className={`text-xs ${TC.textSecondary} block mb-1`}>
                    Priority
                  </label>
                  {getPriorityBadge(selectedFeedback.priority)}
                </div>
              </div>

              {/* User Info */}
              {selectedFeedback.userEmail && (
                <div className={`${TC.modalInfoBg} p-3 rounded-lg`}>
                  <label className={`text-xs ${TC.textSecondary} mb-1 flex items-center gap-2`}>
                    <FaUser className="text-xs" />
                    Submitted By
                  </label>
                  <p className={`${TC.textPrimary} text-sm`}>
                    📧 {selectedFeedback.userEmail}
                  </p>
                </div>
              )}

              {/* Feedback Message */}
              <div className={`${TC.modalInfoBg} p-3 rounded-lg`}>
                <label className={`text-xs ${TC.textSecondary} block mb-2`}>
                  Feedback Message
                </label>
                <p className={`leading-relaxed p-3 rounded-lg text-sm ${TC.modalMessageBg}`}>
                  {selectedFeedback.message}
                </p>
              </div>

              {/* Admin Notes */}
              <div className={`${TC.modalInfoBg} p-3 rounded-lg`}>
                <label className={`text-xs ${TC.textSecondary} block mb-2`}>
                  Admin Notes
                </label>
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className={`w-full border rounded-lg px-3 py-2 ${TC.modalMessageBg} ${TC.inputFocus} resize-none text-sm`}
                  rows="3"
                  placeholder="Add internal notes here..."
                />
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() =>
                      updateFeedbackNotes(selectedFeedback._id, editNotes)
                    }
                    className={`flex-1 ${TC.btnPrimary} px-3 py-2 rounded-lg transition-all duration-200 font-medium text-sm`}
                  >
                    Save Notes
                  </button>
                  <button
                    onClick={() => setShowModal(false)}
                    className={`flex-1 bg-gradient-to-r ${isLight ? "from-gray-300 to-gray-400 hover:from-gray-400 hover:to-gray-500 text-gray-800" : "from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white"} px-3 py-2 rounded-lg transition-all duration-200 text-sm shadow-lg hover:shadow-xl`}
                  >
                    Close
                  </button>
                </div>
              </div>

              {/* Timestamps */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className={`p-2 rounded-lg ${TC.modalTimestampBg}`}>
                  <div className={`${TC.textSecondary} mb-1`}>Created</div>
                  <div className={TC.textPrimary}>
                    {new Date(selectedFeedback.createdAt).toLocaleDateString()}
                  </div>
                  <div className={TC.textTertiary}>
                    {new Date(selectedFeedback.createdAt).toLocaleTimeString()}
                  </div>
                </div>
                <div className={`p-2 rounded-lg ${TC.modalTimestampBg}`}>
                  <div className={`${TC.textSecondary} mb-1`}>Last Updated</div>
                  <div className={TC.textPrimary}>
                    {new Date(selectedFeedback.updatedAt).toLocaleDateString()}
                  </div>
                  <div className={TC.textTertiary}>
                    {new Date(selectedFeedback.updatedAt).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Delete Confirmation Modal */}
      {showDeleteModal && feedbackToDelete && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4 fade-in">
          <div className={`${TC.modalBg} rounded-xl w-full max-w-sm`}>
            {/* Header */}
            <div className={`flex items-center justify-between p-4 border-b ${TC.modalHeader}`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 ${isLight ? "bg-red-100" : "bg-red-500/20"} rounded-lg`}>
                  <FaExclamationTriangle className={`${isLight ? "text-red-700" : "text-red-400"} text-lg`} />
                </div>
                <div>
                  <h3 className={`text-base font-semibold ${TC.textPrimary}`}>
                    Delete Feedback
                  </h3>
                  <p className={`${TC.textSecondary} text-sm`}>
                    This action cannot be undone
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              <div className="mb-4">
                <p className={`${TC.textSecondary} mb-3 text-sm`}>
                  Are you sure you want to delete this feedback?
                </p>
                <div className={`${TC.modalInfoBg} p-3 rounded-lg`}>
                  <p className={`${TC.textPrimary} text-sm line-clamp-3`}>
                    "{feedbackToDelete.message}"
                  </p>
                  {feedbackToDelete.userEmail && (
                    <p className={`${TC.textSecondary} text-xs mt-1`}>
                      From: {feedbackToDelete.userEmail}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={deleteFeedback}
                  disabled={deleteLoading}
                  className={`flex-1 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 disabled:from-red-400 disabled:to-pink-400 text-white px-4 py-3 rounded-lg transition-all duration-200 font-medium disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm shadow-lg hover:shadow-xl`}
                >
                  {deleteLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <FaTrash className="text-sm" />
                      Delete
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setFeedbackToDelete(null);
                  }}
                  disabled={deleteLoading}
                  className={`flex-1 bg-gradient-to-r ${isLight ? "from-gray-300 to-gray-400 hover:from-gray-400 hover:to-gray-500 text-gray-800" : "from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white"} disabled:from-gray-500 disabled:to-gray-600 px-4 py-3 rounded-lg transition-all duration-200 disabled:cursor-not-allowed text-sm shadow-lg hover:shadow-xl`}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </>
  );
};

export default AdminFeedback;