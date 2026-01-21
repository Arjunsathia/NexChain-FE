import React, { useState } from "react";
import { FaTimes, FaClock, FaEdit, FaTrash } from "react-icons/fa";
import { createPortal } from "react-dom";
import api from "@/api/axiosConfig";
import toast from "react-hot-toast";
import EditOrderModal from "./EditOrderModal";

const OpenOrdersModal = ({ isOpen, onClose, orders, livePrices, onRefresh, TC, isLight }) => {
    const [editingOrder, setEditingOrder] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const handleCancel = async (orderId) => {
        try {
            const res = await api.put(`/orders/cancel/${orderId}`);
            if (res.data.success) {
                toast.success("Order cancelled");
                onRefresh();
            }
        } catch {
            toast.error("Failed to cancel");
        }
    };

    // Auto-execute logic has been moved to the backend TradingEngine for security and consistency.
    // The frontend only handles manual cancellation and editing.

    if (!isOpen) return null;

    return createPortal(
        <>
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                <div
                    className="absolute inset-0"
                    onClick={onClose}
                />

                <div className={`relative w-full max-w-6xl max-h-[85vh] ${isLight ? 'bg-white' : 'bg-[#0B0E11]'} rounded-2xl shadow-2xl flex flex-col overflow-hidden border ${isLight ? 'border-gray-200' : 'border-gray-800'} animate-in slide-in-from-bottom-4 duration-300`}>
                    {/* Header */}
                    <div className={`p-4 sm:p-6 border-b ${isLight ? 'border-gray-100' : 'border-gray-800'} flex justify-between items-center bg-transparent`}>
                        <div className="flex items-center gap-3">
                            <div className={`p-2.5 rounded-xl ${isLight ? 'bg-amber-50 text-amber-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                <FaClock size={20} />
                            </div>
                            <div>
                                <h2 className={`text-xl font-bold ${TC.textPrimary}`}>Open Orders</h2>
                                <p className={`text-xs font-medium ${TC.textSecondary}`}>Manage your pending trades</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className={`p-2 rounded-xl hover:bg-gray-100/10 transition-colors ${TC.textSecondary}`}
                        >
                            <FaTimes size={18} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
                        {orders.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <div className={`p-6 rounded-3xl mb-4 ${isLight ? 'bg-gray-50' : 'bg-gray-800/20'}`}>
                                    <FaClock className="text-gray-400 opacity-20" size={60} />
                                </div>
                                <h3 className={`text-lg font-bold ${TC.textPrimary} mb-1`}>No Open Orders</h3>
                                <p className={`text-sm ${TC.textSecondary}`}>Your active limit and stop orders will appear here.</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4">
                                {/* Desktop Table View */}
                                <div className="hidden md:block overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className={`border-b ${isLight ? 'border-gray-100' : 'border-gray-800'} text-[10px] font-bold uppercase tracking-widest ${TC.textSecondary}`}>
                                                <th className="pb-4 pl-2">Asset</th>
                                                <th className="pb-4">Type</th>
                                                <th className="pb-4">Market Price</th>
                                                <th className="pb-4">
                                                    Trigger Price
                                                    <span className="ml-1 text-[9px] opacity-50 lowercase">(stop)</span>
                                                </th>
                                                <th className="pb-4">
                                                    Exec. Price
                                                    <span className="ml-1 text-[9px] opacity-50 lowercase">(limit)</span>
                                                </th>
                                                <th className="pb-4">Amount</th>
                                                <th className="pb-4 text-right">Order Value</th>
                                                <th className="pb-4 text-right pr-2">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className={`divide-y ${isLight ? 'divide-gray-50' : 'divide-gray-800/50'}`}>
                                            {orders.map((order) => (
                                                <tr key={order._id} className="group hover:bg-blue-500/5 transition-all">
                                                    <td className="py-4 pl-2">
                                                        <div className="flex items-center gap-3">
                                                            <img src={order.coin_image} alt="" className="w-8 h-8 rounded-full shadow-sm" />
                                                            <div className="flex flex-col">
                                                                <span className={`font-bold ${TC.textPrimary}`}>{order.coin_symbol.toUpperCase()}</span>
                                                                <span className={`text-[10px] ${TC.textSecondary}`}>{order.coin_name}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-4">
                                                        <div className="flex flex-col gap-1">
                                                            <div className="flex items-center gap-1.5">
                                                                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${order.type === 'buy' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                                                    {order.category.replace('_', ' ')} {order.type}
                                                                </span>
                                                                {order.oco_group_id && (
                                                                    <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20" title="One Cancels the Other">
                                                                        OCO
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {order.status === 'triggered' && (
                                                                <span className="px-2.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest bg-amber-500/10 text-amber-500 border border-amber-500/20 w-fit">
                                                                    Triggered
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className={`py-4 font-mono font-bold ${TC.textPrimary}`}>
                                                        {livePrices[order.coin_id]?.current_price ? (
                                                            <span className="text-blue-500 animate-pulse-slow">
                                                                ${livePrices[order.coin_id].current_price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                            </span>
                                                        ) : (
                                                            "..."
                                                        )}
                                                    </td>
                                                    <td className={`py-4 font-mono font-bold ${TC.textPrimary}`}>
                                                        {order.stop_price ? `$${order.stop_price.toLocaleString()}` : <span className="text-gray-500 text-xs font-sans font-medium">—</span>}
                                                    </td>
                                                    <td className={`py-4 font-mono font-bold ${TC.textPrimary}`}>
                                                        {order.limit_price ? (
                                                            `$${order.limit_price.toLocaleString()}`
                                                        ) : (
                                                            <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${isLight ? 'bg-gray-100 text-gray-500' : 'bg-white/10 text-gray-400'}`}>
                                                                MARKET PRICE
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className={`py-4 font-mono font-bold ${TC.textPrimary}`}>
                                                        {order.quantity}
                                                    </td>
                                                    <td className={`py-4 text-right font-mono font-bold ${TC.textPrimary}`}>
                                                        ${(order.total_value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </td>
                                                    <td className="py-4 text-right pr-2">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button
                                                                onClick={() => {
                                                                    setEditingOrder(order);
                                                                    setIsEditModalOpen(true);
                                                                }}
                                                                className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white transition-all duration-300"
                                                                title="Edit"
                                                            >
                                                                <FaEdit size={14} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleCancel(order._id)}
                                                                className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all duration-300"
                                                                title="Cancel"
                                                            >
                                                                <FaTrash size={14} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Mobile Card View */}
                                <div className="md:hidden flex flex-col gap-3">
                                    {orders.map((order) => (
                                        <div
                                            key={order._id}
                                            className={`p-4 rounded-2xl border ${isLight ? 'bg-gray-50/50 border-gray-100' : 'bg-gray-800/20 border-gray-800'} flex flex-col gap-4`}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-center gap-3">
                                                    <img src={order.coin_image} alt="" className="w-10 h-10 rounded-full" />
                                                    <div className="flex flex-col">
                                                        <span className={`font-bold text-lg ${TC.textPrimary}`}>{order.coin_symbol.toUpperCase()}</span>
                                                        <span className={`text-[10px] ${TC.textSecondary}`}>{order.coin_name}</span>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end gap-1">
                                                    <div className="flex items-center gap-1">
                                                        {order.oco_group_id && (
                                                            <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20">
                                                                OCO
                                                            </span>
                                                        )}
                                                        <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${order.type === 'buy' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                                            {order.category.replace('_', ' ')} {order.type}
                                                        </span>
                                                    </div>
                                                    {order.status === 'triggered' && (
                                                        <span className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                                            Triggered
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className={`grid grid-cols-3 gap-2 py-3 border-y ${isLight ? 'border-gray-100' : 'border-gray-800'}`}>
                                                <div className="flex flex-col gap-1">
                                                    <span className={`text-[10px] font-bold uppercase tracking-tighter ${TC.textSecondary}`}>Current Price</span>
                                                    <span className="text-sm font-mono font-bold text-blue-500">
                                                        {livePrices[order.coin_id]?.current_price ? `$${livePrices[order.coin_id].current_price.toLocaleString()}` : "..."}
                                                    </span>
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <span className={`text-[10px] font-bold uppercase tracking-tighter ${TC.textSecondary}`}>Trigger / Exec</span>
                                                    <div className={`text-sm font-mono font-bold ${TC.textPrimary} flex flex-col`}>
                                                        <span>{order.stop_price ? `$${order.stop_price.toLocaleString()}` : <span className="opacity-30">—</span>}</span>
                                                        <span className="text-[10px] opacity-70">
                                                            {order.limit_price ? `$${order.limit_price.toLocaleString()}` : "MARKET"}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col gap-1 text-right">
                                                    <span className={`text-[10px] font-bold uppercase tracking-tighter ${TC.textSecondary}`}>Value</span>
                                                    <span className={`text-sm font-mono font-bold ${TC.textPrimary}`}>
                                                        ${(order.total_value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between gap-3">
                                                <div className="flex flex-col">
                                                    <span className={`text-[10px] font-bold uppercase tracking-tighter ${TC.textSecondary}`}>Quantity</span>
                                                    <span className={`text-sm font-mono font-bold ${TC.textPrimary}`}>{order.quantity}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setEditingOrder(order);
                                                            setIsEditModalOpen(true);
                                                        }}
                                                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/10 text-blue-500 font-bold text-xs"
                                                    >
                                                        <FaEdit size={12} /> Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleCancel(order._id)}
                                                        className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500"
                                                    >
                                                        <FaTrash size={12} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <EditOrderModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                order={editingOrder}
                onOrderUpdated={onRefresh}
            />
        </>,
        document.body
    );
};

export default OpenOrdersModal;
