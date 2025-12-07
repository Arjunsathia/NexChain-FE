import React from "react";
import {
  X,
  Shield,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  Ban,
  LineChart,
  Wallet,
  Coins,
  AlertTriangle,
} from "lucide-react";

function UserDetailsModal({ selectedUser, setSelectedUser, TC, isLight }) {
  if (!selectedUser) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${TC.modalOverlay}`}
    >
      {/* Apply fade-in animation to the modal content as well */}
      <div
        className={`w-full max-w-2xl rounded-2xl overflow-hidden ${TC.modalContent} animate-in fade-in zoom-in duration-300`}
      >
        {/* Modal Header */}
        <div
          className={`p-6 flex justify-between items-center bg-gradient-to-r from-cyan-500/10 to-blue-500/10`}
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 p-1 shadow-lg shadow-cyan-500/20">
              <div
                className={`w-full h-full rounded-full flex items-center justify-center text-2xl font-bold text-white overflow-hidden ${
                  isLight ? "bg-white/20" : "bg-black/40"
                }`}
              >
                {selectedUser.image ? (
                  <img 
                    src={selectedUser.image.startsWith('http') ? selectedUser.image : `http://localhost:5050/uploads/${selectedUser.image}`} 
                    alt={selectedUser.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  selectedUser.name?.charAt(0).toUpperCase()
                )}
              </div>
            </div>
            <div>
              <h2 className={`text-2xl font-bold ${TC.textPrimary}`}>
                {selectedUser.name}
              </h2>
              <p className="text-cyan-400 text-sm font-medium flex items-center gap-2">
                <Shield className="w-4 h-4" /> {selectedUser.role}
              </p>
            </div>
          </div>
          <button
            onClick={() => setSelectedUser(null)}
            className={`transition-all duration-200 p-1 rounded-lg hover:rotate-90 transform group ${
              isLight
                ? "text-gray-500 hover:text-red-600 hover:bg-red-100"
                : "text-gray-400 hover:text-white hover:bg-red-500/20"
            }`}
          >
            <X className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {/* Contact Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`p-4 rounded-xl ${TC.bgItem}`}>
              <p className={`text-xs uppercase mb-1 ${TC.textSecondary}`}>
                Email Address
              </p>
              <div
                className={`flex items-center gap-2 font-medium ${TC.textPrimary}`}
              >
                <Mail className="w-4 h-4 text-cyan-400" />
                {selectedUser.email}
              </div>
            </div>
            {/* Note: Mock data doesn't have a phone field, displaying placeholder */}
            <div className={`p-4 rounded-xl ${TC.bgItem}`}>
              <p className={`text-xs uppercase mb-1 ${TC.textSecondary}`}>
                Phone Number
              </p>
              <div
                className={`flex items-center gap-2 font-medium ${TC.textPrimary}`}
              >
                <Phone className="w-4 h-4 text-purple-400" />
                {selectedUser.phone || "Not provided"}
              </div>
            </div>
            <div className={`p-4 rounded-xl ${TC.bgItem}`}>
              <p className={`text-xs uppercase mb-1 ${TC.textSecondary}`}>
                Joined Date
              </p>
              <div
                className={`flex items-center gap-2 font-medium ${TC.textPrimary}`}
              >
                <Calendar className="w-4 h-4 text-blue-400" />
                {new Date(selectedUser.createdAt).toLocaleDateString()}
              </div>
            </div>
            <div className={`p-4 rounded-xl ${TC.bgItem}`}>
              <p className={`text-xs uppercase mb-1 ${TC.textSecondary}`}>
                Account Status
              </p>
              <div
                className={`flex items-center gap-2 font-medium ${
                  selectedUser.isActive ? "text-green-400" : "text-red-400"
                }`}
              >
                {selectedUser.isActive ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <Ban className="w-4 h-4" />
                )}
                {selectedUser.isActive ? "Active" : "Inactive"}
              </div>
            </div>
          </div>

          {/* Stats Overview */}
          <div>
            <h3
              className={`text-lg font-bold mb-4 flex items-center gap-2 ${TC.textPrimary}`}
            >
              <LineChart className="w-4 h-4 text-cyan-400" /> Investment
              Overview
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className={`p-4 rounded-xl text-center ${TC.bgItem}`}>
                <Wallet className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                <p className={`text-2xl font-bold ${TC.textPrimary}`}>$0</p>
                <p className={`text-xs ${TC.textSecondary}`}>Total Balance</p>
              </div>
              <div className={`p-4 rounded-xl text-center ${TC.bgItem}`}>
                <Coins className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                <p className={`text-2xl font-bold ${TC.textPrimary}`}>
                  {selectedUser.purchasedCoins?.length || 0}
                </p>
                <p className={`text-xs ${TC.textSecondary}`}>Coins Owned</p>
              </div>
              <div className={`p-4 rounded-xl text-center ${TC.bgItem}`}>
                <AlertTriangle className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                <p className={`text-2xl font-bold ${TC.textPrimary}`}>0</p>
                <p className={`text-xs ${TC.textSecondary}`}>Reports</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserDetailsModal;
