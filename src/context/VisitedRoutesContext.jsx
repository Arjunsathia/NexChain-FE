// import React, { createContext, useContext, useState, useEffect } from 'react';
// import { useLocation } from 'react-router-dom';

// const VisitedRoutesContext = createContext();

// export const useVisitedRoutes = () => {
//     const context = useContext(VisitedRoutesContext);
//     if (!context) {
//         throw new Error('useVisitedRoutes must be used within a VisitedRoutesProvider');
//     }
//     return context;
// };

// export const VisitedRoutesProvider = ({ children }) => {
//     const [visitedRoutes, setVisitedRoutes] = useState(() => {
//         // Initialize from sessionStorage to persist across reloads
//         try {
//             const stored = sessionStorage.getItem('nexchain_visited_routes');
//             return stored ? new Set(JSON.parse(stored)) : new Set();
//         } catch {
//             return new Set();
//         }
//     });

//     const location = useLocation();

//     const markVisited = (path) => {
//         setVisitedRoutes((prev) => {
//             if (prev.has(path)) return prev;
//             const newSet = new Set(prev);
//             newSet.add(path);
//             // Persist to session storage
//             try {
//                 sessionStorage.setItem('nexchain_visited_routes', JSON.stringify([...newSet]));
//             } catch (e) {
//                 console.warn('Failed to save visited routes to session storage', e);
//             }
//             return newSet;
//         });
//     };

//     const isVisited = (path) => visitedRoutes.has(path);

//     const value = {
//         isVisited,
//         markVisited,
//         visitedRoutes // exposed for debugging if needed
//     };

//     return (
//         <VisitedRoutesContext.Provider value={value}>
//             {children}
//         </VisitedRoutesContext.Provider>
//     );
// };
