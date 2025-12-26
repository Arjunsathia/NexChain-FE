import React, { useMemo, useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useThemeCheck from "@/hooks/useThemeCheck";
import {
    FaSearch,
    FaHeadset,
    FaQuestionCircle,
    FaTicketAlt,
    FaChevronDown,
    FaEnvelope,
    FaShieldAlt,
    FaCreditCard,
    FaUserCog,
    FaCode,
    FaPaperPlane,
    FaPaperclip
} from "react-icons/fa";

const SupportCategory = ({ icon: Icon, title, description, TC, color, onClick }) => (
    <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={onClick}
        className={`${TC.bgCard} p-5 rounded-2xl transition-all text-left w-full h-full group relative overflow-hidden`}
    >
        {/* Decorative Background Gradient */}
        <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br ${color} opacity-5 blur-2xl group-hover:opacity-10 transition-opacity duration-300`} />

        <div className={`p-3 rounded-xl mb-4 w-fit bg-gradient-to-br ${color} shadow-lg shadow-black/5 relative z-10 group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="text-xl text-white" />
        </div>

        <div className="relative z-10">
            <h3 className={`font-bold text-lg mb-2 ${TC.textPrimary} group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors`}>{title}</h3>
            <p className={`text-sm leading-relaxed ${TC.textSecondary}`}>{description}</p>
        </div>
    </motion.button>
);

const FAQItem = ({ question, answer, isOpen, onClick, TC }) => (
    <div className={`border-b last:border-0 ${TC.borderColor}`}>
        <button
            onClick={onClick}
            className="w-full py-4 flex items-center justify-between gap-4 text-left focus:outline-none group"
        >
            <span className={`font-semibold ${TC.textPrimary} group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors`}>{question}</span>
            <FaChevronDown
                className={`${TC.textSecondary} transition-transform duration-300 ${isOpen ? "rotate-180 text-cyan-500" : ""}`}
            />
        </button>
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                >
                    <p className={`pb-4 text-sm leading-relaxed ${TC.textSecondary}`}>
                        {answer}
                    </p>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
);

const LiveChatWindow = ({ TC, isLight }) => {
    const [messages, setMessages] = useState([
        { id: 1, text: "Hello! I'm your NexChain Assistant. How can I help you today?", isBot: true, time: new Date() }
    ]);
    const [input, setInput] = useState("");
    const messagesContainerRef = useRef(null);

    const scrollToBottom = () => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = { id: Date.now(), text: input, isBot: false, time: new Date() };
        setMessages(prev => [...prev, userMsg]);
        setInput("");

        // Simulate bot typing/reply
        setTimeout(() => {
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                text: "Thanks for reaching out! A support agent will join this chat shortly to assist you further.",
                isBot: true,
                time: new Date()
            }]);
        }, 1500);
    };

    return (
        <div className={`${TC.bgCard} p-6 rounded-2xl h-[600px] flex flex-col`}>
            {/* Header */}
            <div className="mb-4 shrink-0 flex items-center gap-4 border-b pb-4 border-dashed" style={{ borderColor: isLight ? '#e5e7eb' : 'rgba(255,255,255,0.1)' }}>
                <div className="p-3 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 text-white shadow-lg shadow-green-500/20">
                    <FaHeadset className="text-xl" />
                </div>
                <div>
                    <h2 className={`text-lg font-bold ${TC.textPrimary}`}>Live Chat Support</h2>
                    <div className="flex items-center gap-2 mt-0.5">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        <p className={`text-xs ${TC.textSecondary}`}>Online • Typical reply: 2m</p>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 custom-scrollbar"
            >
                {messages.map(msg => (
                    <div key={msg.id} className={`flex flex-col ${msg.isBot ? 'items-start' : 'items-end'}`}>
                        <div className={`max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.isBot
                            ? (isLight ? 'bg-gray-100 text-gray-800' : 'bg-gray-700/50 text-white border border-white/5')
                            : 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-green-500/20'
                            }`}>
                            {msg.text}
                        </div>
                        <span className={`text-[10px] mt-1 px-1 ${TC.textSecondary}`}>
                            {msg.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                ))}
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="relative mt-auto shrink-0">
                <input
                    className={`w-full ${isLight ? "bg-gray-50 border-gray-200" : "bg-black/20 border-white/10"} border rounded-xl pl-4 pr-12 py-3.5 text-sm ${TC.textPrimary} outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 transition-all placeholder:text-gray-400`}
                    placeholder="Type your message..."
                    value={input}
                    onChange={e => setInput(e.target.value)}
                />
                <button
                    type="submit"
                    disabled={!input.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg text-green-500 hover:bg-green-50 dark:hover:bg-green-500/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <FaPaperPlane />
                </button>
            </form>
        </div>
    );
};

const TicketForm = ({ TC, isLight }) => {
    const [fileName, setFileName] = useState("");

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFileName(e.target.files[0].name);
        }
    };

    return (
        <div className={`${TC.bgCard} p-6 rounded-2xl h-[600px] flex flex-col`}>
            <div className="mb-6 shrink-0 flex items-center gap-4 border-b pb-4 border-dashed" style={{ borderColor: isLight ? '#e5e7eb' : 'rgba(255,255,255,0.1)' }}>
                <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 text-white shadow-lg shadow-cyan-500/20">
                    <FaTicketAlt className="text-xl" />
                </div>
                <div>
                    <h2 className={`text-lg font-bold ${TC.textPrimary}`}>Open a Ticket</h2>
                    <p className={`text-xs ${TC.textSecondary} mt-0.5`}>Complex issue? We usually respond within 2 hrs.</p>
                </div>
            </div>

            <form className="space-y-4 flex-1 flex flex-col">
                <div>
                    <label className={`block text-[10px] font-bold uppercase tracking-wider ${TC.textSecondary} mb-1.5`}>Subject</label>
                    <input
                        type="text"
                        className={`w-full ${isLight ? "bg-gray-50 border-gray-200" : "bg-black/20 border-white/10"} border rounded-xl px-4 py-3 text-sm ${TC.textPrimary} outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder:text-gray-400`}
                        placeholder="Brief description of issue"
                    />
                </div>
                <div className="flex-1">
                    <label className={`block text-[10px] font-bold uppercase tracking-wider ${TC.textSecondary} mb-1.5`}>Message</label>
                    <textarea
                        className={`w-full h-[calc(100%-25px)] ${isLight ? "bg-gray-50 border-gray-200" : "bg-black/20 border-white/10"} border rounded-xl px-4 py-3 text-sm ${TC.textPrimary} outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all resize-none placeholder:text-gray-400`}
                        placeholder="Tell us what happened..."
                    ></textarea>
                </div>

                <div>
                    <label className={`block text-[10px] font-bold uppercase tracking-wider ${TC.textSecondary} mb-1.5`}>
                        Screenshot (Optional)
                    </label>
                    <div className="relative">
                        <input
                            type="file"
                            id="file-upload"
                            className="hidden"
                            onChange={handleFileChange}
                            accept="image/*"
                        />
                        <label
                            htmlFor="file-upload"
                            className={`w-full flex items-center gap-2 cursor-pointer ${isLight ? "bg-gray-50 border-gray-200 hover:bg-gray-100" : "bg-black/20 border-white/10 hover:bg-white/5"} border border-dashed rounded-xl px-4 py-3 text-sm ${TC.textSecondary} transition-all`}
                        >
                            <FaPaperclip className="text-cyan-500" />
                            <span className="truncate">{fileName || "Click to attach an image"}</span>
                        </label>
                    </div>
                </div>

                <button
                    type="button"
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-bold text-white text-sm shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all shrink-0"
                >
                    Submit Ticket
                </button>
            </form>
        </div>
    );
};

