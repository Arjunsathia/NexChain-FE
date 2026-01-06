import React, { useLayoutEffect } from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import InteractiveGridPattern from '../Landing/Background';
import LenisScroll from '../Common/LenisScroll';

const AnimatedLayout = () => {
    const location = useLocation();

    // 1. Disable Browser Scroll Restoration to prevent glitchy jumps
    useLayoutEffect(() => {
        if ("scrollRestoration" in window.history) {
            window.history.scrollRestoration = "manual";
        }
    }, []);

    // 2. Index-based direction logic
    // / (Landing) = 0
    // /auth (Auth) = 1
    const getPageIndex = (pathname) => (pathname === '/auth' ? 1 : 0);
    const currentPage = getPageIndex(location.pathname);

    // 3. Cinematic "Mechanical" Spring Variants
    const variants = {
        enter: (direction) => ({
            x: direction > 0 ? '20%' : '-20%',
            opacity: 0,
            scale: 0.98,
            filter: 'blur(4px)',
        }),
        center: {
            x: 0,
            opacity: 1,
            scale: 1,
            filter: 'blur(0px)',
            transition: {
                type: "tween",
                ease: "circOut",
                duration: 0.25
            }
        },
        exit: (direction) => ({
            x: direction < 0 ? '20%' : '-20%',
            opacity: 0,
            scale: 0.98,
            filter: 'blur(4px)',
            transition: {
                type: "tween",
                ease: "circIn",
                duration: 0.15
            }
        })
    };

    return (
        <div className="relative min-h-screen w-full bg-[#02040a] overflow-x-hidden overflow-y-scroll">
            {/* GLOBAL LENIS SCROLL INSTANCE */}
            <LenisScroll />

            {/* 1. PERSISTENT BACKGROUND LAYER */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <InteractiveGridPattern />
                {/* Global Atmosphere Blobs */}
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[120px] opacity-20 bg-cyan-400" />
                <div className="absolute bottom-[10%] right-[-10%] w-[500px] h-[500px] rounded-full blur-[120px] opacity-20 bg-blue-500" />
            </div>

            {/* 2. PAGE TRANSITION CONTAINER */}
            <AnimatePresence
                mode="wait"
                custom={currentPage === 1 ? 1 : -1}
                initial={false}
                onExitComplete={() => window.scrollTo(0, 0)}
            >
                <motion.div
                    key={location.pathname}
                    custom={currentPage === 1 ? 1 : -1}
                    // Optimize rendering for performance
                    style={{ willChange: "transform, opacity, filter" }}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="w-full relative z-10"
                >
                    <Outlet />
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default AnimatedLayout;


