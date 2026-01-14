import React, { useState, useEffect, useRef } from "react";
import { motion, useAnimation, useMotionValue, useTransform } from "framer-motion";
import { FaChevronRight, FaCheck } from "react-icons/fa";

const SwipeButton = ({
    onSwipeComplete,
    text,
    isSubmitting,
    variant = "buy",
    total,
    disabled = false,
}) => {
    const [complete, setComplete] = useState(false);
    const containerRef = useRef(null);
    const x = useMotionValue(0);
    const controls = useAnimation();

    // Calculate swipe distance based on container width
    const [constraints, setConstraints] = useState({ left: 0, right: 0 });

    useEffect(() => {
        if (containerRef.current) {
            const containerWidth = containerRef.current.offsetWidth;
            const handleSize = 48; // Circle handle diameter
            setConstraints({ left: 0, right: containerWidth - handleSize - 8 }); // 8 for padding/offsets
        }
    }, []);

    // Visual transformations based on swipe progress
    const opacity = useTransform(x, [0, 100], [1, 0]);
    const totalOpacity = useTransform(x, [0, 50], [1, 0]);
    const progressWidth = useTransform(x, value => value + 48 + 4);

    const handleBgColor = variant === "buy" ? "#d1fae5" : "#fee2e2"; // emerald-100 : rose-100
    const handleActiveColor = variant === "buy" ? "#10b981" : "#f43f5e"; // emerald-500 : rose-500

    const handleBg = useTransform(
        x,
        [0, constraints.right],
        [handleBgColor, handleActiveColor]
    );

    const handleDragEnd = async (_, info) => {
        if (info.offset.x >= constraints.right * 0.85) {
            setComplete(true);
            x.set(constraints.right);
            // Don't snap back if we reached the end
            await controls.start({ x: constraints.right, transition: { type: "spring", stiffness: 300, damping: 30 } });
            onSwipeComplete();
        } else {
            controls.start({ x: 0, transition: { type: "spring", stiffness: 300, damping: 30 } });
        }
    };

    // Reset when isSubmitting becomes false (if not complete or after success)
    useEffect(() => {
        if (!isSubmitting && !complete) {
            x.set(0);
            controls.start({ x: 0 });
        }
    }, [isSubmitting, complete, controls, x]);

    // Handle external reset (e.g. on error)
    useEffect(() => {
        if (!isSubmitting && complete) {
            // After a small delay to show the checkmark, reset if the modal hasn't closed
            const timer = setTimeout(() => {
                setComplete(false);
                x.set(0);
                controls.start({ x: 0 });
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [isSubmitting, complete, controls, x]);

    const gradients = {
        buy: "from-emerald-500 to-emerald-700",
        sell: "from-rose-500 to-rose-700",
    };

    const trackBg = variant === "buy" ? "bg-emerald-500/5 dark:bg-emerald-500/10" : "bg-rose-500/5 dark:bg-rose-500/10";
    const textColor = variant === "buy" ? "text-emerald-800/40 dark:text-emerald-400/30" : "text-rose-800/40 dark:text-rose-400/30";

    return (
        <div className={`relative w-full h-14 select-none touch-none ${disabled ? "opacity-50 pointer-events-none" : ""}`}>
            <div
                ref={containerRef}
                className={`relative w-full h-full rounded-full p-1 flex items-center transition-all duration-300 ${trackBg} border ${variant === "buy" ? "border-emerald-500/20" : "border-rose-500/20"} overflow-hidden shadow-inner`}
            >
                {/* Background Text */}
                <motion.div
                    style={{ opacity }}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                >
                    <span className={`text-sm font-extrabold uppercase tracking-widest ${textColor}`}>
                        {text}
                    </span>
                </motion.div>

                {/* Dynamic Gradient Progress Bar */}
                <motion.div
                    className={`absolute left-0 top-0 bottom-0 bg-gradient-to-r ${gradients[variant]} rounded-full pointer-events-none`}
                    style={{ width: progressWidth }}
                />

                {/* The Sliding Handle */}
                <motion.div
                    drag="x"
                    dragConstraints={constraints}
                    dragElastic={0.05}
                    dragMomentum={false}
                    onDragEnd={handleDragEnd}
                    animate={controls}
                    style={{ x, backgroundColor: handleBg }}
                    className="z-10 w-12 h-12 rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing shadow-lg border border-black/5 transition-colors duration-200"
                >
                    {isSubmitting ? (
                        <div className={`w-5 h-5 border-2 rounded-full animate-spin ${variant === "buy" ? "border-emerald-800/30 border-t-emerald-800" : "border-rose-800/30 border-t-rose-800"}`} />
                    ) : complete ? (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 15 }}>
                            <FaCheck className="text-lg text-white" />
                        </motion.div>
                    ) : (
                        <motion.div
                            animate={{ x: [0, 5, 0] }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                        >
                            <FaChevronRight className={`text-lg ${variant === "buy" ? "text-emerald-600" : "text-rose-600"}`} />
                        </motion.div>
                    )}
                </motion.div>

                {/* Total Display */}
                {!complete && (
                    <motion.div
                        style={{ opacity: totalOpacity }}
                        className="absolute right-6 pointer-events-none"
                    >
                        <span className={`text-xs font-bold ${variant === "buy" ? "text-emerald-500/60" : "text-rose-500/60"}`}>
                            ${total}
                        </span>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default SwipeButton;
