import React from "react";
import { X, Wallet, FileText, Calendar, CheckCircle, Ban, Clock } from "lucide-react";

const UserStatDetailModal = ({ isOpen, onClose, statType, user, userDetails, TC, isLight }) => {
    if (!isOpen) return null;

    const renderContent = () => {
        switch (statType) {
            case "assets":
                return (
                    <div className="space-y-4">
                        <h4 className={`text-sm font-bold uppercase tracking-wider ${TC.textSecondary}`}>Asset Holdings</h4>
                        {userDetails.holdings && userDetails.holdings.length > 0 ? (
                            <div className={`overflow-hidden rounded-xl border ${isLight ? "border-gray-200" : "border-white/10"}`}>
                                <table className="w-full text-sm text-left">
                                    <thead className={isLight ? "bg-gray-50 text-gray-500" : "bg-white/5 text-gray-400"}>
                                        <tr>
                                            <th className="px-4 py-3 font-bold">Coin</th>
                                            <th className="px-4 py-3 font-bold text-right">Quantity</th>
                                            <th className="px-4 py-3 font-bold text-right">Tot. Invested</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                        {userDetails.holdings.map((asset, idx) => (
                                            <tr key={idx} className={isLight ? "hover:bg-gray-50" : "hover:bg-white/5"}>
                                                <td className={`px-4 py-3 ${TC.textPrimary}`}>
                                                    <div className="flex items-center gap-3">
                                                        {asset.image && <img src={asset.image} alt={asset.coinName} className="w-8 h-8 rounded-full bg-white/10 object-cover" />}
                                                        <div>
                                                            <p className="font-bold">{asset.coinName || "Unknown"}</p>
                                                            <p className={`text-[10px] uppercase ${TC.textSecondary}`}>{asset.coinSymbol || asset._id}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className={`px-4 py-3 text-right ${TC.textSecondary}`}>
                                                    {parseFloat(asset.totalQuantity || asset.quantity || 0).toFixed(6)}
                                                </td>
                                                <td className={`px-4 py-3 text-right font-bold ${TC.textPrimary}`}>
                                                    ${parseFloat(asset.totalInvested || asset.totalCost || 0).toFixed(2)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className={`p-8 text-center rounded-xl border border-dashed ${isLight ? "border-gray-200 bg-gray-50" : "border-white/10 bg-white/5"}`}>
                                <p className={TC.textSecondary}>No assets found in portfolio.</p>
                            </div>
                        )}
                    </div>
                );

            case "balance":
                return (
                    <div className="space-y-6 text-center py-8">
                        <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${isLight ? "bg-green-100 text-green-600" : "bg-green-500/20 text-green-500"}`}>
                            <Wallet className="w-10 h-10" />
                        </div>
                        <div>
                            <p className={`text-sm font-bold uppercase tracking-wider ${TC.textSecondary}`}>Total Balance</p>
                            <h2 className={`text-4xl font-black mt-2 ${TC.textPrimary}`}>
                                ${(userDetails.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </h2>
                        </div>
                    </div>
                );

            case "status":
                return (
                    <div className="space-y-6">
                        <div className={`p-4 rounded-xl border ${isLight ? "bg-gray-50 border-gray-200" : "bg-white/5 border-white/10"} flex items-center justify-between`}>
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-full ${user.recentlyActive ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}>
                                    {user.recentlyActive ? <CheckCircle className="w-6 h-6" /> : <Ban className="w-6 h-6" />}
                                </div>
                                <div>
                                    <p className={`text-sm font-bold ${TC.textPrimary}`}>Current Status</p>
                                    <p className={`text-xs ${TC.textSecondary}`}>{user.recentlyActive ? "Active User" : "Inactive User"}</p>
                                </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${user.recentlyActive ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}>
                                {user.recentlyActive ? "Active" : "Inactive"}
                            </span>
                        </div>

                        <div className={`p-4 rounded-xl border ${isLight ? "bg-white border-gray-200" : "bg-transparent border-white/10"}`}>
                            <h4 className={`text-sm font-bold mb-3 ${TC.textPrimary}`}>Activity Details</h4>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                    <span className={TC.textSecondary}>Last Login</span>
                                    <span className={`font-bold ${TC.textPrimary}`}>
                                        {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : "Never"}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className={TC.textSecondary}>Account Created</span>
                                    <span className={`font-bold ${TC.textPrimary}`}>
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case "joined":
                return (
                    <div className="space-y-6 text-center py-8">
                        <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${isLight ? "bg-blue-100 text-blue-600" : "bg-blue-500/20 text-blue-500"}`}>
                            <Calendar className="w-10 h-10" />
                        </div>
                        <div>
                            <p className={`text-sm font-bold uppercase tracking-wider ${TC.textSecondary}`}>Member Since</p>
                            <h2 className={`text-3xl font-black mt-2 ${TC.textPrimary}`}>
                                {new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                            </h2>
                            <p className={`mt-2 text-sm ${TC.textSecondary}`}>
                                <Clock className="w-3 h-3 inline mr-1" />
                                {new Date(user.createdAt).toLocaleTimeString()}
                            </p>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    const getTitle = () => {
        switch (statType) {
            case 'assets': return 'Portfolio Details';
            case 'balance': return 'Wallet Balance';
            case 'status': return 'Account Status';
            case 'joined': return 'Join Date';
            default: return 'Details';
        }
    }

    return (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
            <div
                className={`w-full max-w-md rounded-2xl shadow-2xl overflow-hidden ${TC.modalContent} scale-in-95 animate-in duration-200`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className={`px-6 py-4 border-b flex justify-between items-center ${isLight ? "border-gray-100" : "border-gray-800"}`}>
                    <h3 className={`text-lg font-bold ${TC.textPrimary}`}>
                        {getTitle()}
                    </h3>
                    <button
                        onClick={onClose}
                        className={`p-2 rounded-full transition-colors ${isLight ? "hover:bg-gray-100 text-gray-500" : "hover:bg-white/10 text-gray-400"}`}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default UserStatDetailModal;
