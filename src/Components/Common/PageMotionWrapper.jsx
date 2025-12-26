// import React, { useEffect } from 'react';
// import { motion } from 'framer-motion';
// import { useLocation } from 'react-router-dom';
// import { useVisitedRoutes } from '@/context/VisitedRoutesContext';

// const containerVariants = {
//     hidden: { opacity: 0 },
//     visible: {
//         opacity: 1,
//         transition: {
//             // Fast and smooth
//             staggerChildren: 0.08,
//             delayChildren: 0.02,
//             duration: 0.3,
//             ease: [0.25, 0.1, 0.25, 1.0] // smooth formatting
//         }
//     }
// };

// const itemVariants = {
//     hidden: { opacity: 0, y: 12 }, // Subtle upward movement (12px)
//     visible: {
//         opacity: 1,
//         y: 0,
//         transition: {
//             duration: 0.4,
//             ease: [0.25, 0.1, 0.25, 1.0]
//         }
//     }
// };

// export default function PageMotionWrapper({ children, className = "w-full h-full" }) {
//     const location = useLocation();
//     const { isVisited, markVisited } = useVisitedRoutes();
//     const currentPath = location.pathname;

//     const hasVisited = isVisited(currentPath);

//     useEffect(() => {
//         // If not visited, mark it as visited after a short delay to ensure animation starts
//         // But conceptually we mark it "after first render".
//         if (!hasVisited) {
//             // Small timeout ensures the animation has a chance to mount/trigger before state change potentially causes re-render logic issues
//             // though strictly not necessary if logic is correct.
//             // We mark it visited effectively immediately so NEXT time it is just static.
//             markVisited(currentPath);
//         }
//     }, [currentPath, hasVisited, markVisited]);

//     // If already visited, render static div (instant render, no animation overhead)
//     if (hasVisited) {
//         return <div className={className}>{children}</div>;
//     }

//     // If first visit, animate
//     return (
//         <motion.div
//             variants={containerVariants}
//             initial="hidden"
//             animate="visible"
//             className={className}
//             // Ensure we don't re-animate on simple prop updates
//             key={currentPath}
//         >
//             {/* 
//          We treat the direct children as an 'item' to get the float-up effect.
//          If children are multiple elements (Fragments), this ensures they move together or we can wrap.
//          Wrapping in a motion.div item ensures the 'slide up' applies to the whole page content block.
//       */}
//             <motion.div variants={itemVariants} className="w-full h-full">
//                 {children}
//             </motion.div>
//         </motion.div>
//     );
// }
