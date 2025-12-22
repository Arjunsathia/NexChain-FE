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
import { SERVER_URL } from "@/api/axiosConfig";

function UserDetailsModal({ selectedUser, setSelectedUser, TC, isLight }) {
  if (!selectedUser) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${TC.modalOverlay}`}
    >
      {}
      <div
        className={`w-[90vw] max-w-[340px] sm:max-w-lg rounded-xl overflow-hidden ${TC.modalContent} animate-in fade-in zoom-in duration-300`}
      >
        {}
        <div
          className={`p-4 flex justify-between items-center bg-gradient-to-r from-cyan-500/10 to-blue-500/10`}
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 p-0.5 shadow-lg shadow-cyan-500/20">
              <div
                className={`w-full h-full rounded-full flex items-center justify-center text-lg font-bold text-white overflow-hidden ${
                  isLight ? "bg-white/20" : "bg-black/40"
                }`}
              >
                {selectedUser.image ? (
                  <img 
                    src={selectedUser.image.startsWith('http') ? selectedUser.image : `${SERVER_URL}/uploads/${selectedUser.image}`} 
                    alt={selectedUser.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  selectedUser.name?.charAt(0).toUpperCase()
                )}
              </div>
            </div>
            <div>
              <h2 className={`text-lg font-bold ${TC.textPrimary}`}>
                {selectedUser.name}
              </h2>
              <p className="text-cyan-400 text-xs font-medium flex items-center gap-1.5">
                <Shield className="w-3 h-3" /> {selectedUser.role}
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
            <X className="w-4 h-4 group-hover:scale-110 transition-transform" />
          </button>
        </div>

        {}
        <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {}
          <div className="grid grid-cols-1 gap-2">
            <div className={`p-3 rounded-lg flex items-center justify-between ${TC.bgItem}`}>
              <div className="flex items-center gap-3 overflow-hidden">
                <div className={`p-2 rounded-full bg-cyan-500/10`}>
                   <Mail className="w-3.5 h-3.5 text-cyan-400" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className={`text-[10px] uppercase tracking-wider ${TC.textSecondary}`}>Email</span>
                  <span className={`text-xs font-medium truncate ${TC.textPrimary}`}>{selectedUser.email}</span>
                </div>
              </div>
            </div>

            <div className={`p-3 rounded-lg flex items-center justify-between ${TC.bgItem}`}>
               <div className="flex items-center gap-3">
                 <div className={`p-2 rounded-full bg-purple-500/10`}>
                   <Phone className="w-3.5 h-3.5 text-purple-400" />
                 </div>
                 <div className="flex flex-col">
                   <span className={`text-[10px] uppercase tracking-wider ${TC.textSecondary}`}>Phone</span>
                   <span className={`text-xs font-medium ${TC.textPrimary}`}>{selectedUser.phone || "Not provided"}</span>
                 </div>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
                <div className={`p-3 rounded-lg ${TC.bgItem}`}>
                   <p className={`text-[10px] uppercase mb-1 ${TC.textSecondary}`}>Joined Date</p>
                   <div className={`flex items-center gap-1.5 font-medium text-xs ${TC.textPrimary}`}>
                     <Calendar className="w-3 h-3 text-blue-400" />
                     {new Date(selectedUser.createdAt).toLocaleDateString()}
                   </div>
                </div>
                <div className={`p-3 rounded-lg ${TC.bgItem}`}>
                   <p className={`text-[10px] uppercase mb-1 ${TC.textSecondary}`}>Status</p>
                   <div className={`flex items-center gap-1.5 font-medium text-xs ${selectedUser.isActive ? "text-green-400" : "text-red-400"}`}>
                     {selectedUser.isActive ? <CheckCircle className="w-3 h-3" /> : <Ban className="w-3 h-3" />}
                     {selectedUser.isActive ? "Active" : "Inactive"}
                   </div>
                </div>
            </div>
          </div>

          {}
          <div>
            <h3 className={`text-sm font-bold mb-3 flex items-center gap-1.5 ${TC.textPrimary}`}>
              <LineChart className="w-3.5 h-3.5 text-cyan-400" /> Investment Overview
            </h3>
            <div className="grid grid-cols-3 gap-2">
              <div className={`p-3 rounded-lg text-center ${TC.bgItem}`}>
                <Wallet className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
                <p className={`text-lg font-bold ${TC.textPrimary}`}>$0</p>
                <p className={`text-[10px] ${TC.textSecondary}`}>Balance</p>
              </div>
              <div className={`p-3 rounded-lg text-center ${TC.bgItem}`}>
                <Coins className="w-5 h-5 text-purple-400 mx-auto mb-1" />
                <p className={`text-lg font-bold ${TC.textPrimary}`}>
                  {selectedUser.purchasedCoins?.length || 0}
                </p>
                <p className={`text-[10px] ${TC.textSecondary}`}>Coins</p>
              </div>
              <div className={`p-3 rounded-lg text-center ${TC.bgItem}`}>
                <AlertTriangle className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
                <p className={`text-lg font-bold ${TC.textPrimary}`}>0</p>
                <p className={`text-[10px] ${TC.textSecondary}`}>Reports</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserDetailsModal;
