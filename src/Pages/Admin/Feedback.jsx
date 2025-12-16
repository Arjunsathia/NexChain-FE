import React, { useState, useEffect, useCallback, useMemo } from "react";
import { FaSync } from "react-icons/fa";
import { getData, updateById, deleteById } from "@/api/axiosConfig";
import FeedbackStats from "@/Components/Admin/Feedback/FeedbackStats";
import FeedbackFilters from "@/Components/Admin/Feedback/FeedbackFilters";
import FeedbackTable from "@/Components/Admin/Feedback/FeedbackTable";
import FeedbackDetailsModal from "@/Components/Admin/Feedback/FeedbackDetailsModal";
import FeedbackDeleteModal from "@/Components/Admin/Feedback/FeedbackDeleteModal";

import useThemeCheck from "@/hooks/useThemeCheck";

const AdminFeedback = () => {
  const isLight = useThemeCheck();

  // Premium Theme Classes - Matches User Dashboard
  const TC = useMemo(
    () => ({
      textPrimary: isLight ? "text-gray-900" : "text-white",
      textSecondary: isLight ? "text-gray-500" : "text-gray-400",
      textTertiary: isLight ? "text-gray-400" : "text-gray-500",

      bgCard: isLight
        ? "bg-white shadow-sm sm:shadow-[0_6px_25px_rgba(0,0,0,0.12)]"
        : "bg-gray-800/50 backdrop-blur-xl shadow-xl shadow-black/20",
      bgStatsCard: isLight
        ? "bg-white shadow-sm sm:shadow-[0_6px_25px_rgba(0,0,0,0.12)]"
        : "bg-gray-800/50 backdrop-blur-xl shadow-2xl hover:shadow-cyan-400/25",
      bgItem: isLight ? "bg-gray-50" : "bg-white/5",
      bgInput: isLight
        ? "bg-white text-gray-900 placeholder-gray-500 shadow-sm"
        : "bg-gray-900/50 text-white placeholder-gray-500 shadow-inner",

      btnPrimary:
        "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg hover:shadow-cyan-500/25 transition-all duration-300",
      btnSecondary: isLight
        ? "text-gray-600 hover:bg-gray-100"
        : "text-gray-300 hover:bg-gray-800/50 hover:text-white",
      btnDanger:
        "bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all duration-200",

      tableHead: isLight
        ? "bg-gray-100 text-gray-600"
        : "bg-gray-900/50 text-gray-400",
      tableRow: isLight ? "hover:bg-gray-50" : "hover:bg-white/5",

      modalOverlay: "bg-black/80 backdrop-blur-sm",
      modalContent: isLight
        ? "bg-white shadow-2xl"
        : "bg-[#0a0b14] shadow-2xl shadow-black/50",

      headerGradient: "from-cyan-400 to-blue-500",
    }),
    [isLight]
  );

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

  useEffect(() => {
    fetchFeedbacks();
    fetchStats();
  }, []);
  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      setContentLoaded(false);
      setError("");
      const data = await getData("/feedback");
      if (data && data.success) {
        setFeedbacks(data.data || []);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
       // ... existing error handling ...
      console.error("❌ Error fetching feedbacks:", error);
      setError(
        "Failed to load feedback data. Please check if backend is running."
      );
      setFeedbacks([]);
    } finally {
      setLoading(false);
      setTimeout(() => setContentLoaded(true), 300);
    }
  };

  const fetchStats = useCallback(async () => {
    try {
      const data = await getData("/feedback/stats");
      if (data && data.success) {
        setStats(data.data || {});
      }
    } catch (error) {
      // ... fallback logic ...
      console.error("❌ Error fetching stats:", error);
      // ... (keep fallback logic) ...
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
      const data = await updateById("/feedback", id, { status });
      if (data.success) {
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

  const updateFeedbackNotes = async (id, adminNotes) => {
    try {
      const data = await updateById("/feedback", id, { adminNotes });
      if (data.success) {
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

  // ... 

  const deleteFeedback = async () => {
    if (!feedbackToDelete) return;
    try {
      setDeleteLoading(true);
      const data = await deleteById("/feedback", feedbackToDelete._id);
      if (data.success) {
        setFeedbacks((prev) =>
          prev.filter((fb) => fb._id !== feedbackToDelete._id)
        );
        fetchStats();
        setShowDeleteModal(false);
        setFeedbackToDelete(null);
      }
    } catch (error) {
      console.error("❌ Error deleting feedback:", error);
      alert("❌ Error deleting feedback. Please try again.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredFeedbacks = feedbacks.filter((feedback) => {
    const matchesSearch =
      !filters.search ||
      feedback.message.toLowerCase().includes(filters.search.toLowerCase()) ||
      (feedback.userEmail &&
        feedback.userEmail.toLowerCase().includes(filters.search.toLowerCase()));
    const matchesStatus = !filters.status || feedback.status === filters.status;
    const matchesType = !filters.type || feedback.type === filters.type;
    const matchesPriority =
      !filters.priority || feedback.priority === filters.priority;
    return matchesSearch && matchesStatus && matchesType && matchesPriority;
  });

  // Loading Skeleton Component
  const FeedbackSkeleton = () => (
    <div className="space-y-6">
      {/* Stats Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className={`${TC.bgCard} h-32 rounded-2xl animate-pulse`}
          />
        ))}
      </div>

      {/* Filters Skeleton */}
      <div className={`${TC.bgCard} h-20 rounded-2xl animate-pulse`} />

      {/* Table Skeleton */}
      <div className={`${TC.bgCard} rounded-2xl overflow-hidden p-4`}>
        <div className="space-y-4">
          <div
            className={`h-10 w-full ${TC.tableHead} rounded animate-pulse`}
          />
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className={`h-16 w-full ${TC.bgItem} rounded-xl animate-pulse`}
            />
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div
      className={`flex-1 p-2 sm:p-4 lg:p-8 space-y-4 lg:space-y-6 min-h-screen ${TC.textPrimary}`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1
            className={`text-2xl sm:text-3xl font-bold bg-gradient-to-r ${TC.headerGradient} bg-clip-text text-transparent`}
          >
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
            onClick={() => {
              fetchFeedbacks();
              fetchStats();
            }}
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
            contentLoaded
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-4"
          }`}
        >
          {/* Stats Cards */}
          <FeedbackStats stats={stats} TC={TC} />

          {/* Filters */}
          <FeedbackFilters
            filters={filters}
            setFilters={setFilters}
            TC={TC}
            isLight={isLight}
          />

          {/* Feedback List */}
          <FeedbackTable
            filteredFeedbacks={filteredFeedbacks}
            TC={TC}
            isLight={isLight}
            updateFeedbackStatus={updateFeedbackStatus}
            setSelectedFeedback={setSelectedFeedback}
            setEditNotes={setEditNotes}
            setShowModal={setShowModal}
            confirmDelete={confirmDelete}
          />
        </div>
      )}

      {/* View Modal */}
      {showModal && (
        <FeedbackDetailsModal
          selectedFeedback={selectedFeedback}
          setShowModal={setShowModal}
          TC={TC}
          isLight={isLight}
          editNotes={editNotes}
          setEditNotes={setEditNotes}
          updateFeedbackNotes={updateFeedbackNotes}
        />
      )}

      {/* Delete Modal */}
      <FeedbackDeleteModal
        showDeleteModal={showDeleteModal}
        setShowDeleteModal={setShowDeleteModal}
        TC={TC}
        isLight={isLight}
        deleteFeedback={deleteFeedback}
      />
    </div>
  );
};

export default AdminFeedback;