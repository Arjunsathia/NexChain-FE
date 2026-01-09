import React, { createContext, useState, useCallback } from "react";

// eslint-disable-next-line react-refresh/only-export-components
export const VisitedRoutesContext = createContext();

export const VisitedRoutesProvider = ({ children }) => {
  const [visitedRoutes, setVisitedRoutes] = useState(() => new Set());

  const markVisited = useCallback((path) => {
    setVisitedRoutes((prev) => {
      if (prev.has(path)) return prev;
      const newSet = new Set(prev);
      newSet.add(path);
      return newSet;
    });
  }, []);

  const isVisited = useCallback(
    (path) => visitedRoutes.has(path),
    [visitedRoutes],
  );

  const value = {
    isVisited,
    markVisited,
    visitedRoutes,
  };

  return (
    <VisitedRoutesContext.Provider value={value}>
      {children}
    </VisitedRoutesContext.Provider>
  );
};
