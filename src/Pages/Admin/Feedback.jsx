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

  const TC = useMemo(
    () => ({
      textPrimary: isLight ? "text-gray-900" : "text-white",
      textSecondary: isLight ? "text-gray-500" : "text-gray-400",
      textTertiary: isLight ? "text-gray-400" : "text-gray-500",

      // Glassmorphism Cards - Synced with Admin Sidebar exact styling
      bgCard: isLight
        ? "bg-white/70 backdrop-blur-xl shadow-md border border-gray-100 glass-card"
        : "bg-gray-900/95 backdrop-blur-none shadow-none border border-gray-700/50",

      // Stat Cards - Match sidebar styling with hover effect
      bgStatsCard: isLight
        ? "bg-white/70 backdrop-blur-xl shadow-md border border-gray-100 glass-card hover:bg-white/80 hover:shadow-lg"
        : "bg-gray-900/95 backdrop-blur-none shadow-none border border-gray-700/50 hover:bg-gray-800/80",

      bgItem: isLight
        ? "bg-gray-50/50 hover:bg-gray-100/50 border border-gray-100 isolation-isolate"
        : "bg-transparent hover:bg-white/5 isolation-isolate",

      bgInput: isLight
        ? "bg-gray-100/50 border-gray-200 focus:bg-white focus:border-blue-500 shadow-inner"
        : "bg-white/5 border-white/5 focus:bg-white/10 focus:border-cyan-500 text-white placeholder-gray-500 shadow-inner",

      btnPrimary:
        "bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-95 text-sm font-bold",
      btnSecondary: isLight
        ? "bg-gray-100 text-gray-600 hover:bg-gray-200 p-2 sm:p-2.5 rounded-xl transition-all duration-300 shadow-sm hover:shadow-cyan-500/20"
        : "bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 p-2 sm:p-2.5 rounded-xl transition-all duration-300 shadow-sm hover:shadow-cyan-500/20",
      btnDanger:
        "bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-all duration-300 active:scale-95 text-sm font-bold",

      tableHead: isLight ? "bg-gray-100/80 text-gray-600" : "bg-white/5 text-gray-400",
      tableRow: isLight ? "hover:bg-gray-50 transition-colors" : "hover:bg-white/5 transition-colors",

      modalOverlay: "bg-black/40 backdrop-blur-sm",
      modalContent: isLight ? "bg-white" : "bg-[#0B0E11] border border-gray-800 glass-card",

      headerGradient: "from-blue-600 to-cyan-500",
    }),
    [isLight]
  );

  const [feedbacks, setFeedbacks] = useState([]);

  // Granular Loading States
  const [isFeedbacksLoading, setIsFeedbacksLoading] = useState(true);
  const [isStatsLoading, setIsStatsLoading] = useState(true);


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
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editNotes, setEditNotes] = useState("");


  useEffect(() => {
    fetchFeedbacks();
    fetchStats();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchFeedbacks = async () => {
    try {
      if (feedbacks.length === 0) setIsFeedbacksLoading(true);
      const data = await getData("/feedback");
      if (data && data.success) {
        setFeedbacks(data.data || []);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("❌ Error fetching feedbacks:", error);
      setFeedbacks([]);
    } finally {
      setIsFeedbacksLoading(false);
    }
  };

  const fetchStats = useCallback(async () => {
    try {
      if (!stats.total) setIsStatsLoading(true);
      const data = await getData("/feedback/stats");
      if (data && data.success) {
        setStats(data.data || {});
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
    } finally {
      setIsStatsLoading(false);
    }
  }, [feedbacks, stats.total]);

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

  const confirmDelete = (feedback) => {
    setFeedbackToDelete(feedback);
    setShowDeleteModal(true);
  };

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

  return (
    <>
      <div
        className={`flex-1 p-2 sm:p-4 lg:p-8 space-y-4 lg:space-y-6 min-h-screen ${TC.textPrimary} fade-in`}
        style={{ animationDelay: "0.1s" }}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
          <div>
            <h1 className={`text-2xl lg:text-3xl font-bold tracking-tight mb-1 ${TC.textPrimary}`}>
              Feedback <span className="bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">& Reports</span>
            </h1>
            <p className={`text-sm font-medium ${TC.textSecondary}`}>
              Manage user feedback and reports
            </p>
          </div>
          <div className="flex items-center gap-4 w-full sm:w-auto">
            {(isFeedbacksLoading || isStatsLoading) && (
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
              disabled={isFeedbacksLoading}
              className={`px-3 sm:px-4 py-2 rounded-xl font-medium text-xs sm:text-sm flex items-center gap-2 ${TC.btnPrimary} flex-1 sm:flex-initial justify-center disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <FaSync className={isFeedbacksLoading ? "animate-spin" : ""} /> Refresh
            </button>
          </div>
        </div>

        <div
          className="space-y-4 lg:space-y-6 fade-in"
          style={{ animationDelay: "0.2s" }}
        >
          {isStatsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className={`${TC.bgStatsCard || TC.bgCard} h-32 rounded-2xl animate-pulse bg-opacity-50`}
                />
              ))}
            </div>
          ) : (
            <FeedbackStats stats={stats} TC={TC} />
          )}

          <FeedbackFilters
            filters={filters}
            setFilters={setFilters}
            TC={TC}
            isLight={isLight}
          />

          {isFeedbacksLoading ? (
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
          ) : (
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
          )}
        </div>
      </div>

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

      <FeedbackDeleteModal
        showDeleteModal={showDeleteModal}
        setShowDeleteModal={setShowDeleteModal}
        TC={TC}
        isLight={isLight}
        deleteFeedback={deleteFeedback}
        deleteLoading={deleteLoading}
      />
    </>
  );
};

export default AdminFeedback;