import React, { useState, useEffect, useCallback } from "react";
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
  FaEdit,
  FaSync,
  FaExclamationTriangle,
  FaCalendarDay,
  FaTimes,
  FaUser,
  FaClock,
  FaCheckCircle,
  FaCheck,
  FaBars,
  FaEllipsisV,
} from "react-icons/fa";
import axios from "axios";

const AdminFeedback = () => {
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
      // Calculate stats from local data if API fails
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

  // Enhanced Type Icons with better colors
  const getTypeIcon = (type) => {
    const iconConfig = {
      bug: { icon: FaBug, color: "text-red-400", bgColor: "bg-red-500/20" },
      suggestion: {
        icon: FaLightbulb,
        color: "text-yellow-400",
        bgColor: "bg-yellow-500/20",
      },
      praise: {
        icon: FaStar,
        color: "text-green-400",
        bgColor: "bg-green-500/20",
      },
      general: {
        icon: FaComments,
        color: "text-blue-400",
        bgColor: "bg-blue-500/20",
      },
    };

    const config = iconConfig[type] || iconConfig.general;
    const IconComponent = config.icon;

    return (
      <div
        className={`p-2 rounded-lg ${config.bgColor} border ${config.bgColor
          .replace("bg-", "border-")
          .replace("/20", "/30")}`}
      >
        <IconComponent className={`text-sm ${config.color}`} />
      </div>
    );
  };

  // Enhanced Status Badges with beautiful colors
  const getStatusBadge = (status) => {
    const statusConfig = {
      new: {
        bg: "bg-blue-500/20",
        text: "text-blue-400",
        border: "border-blue-500/30",
        dot: "bg-blue-400",
      },
      "in-progress": {
        bg: "bg-yellow-500/20",
        text: "text-yellow-400",
        border: "border-yellow-500/30",
        dot: "bg-yellow-400",
      },
      resolved: {
        bg: "bg-green-500/20",
        text: "text-green-400",
        border: "border-green-500/30",
        dot: "bg-green-400",
      },
      closed: {
        bg: "bg-gray-500/20",
        text: "text-gray-400",
        border: "border-gray-500/30",
        dot: "bg-gray-400",
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

  // Enhanced Priority Badges with beautiful colors
  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      low: {
        bg: "bg-green-500/20",
        text: "text-green-400",
        border: "border-green-500/30",
        dot: "bg-green-400",
      },
      medium: {
        bg: "bg-yellow-500/20",
        text: "text-yellow-400",
        border: "border-yellow-500/30",
        dot: "bg-yellow-400",
      },
      high: {
        bg: "bg-orange-500/20",
        text: "text-orange-400",
        border: "border-orange-500/30",
        dot: "bg-orange-400",
      },
      critical: {
        bg: "bg-red-500/20",
        text: "text-red-400",
        border: "border-red-500/30",
        dot: "bg-red-400",
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

  // Enhanced Type Display with colors
  const getTypeDisplay = (type) => {
    const typeConfig = {
      bug: "text-red-300 bg-red-500/10 border-red-500/20",
      suggestion: "text-yellow-300 bg-yellow-500/10 border-yellow-500/20",
      praise: "text-green-300 bg-green-500/10 border-green-500/20",
      general: "text-blue-300 bg-blue-500/10 border-blue-500/20",
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
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 fade-in">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading feedback data...</p>
          <p className="text-gray-400 text-sm">
            Please wait while we fetch your feedback
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen text-white p-4 sm:p-6 fade-in">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8 fade-in">
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-t from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Feedback & Reports
              </h1>
              <p className="text-gray-400 mt-1 sm:mt-2 text-sm sm:text-base">
                Manage user feedback and reports
              </p>
            </div>
            <div className="flex gap-2 justify-center sm:justify-start">
              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="sm:hidden bg-gray-700 hover:bg-gray-600 text-white p-3 rounded-lg transition-all duration-200 fade-in"
              >
                <FaFilter />
              </button>
              <button
                onClick={() => {
                  fetchFeedbacks();
                  fetchStats();
                }}
                className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 text-sm sm:text-base shadow-lg hover:shadow-xl fade-in"
              >
                <FaSync className={loading ? "animate-spin" : ""} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-900/20 border border-red-600 rounded-xl p-4 mb-6 fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <FaExclamationTriangle className="text-red-400 flex-shrink-0" />
                  <div>
                    <p className="text-red-400 font-semibold text-sm sm:text-base">
                      Failed to load data
                    </p>
                    <p className="text-red-300 text-xs sm:text-sm">{error}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    fetchFeedbacks();
                    fetchStats();
                  }}
                  className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-3 sm:px-4 py-2 rounded text-sm w-full sm:w-auto transition-all duration-200 fade-in"
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
                color: "text-cyan-400",
                bg: "bg-cyan-500/20",
                delay: "0.1s",
              },
              {
                label: "Today",
                value: stats.today || 0,
                icon: FaCalendarDay,
                color: "text-blue-400",
                bg: "bg-blue-500/20",
                delay: "0.2s",
              },
              {
                label: "In Progress",
                value: stats.inProgress || 0,
                icon: FaLightbulb,
                color: "text-yellow-400",
                bg: "bg-yellow-500/20",
                delay: "0.3s",
              },
              {
                label: "Resolved",
                value: stats.resolved || 0,
                icon: FaCheckCircle,
                color: "text-green-400",
                bg: "bg-green-500/20",
                delay: "0.4s",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4 sm:p-6 transition-all duration-300 hover:scale-105 group cursor-pointer fade-in"
                style={{ animationDelay: stat.delay }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-xs sm:text-sm">
                      {stat.label}
                    </p>
                    <p
                      className={`text-xl sm:text-2xl font-bold ${stat.color} mb-1 group-hover:scale-110 transition-transform`}
                    >
                      {stat.value}
                    </p>
                    {stat.label === "Today" && (
                      <p className="text-gray-400 text-xs mt-1 hidden sm:block">
                        Last 24 hours
                      </p>
                    )}
                  </div>
                  <div
                    className={`p-3 rounded-lg ${stat.bg} border ${stat.bg
                      .replace("bg-", "border-")
                      .replace("/20", "/30")}`}
                  >
                    <stat.icon
                      className={`text-lg sm:text-xl md:text-2xl ${stat.color}`}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile Filters */}
          {showMobileFilters && (
            <div className="sm:hidden bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4 mb-4 fade-in">
              <div className="space-y-3">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search feedback..."
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm fade-in"
                    value={filters.search}
                    onChange={(e) =>
                      setFilters({ ...filters, search: e.target.value })
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <select
                    className="bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm fade-in"
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
                    className="bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm fade-in"
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
                  className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white py-2 rounded-lg transition-all duration-200 text-sm shadow-lg hover:shadow-xl fade-in"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          )}

          {/* Desktop Filters */}
          <div className="hidden sm:block bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 fade-in">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 sm:gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search feedback messages or emails..."
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm fade-in"
                    value={filters.search}
                    onChange={(e) =>
                      setFilters({ ...filters, search: e.target.value })
                    }
                  />
                </div>
              </div>

              <select
                className="bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm fade-in"
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
                className="bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm fade-in"
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
                className="bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm fade-in"
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
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl overflow-hidden fade-in">
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Feedback
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Type & Priority
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredFeedbacks.map((feedback, index) => (
                    <tr
                      key={feedback._id}
                      className="transition-all duration-300 ease-out hover:bg-gray-800/40 fade-in"
                      style={{ animationDelay: `${0.3 + index * 0.1}s` }}
                    >
                      <td className="px-4 py-4">
                        <div className="max-w-md">
                          <p className="text-sm font-medium text-white line-clamp-2">
                            {feedback.message}
                          </p>
                          {feedback.userEmail && (
                            <p className="text-xs text-gray-400 mt-1">
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
                          className={`w-full text-xs font-medium rounded-lg px-3 py-2 border-0 focus:ring-2 focus:ring-cyan-500 cursor-pointer transition-all duration-200 ${
                            feedback.status === "new"
                              ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                              : feedback.status === "in-progress"
                              ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                              : feedback.status === "resolved"
                              ? "bg-green-500/20 text-green-400 border border-green-500/30"
                              : "bg-gray-500/20 text-gray-400 border border-gray-500/30"
                          }`}
                        >
                          <option value="new">New</option>
                          <option value="in-progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                          <option value="closed">Closed</option>
                        </select>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm space-y-1">
                          <div className="text-gray-400">
                            {new Date(feedback.createdAt).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {getTimeAgo(feedback.createdAt)}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2 justify-center">
                          <button
                            onClick={() => {
                              setSelectedFeedback(feedback);
                              setEditNotes(feedback.adminNotes || "");
                              setShowModal(true);
                            }}
                            className="bg-gray-700/50 hover:bg-cyan-600 text-cyan-400 hover:text-white 
                                      rounded-lg p-2 transition-all duration-200 hover:shadow-cyan-500/25 
                                      transform hover:scale-105 border border-gray-600 hover:border-cyan-500
                                      flex items-center gap-2 group text-sm fade-in"
                            title="View Details"
                          >
                            <FaEye className="text-xs group-hover:scale-110 transition-transform" />
                            <span className="font-medium">View</span>
                          </button>
                          {feedback.status !== "resolved" && (
                            <button
                              onClick={() => markAsResolved(feedback._id)}
                              disabled={resolveLoading === feedback._id}
                              className="bg-gray-700/50 hover:bg-green-600 text-green-400 hover:text-white 
                                        disabled:bg-green-400 disabled:text-green-200 rounded-lg p-2 
                                        transition-all duration-200 hover:shadow-green-500/25 
                                        transform hover:scale-105 border border-gray-600 hover:border-green-500
                                        disabled:cursor-not-allowed flex items-center gap-2 group text-sm fade-in"
                              title="Mark as Resolved"
                            >
                              {resolveLoading === feedback._id ? (
                                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
                          <button
                            onClick={() => confirmDelete(feedback)}
                            className="bg-gray-700/50 hover:bg-red-600 text-red-400 hover:text-white 
                                      rounded-lg p-2 transition-all duration-200 hover:shadow-red-500/25 
                                      transform hover:scale-105 border border-gray-600 hover:border-red-500
                                      flex items-center gap-2 group text-sm fade-in"
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

            {/* Mobile Cards */}
            <div className="lg:hidden">
              <div className="p-4 space-y-4">
                {filteredFeedbacks.map((feedback, index) => (
                  <div
                    key={feedback._id}
                    className="bg-gradient-to-br from-gray-800/50 to-gray-800/30 border border-gray-600 rounded-lg p-4 transition-all duration-300 ease-out hover:bg-gray-800/50 hover:border-cyan-400/50 fade-in"
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
                          className={`text-xs font-medium rounded-lg px-2 py-1 border-0 focus:ring-2 focus:ring-cyan-500 cursor-pointer transition-all duration-200 ${
                            feedback.status === "new"
                              ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                              : feedback.status === "in-progress"
                              ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                              : feedback.status === "resolved"
                              ? "bg-green-500/20 text-green-400 border border-green-500/30"
                              : "bg-gray-500/20 text-gray-400 border border-gray-500/30"
                          }`}
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
                    <p className="text-white text-sm mb-3 line-clamp-3">
                      {feedback.message}
                    </p>

                    {/* User Email */}
                    {feedback.userEmail && (
                      <p className="text-gray-400 text-xs mb-3">
                        📧 {feedback.userEmail}
                      </p>
                    )}

                    {/* Date & Time */}
                    <div className="text-xs text-gray-500 mb-3">
                      <div>
                        {new Date(feedback.createdAt).toLocaleDateString()}
                      </div>
                      <div>{getTimeAgo(feedback.createdAt)}</div>
                    </div>

                    {/* Actions - Centered */}
                    <div className="flex flex-wrap gap-2 justify-center">
                      <button
                        onClick={() => {
                          setSelectedFeedback(feedback);
                          setEditNotes(feedback.adminNotes || "");
                          setShowModal(true);
                        }}
                        className="flex-1 min-w-[80px] bg-gray-700/50 hover:bg-cyan-600 text-cyan-400 hover:text-white 
                                  rounded-lg p-2 transition-all duration-200 hover:shadow-cyan-500/25 
                                  transform hover:scale-105 border border-gray-600 hover:border-cyan-500
                                  flex items-center justify-center gap-1 group text-xs fade-in"
                      >
                        <FaEye className="text-xs group-hover:scale-110 transition-transform" />
                        <span className="font-medium">View</span>
                      </button>
                      {feedback.status !== "resolved" && (
                        <button
                          onClick={() => markAsResolved(feedback._id)}
                          disabled={resolveLoading === feedback._id}
                          className="flex-1 min-w-[80px] bg-gray-700/50 hover:bg-green-600 text-green-400 hover:text-white 
                                    disabled:bg-green-400 disabled:text-green-200 rounded-lg p-2 
                                    transition-all duration-200 hover:shadow-green-500/25 
                                    transform hover:scale-105 border border-gray-600 hover:border-green-500
                                    disabled:cursor-not-allowed flex items-center justify-center gap-1 group text-xs fade-in"
                        >
                          {resolveLoading === feedback._id ? (
                            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
                      <button
                        onClick={() => confirmDelete(feedback)}
                        className="flex-1 min-w-[80px] bg-gray-700/50 hover:bg-red-600 text-red-400 hover:text-white 
                                  rounded-lg p-2 transition-all duration-200 hover:shadow-red-500/25 
                                  transform hover:scale-105 border border-gray-600 hover:border-red-500
                                  flex items-center justify-center gap-1 group text-xs fade-in"
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
                  <FaComments className="mx-auto text-3xl sm:text-4xl text-gray-500 mb-3 sm:mb-4" />
                  <p className="text-gray-400 text-sm sm:text-base">
                    No feedback data available
                  </p>
                  <p className="text-gray-500 text-xs sm:text-sm mt-1 sm:mt-2">
                    Submit feedback through the website footer first
                  </p>
                </div>
              )}

            {filteredFeedbacks.length === 0 && feedbacks.length > 0 && (
              <div className="text-center py-8 sm:py-12 fade-in">
                <FaFilter className="mx-auto text-3xl sm:text-4xl text-gray-500 mb-3 sm:mb-4" />
                <p className="text-gray-400 text-sm sm:text-base">
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
                  className="mt-2 text-cyan-400 hover:text-cyan-300 text-xs sm:text-sm fade-in"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced View Modal - Fixed to cover entire screen including sidebar */}
      {showModal && selectedFeedback && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4 fade-in">
          <div className="bg-gray-800/90 backdrop-blur-sm border border-gray-700 rounded-xl w-full max-w-md max-h-[85vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700 sticky top-0 bg-gray-800/90 rounded-t-xl">
              <div className="flex items-center gap-3">
                {getTypeIcon(selectedFeedback.type)}
                <div>
                  <h3 className="text-lg font-semibold text-white capitalize">
                    {selectedFeedback.type} Feedback
                  </h3>
                  <p className="text-sm text-gray-400 flex items-center gap-1">
                    <FaClock className="text-xs" />
                    {getTimeAgo(selectedFeedback.createdAt)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700 transition-colors transform hover:scale-110"
              >
                <FaTimes />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 space-y-4">
              {/* Status & Priority */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-700/50 p-3 rounded-lg">
                  <label className="text-xs text-gray-400 block mb-1">
                    Status
                  </label>
                  {getStatusBadge(selectedFeedback.status)}
                </div>
                <div className="bg-gray-700/50 p-3 rounded-lg">
                  <label className="text-xs text-gray-400 block mb-1">
                    Priority
                  </label>
                  {getPriorityBadge(selectedFeedback.priority)}
                </div>
              </div>

              {/* User Info */}
              {selectedFeedback.userEmail && (
                <div className="bg-gray-700/50 p-3 rounded-lg">
                  <label className="text-xs text-gray-400 mb-1 flex items-center gap-2">
                    <FaUser className="text-xs" />
                    Submitted By
                  </label>
                  <p className="text-white text-sm">
                    📧 {selectedFeedback.userEmail}
                  </p>
                </div>
              )}

              {/* Feedback Message */}
              <div className="bg-gray-700/50 p-3 rounded-lg">
                <label className="text-xs text-gray-400 block mb-2">
                  Feedback Message
                </label>
                <p className="text-white leading-relaxed bg-gray-600/30 p-3 rounded-lg text-sm">
                  {selectedFeedback.message}
                </p>
              </div>

              {/* Admin Notes */}
              <div className="bg-gray-700/50 p-3 rounded-lg">
                <label className="text-xs text-gray-400 block mb-2">
                  Admin Notes
                </label>
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full bg-gray-600/30 border border-gray-500 rounded-lg px-3 py-2 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 resize-none text-sm"
                  rows="3"
                  placeholder="Add internal notes here..."
                />
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() =>
                      updateFeedbackNotes(selectedFeedback._id, editNotes)
                    }
                    className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-3 py-2 rounded-lg transition-all duration-200 font-medium text-sm shadow-lg hover:shadow-xl"
                  >
                    Save Notes
                  </button>
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-3 py-2 rounded-lg transition-all duration-200 text-sm shadow-lg hover:shadow-xl"
                  >
                    Close
                  </button>
                </div>
              </div>

              {/* Timestamps */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="text-center bg-gray-700/30 p-2 rounded-lg">
                  <div className="text-gray-400 mb-1">Created</div>
                  <div className="text-white">
                    {new Date(selectedFeedback.createdAt).toLocaleDateString()}
                  </div>
                  <div className="text-gray-500">
                    {new Date(selectedFeedback.createdAt).toLocaleTimeString()}
                  </div>
                </div>
                <div className="text-center bg-gray-700/30 p-2 rounded-lg">
                  <div className="text-gray-400 mb-1">Last Updated</div>
                  <div className="text-white">
                    {new Date(selectedFeedback.updatedAt).toLocaleDateString()}
                  </div>
                  <div className="text-gray-500">
                    {new Date(selectedFeedback.updatedAt).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Delete Confirmation Modal - Fixed to cover entire screen including sidebar */}
      {showDeleteModal && feedbackToDelete && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4 fade-in">
          <div className="bg-gray-800/90 backdrop-blur-sm border border-gray-700 rounded-xl w-full max-w-sm">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500/20 rounded-lg">
                  <FaExclamationTriangle className="text-red-400 text-lg" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">
                    Delete Feedback
                  </h3>
                  <p className="text-sm text-gray-400">
                    This action cannot be undone
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              <div className="mb-4">
                <p className="text-gray-300 mb-3 text-sm">
                  Are you sure you want to delete this feedback?
                </p>
                <div className="bg-gray-700/50 p-3 rounded-lg border border-gray-600">
                  <p className="text-white text-sm line-clamp-3">
                    "{feedbackToDelete.message}"
                  </p>
                  {feedbackToDelete.userEmail && (
                    <p className="text-gray-400 text-xs mt-1">
                      From: {feedbackToDelete.userEmail}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={deleteFeedback}
                  disabled={deleteLoading}
                  className="flex-1 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 disabled:from-red-400 disabled:to-pink-400 text-white px-4 py-3 rounded-lg transition-all duration-200 font-medium disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm shadow-lg hover:shadow-xl"
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
                  className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 disabled:from-gray-500 disabled:to-gray-600 text-white px-4 py-3 rounded-lg transition-all duration-200 disabled:cursor-not-allowed text-sm shadow-lg hover:shadow-xl"
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