export default function Support() {
    const isLight = useThemeCheck();
    const [activeSection, setActiveSection] = useState("ticket"); // 'ticket' or 'chat'
    const [searchQuery, setSearchQuery] = useState("");
    const [openFaqIndex, setOpenFaqIndex] = useState(null);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        //  Short delay to trigger the fade-in animation nicely after mount
        const timer = setTimeout(() => setIsMounted(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const TC = useMemo(() => ({
        textPrimary: isLight ? "text-gray-900" : "text-white",
        textSecondary: isLight ? "text-gray-500" : "text-gray-400",
        textTertiary: isLight ? "text-gray-400" : "text-gray-500",
        borderColor: isLight ? "border-gray-100" : "border-gray-800",

        bgCard: isLight
            ? "bg-white/80 backdrop-blur-xl shadow-md border border-white/40"
            : "bg-gray-900/95 backdrop-blur-none shadow-none border border-gray-700/50",

        inputBg: isLight
            ? "bg-white shadow-sm border-none focus:ring-2 focus:ring-blue-500/20"
            : "bg-gray-800/50 border-none shadow-inner focus:shadow-cyan-500/10",

    }), [isLight]);

    const categories = [
        { icon: FaUserCog, title: "Account & Login", description: "Issues with 2FA, password reset, or profile settings.", color: "from-blue-500 to-cyan-400" },
        { icon: FaCreditCard, title: "Payments & Billing", description: "Deposit/Withdrawal failures, transaction history, or fees.", color: "from-purple-500 to-pink-500" },
        { icon: FaShieldAlt, title: "Security & Fraud", description: "Report suspicious activity or lock your account instantly.", color: "from-red-500 to-orange-500" },
        { icon: FaCode, title: "API & Technical", description: "Integration help, API keys, and connection issues.", color: "from-amber-500 to-yellow-500" }
    ];

    const faqs = [
        { q: "How do I verify my identity (KYC)?", a: "Go to Settings > Verification. Upload your ID document and a selfie. Verification typically takes 5-10 minutes." },
        { q: "My deposit hasn't arrived yet.", a: "Crypto deposits require network confirmations. Bitcoin takes ~1 hour, while others like Solana are faster. Check the status in your Transaction History." },
        { q: "How can I reset my 2FA?", a: "If you lost your authenticator app, please contact support with your backup codes or identity proof to initiate a reset." },
        { q: "Are there withdrawal limits?", a: "Yes, unverified accounts are limited to $2,000/day. Verified accounts can withdraw up to $100,000/day." },
    ];

    return (
        <div className="w-full max-w-7xl mx-auto p-2 sm:p-4 lg:p-6 space-y-6">
            <div
                className={`transition-all duration-300 ease-out ${isMounted
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-2'
                    }`}
            >

                {/* Header Section Matches Dashboard */}
                <header className="mb-6 py-2 px-2">
                    <h1 className={`text-2xl lg:text-3xl font-bold tracking-tight mb-1 ${TC.textPrimary}`}>
                        Support Center
                    </h1>
                    <p className={`text-sm font-medium ${TC.textSecondary}`}>
                        Get assistance with your account, transactions, and technical issues.
                    </p>
                </header>

                {/* Search Bar */}
                <div className="relative mb-6">
                    <FaSearch className={`absolute left-5 top-1/2 -translate-y-1/2 ${TC.textSecondary}`} />
                    <input
                        type="text"
                        placeholder="Search for questions or topics..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={`
            w-full pl-12 pr-6 py-4 rounded-2xl text-base outline-none transition-all border
            ${TC.bgCard} ${TC.textPrimary} focus:shadow-md
          `}
                    />
                </div>

                {/* Categories Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {categories.map((cat, idx) => (
                        <SupportCategory key={idx} {...cat} TC={TC} onClick={() => setActiveSection("ticket")} />
                    ))}
                </div>

                <div className="grid lg:grid-cols-3 gap-6">

                    {/* Left Column: FAQ & Contact */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* FAQ Section */}
                        <div className={`${TC.bgCard} p-6 rounded-2xl`}>
                            <h2 className={`text-xl font-bold mb-4 flex items-center gap-2 ${TC.textPrimary}`}>
                                <FaQuestionCircle className="text-cyan-500" /> Frequently Asked Questions
                            </h2>
                            <div className="space-y-1">
                                {faqs.map((item, idx) => (
                                    <FAQItem
                                        key={idx}
                                        question={item.q}
                                        answer={item.a}
                                        isOpen={openFaqIndex === idx}
                                        onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                                        TC={TC}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Quick Contact */}
                        <div className="grid sm:grid-cols-2 gap-4">
                            <button
                                onClick={() => setActiveSection("ticket")}
                                className={`w-full ${TC.bgCard} text-left p-5 rounded-2xl flex items-center gap-4 group cursor-pointer border border-transparent hover:border-blue-500/20 transition-all ${activeSection === 'ticket' ? 'ring-2 ring-blue-500/50' : ''}`}
                            >
                                <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-500 flex items-center justify-center text-xl group-hover:scale-110 transition-transform shadow-sm">
                                    <FaEnvelope />
                                </div>
                                <div>
                                    <h4 className={`font-bold text-sm ${TC.textPrimary} group-hover:text-blue-500 transition-colors`}>Email Support</h4>
                                    <p className={`text-xs ${TC.textSecondary} mt-0.5`}>support@nexchain.com</p>
                                </div>
                            </button>

                            <button
                                onClick={() => setActiveSection("chat")}
                                className={`w-full ${TC.bgCard} text-left p-5 rounded-2xl flex items-center gap-4 group cursor-pointer border border-transparent hover:border-green-500/20 transition-all ${activeSection === 'chat' ? 'ring-2 ring-green-500/50' : ''}`}
                            >
                                <div className="w-12 h-12 rounded-xl bg-green-50 dark:bg-green-500/10 text-green-500 flex items-center justify-center text-xl group-hover:scale-110 transition-transform shadow-sm">
                                    <FaHeadset />
                                </div>
                                <div>
                                    <h4 className={`font-bold text-sm ${TC.textPrimary} group-hover:text-green-500 transition-colors`}>Live Chat</h4>
                                    <p className={`text-xs ${TC.textSecondary} mt-0.5`}>Available 24/7</p>
                                </div>
                            </button>
                        </div>

                    </div>

                    {/* Right Column: Ticket Form OR Live Chat */}
                    <div className="lg:col-span-1 h-full">
                        <AnimatePresence mode="wait">
                            {activeSection === "chat" ? (
                                <motion.div
                                    key="chat"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.2 }}
                                    className="h-full w-full"
                                >
                                    <LiveChatWindow TC={TC} isLight={isLight} />
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="ticket"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.2 }}
                                    className="h-full w-full"
                                >
                                    <TicketForm TC={TC} isLight={isLight} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                </div>
            </div>
        </div>
    );
}
