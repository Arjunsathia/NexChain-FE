import React, { useState } from "react";
import ReactDOM from "react-dom";
import { X, Send, Mail, MessageSquare } from "lucide-react";

import toast from "react-hot-toast";
import { postForm } from "@/api/axiosConfig";

const MessageUserModal = ({ isOpen, onClose, user, TC, isLight }) => {
  const [messageType, setMessageType] = useState("email"); // 'email' or 'internal'
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen || !user) return null;

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error("Message content is required");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        userId: user.id || user._id,
        type: messageType,
        subject: messageType === "email" ? subject : undefined,
        message,
      };

      await postForm("/users/contact-user", payload);

      toast.success(
        `${messageType === "email" ? "Email" : "Message"} sent successfully to ${user.name}`,
      );
      onClose();
      setSubject("");
      setMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
      // Error handling is already done in axiosConfig but we can show a specific toast if we want
      // postForm throws, so we catch it here.
      toast.error(error.response?.data?.error || "Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div
        className={`w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden ${TC.modalContent} animate-in zoom-in duration-300`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className={`px-6 py-4 border-b flex justify-between items-center ${isLight ? "border-gray-100" : "border-gray-800"}`}
        >
          <h3
            className={`text-lg font-bold flex items-center gap-2 ${TC.textPrimary}`}
          >
            <Send className="w-5 h-5 text-blue-500" />
            Contact User
          </h3>
          <button
            onClick={onClose}
            className={`p-2 rounded-full transition-colors ${isLight ? "hover:bg-gray-100 text-gray-500" : "hover:bg-white/10 text-gray-400"}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSend} className="p-6 space-y-4">
          {/* User Info Preview */}
          <div
            className={`flex items-center gap-3 p-3 rounded-xl border ${isLight ? "bg-gray-50 border-gray-200" : "bg-white/5 border-white/10"}`}
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
              {user.name.charAt(0)}
            </div>
            <div>
              <p className={`text-sm font-bold ${TC.textPrimary}`}>
                {user.name}
              </p>
              <p className={`text-xs ${TC.textSecondary}`}>{user.email}</p>
            </div>
          </div>

          {/* Type Selection */}
          <div className="flex bg-gray-100 dark:bg-black/20 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setMessageType("email")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${messageType === "email"
                  ? "bg-white text-blue-600 shadow-sm dark:bg-gray-800 dark:text-blue-400"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
                }`}
            >
              <Mail className="w-4 h-4" /> Email
            </button>
            <button
              type="button"
              onClick={() => setMessageType("internal")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${messageType === "internal"
                  ? "bg-white text-purple-600 shadow-sm dark:bg-gray-800 dark:text-purple-400"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
                }`}
            >
              <MessageSquare className="w-4 h-4" /> Internal Msg
            </button>
          </div>

          {/* Subject (Only for Email) */}
          {messageType === "email" && (
            <div className="space-y-1">
              <label
                className={`text-xs font-bold uppercase tracking-wider ${TC.textSecondary}`}
              >
                Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter email subject..."
                className={`w-full p-3 rounded-xl outline-none border transition-all text-sm ${isLight
                    ? "bg-white border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                    : "bg-gray-900/50 border-white/10 focus:border-blue-500 text-white"
                  }`}
              />
            </div>
          )}

          {/* Message Content */}
          <div className="space-y-1">
            <label
              className={`text-xs font-bold uppercase tracking-wider ${TC.textSecondary}`}
            >
              Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your message here..."
              rows={5}
              className={`w-full p-3 rounded-xl outline-none border resize-none transition-all text-sm ${isLight
                  ? "bg-white border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                  : "bg-gray-900/50 border-white/10 focus:border-blue-500 text-white"
                }`}
            ></textarea>
          </div>

          {/* Footer Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-colors ${isLight
                  ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  : "bg-white/5 text-gray-300 hover:bg-white/10"
                }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 py-2.5 rounded-xl font-bold text-sm text-white shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 ${loading
                  ? "bg-blue-600/50 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500"
                }`}
            >
              {loading ? (
                <>Sending...</>
              ) : (
                <>
                  <Send className="w-4 h-4" /> Send{" "}
                  {messageType === "email" ? "Email" : "Message"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
};

export default MessageUserModal;
