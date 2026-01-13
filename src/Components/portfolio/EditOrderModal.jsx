import React, { useState, useEffect } from "react";
import { FaEdit, FaTimes, FaCheck } from "react-icons/fa";
import { createPortal } from "react-dom";
import api from "@/api/axiosConfig";
import toast from "react-hot-toast";
import useThemeCheck from "@/hooks/useThemeCheck";

const EditOrderModal = ({ isOpen, onClose, order, onOrderUpdated }) => {
    const isLight = useThemeCheck();
    const [limitPrice, setLimitPrice] = useState("");
    const [stopPrice, setStopPrice] = useState("");
    const [quantity, setQuantity] = useState("");
    const [usdAmount, setUsdAmount] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (order) {
            const lPrice = order.limit_price || "";
            const sPrice = order.stop_price || "";
            const qty = order.quantity || "";
            setLimitPrice(lPrice);
            setStopPrice(sPrice);
            setQuantity(qty);

            // Set initial USD amount
            const price = lPrice || sPrice || 0;
            if (price && qty) {
                setUsdAmount((price * qty).toFixed(2));
            }
        }
    }, [order]);

    const handlePriceChange = (value, type) => {
        if (type === 'limit') setLimitPrice(value);
        else setStopPrice(value);

        const price = parseFloat(value);
        if (price > 0 && quantity) {
            setUsdAmount((price * parseFloat(quantity)).toFixed(2));
        }
    };

    const handleQuantityChange = (value) => {
        setQuantity(value);
        const price = parseFloat(limitPrice || stopPrice || 0);
        if (price > 0 && value) {
            setUsdAmount((price * parseFloat(value)).toFixed(2));
        }
    };

    const handleUsdChange = (value) => {
        setUsdAmount(value);
        const price = parseFloat(limitPrice || stopPrice || 0);
        if (price > 0 && value) {
            setQuantity((parseFloat(value) / price).toFixed(8));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.put(`/orders/update/${order._id}`, {
                limit_price: limitPrice ? parseFloat(limitPrice) : undefined,
                stop_price: stopPrice ? parseFloat(stopPrice) : undefined,
                quantity: parseFloat(quantity),
            });

            if (res.data.success) {
                toast.success("Order updated successfully");
                onOrderUpdated();
                onClose();
            }
        } catch (error) {
            toast.error(error.response?.data?.error || "Failed to update order");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !order) return null;

    return createPortal(
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            <div className={`relative w-full max-w-md ${isLight ? 'bg-white' : 'bg-[#0B0E11]'} border ${isLight ? 'border-gray-200 shadow-xl' : 'border-gray-800 shadow-2xl'} rounded-2xl overflow-hidden animate-in fade-in zoom-in duration-200`}>
                <div className={`p-4 sm:p-6 border-b ${isLight ? 'border-gray-100 bg-gray-50/50' : 'border-gray-800 bg-gray-900/50'} flex items-center justify-between`}>
                    <h2 className={`text-lg sm:text-xl font-bold ${isLight ? 'text-gray-900' : 'text-white'} flex items-center gap-2`}>
                        <FaEdit className="text-blue-500" />
                        Edit Order ({order.coin_symbol.toUpperCase()})
                    </h2>
                    <button onClick={onClose} className={`${isLight ? 'text-gray-400 hover:text-gray-600' : 'text-gray-400 hover:text-white'} transition-colors`}>
                        <FaTimes size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5">
                    {order.category !== "market" && (
                        <div>
                            <label className={`block text-[10px] font-bold uppercase tracking-widest mb-2 px-1 ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                                {order.category.includes("stop") ? "Stop Price (USD)" : "Limit Price (USD)"}
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 font-mono text-sm">
                                    $
                                </div>
                                <input
                                    type="number"
                                    step="any"
                                    required
                                    className={`w-full ${isLight ? 'bg-gray-50 border-gray-200 text-gray-900 focus:bg-white' : 'bg-gray-950 border-gray-800 text-white focus:bg-black'} border rounded-xl pl-8 pr-4 py-3 sm:py-3.5 outline-none focus:border-blue-500 transition-all font-mono text-base sm:text-lg`}
                                    value={order.category.includes("stop") ? stopPrice : limitPrice}
                                    onChange={(e) => handlePriceChange(e.target.value, order.category.includes("stop") ? 'stop' : 'limit')}
                                />
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className={`block text-[10px] font-bold uppercase tracking-widest mb-2 px-1 ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                                Quantity
                            </label>
                            <input
                                type="number"
                                step="any"
                                required
                                className={`w-full ${isLight ? 'bg-gray-50 border-gray-200 text-gray-900 focus:bg-white' : 'bg-gray-950 border-gray-800 text-white focus:bg-black'} border rounded-xl px-4 py-3 sm:py-3.5 outline-none focus:border-blue-500 transition-all font-mono text-base sm:text-lg`}
                                value={quantity}
                                onChange={(e) => handleQuantityChange(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className={`block text-[10px] font-bold uppercase tracking-widest mb-2 px-1 ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                                Total (USD)
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 font-mono text-sm">
                                    $
                                </div>
                                <input
                                    type="number"
                                    step="any"
                                    required
                                    className={`w-full ${isLight ? 'bg-gray-50 border-gray-200 text-gray-900 focus:bg-white' : 'bg-gray-950 border-gray-800 text-white focus:bg-black'} border rounded-xl pl-8 pr-4 py-3 sm:py-3.5 outline-none focus:border-blue-500 transition-all font-mono text-base sm:text-lg`}
                                    value={usdAmount}
                                    onChange={(e) => handleUsdChange(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 sm:py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 group mt-2"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <FaCheck className="group-hover:scale-110 transition-transform" />
                                Update Order
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>,
        document.body
    );
};

export default EditOrderModal;
