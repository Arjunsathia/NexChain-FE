import { useState, useEffect } from "react";

/**
 * Hook to delay rendering of heavy components until after page transition
 * @param {number} delay - Delay in ms (default 150ms to match transition time)
 * @returns {boolean} isReady
 */
const useTransitionDelay = (delay = 150, skip = false) => {
  const [isReady, setIsReady] = useState(skip);

  useEffect(() => {
    if (isReady) return;
    const timer = setTimeout(() => {
      setIsReady(true);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay, isReady]);

  return isReady;
};

export default useTransitionDelay;
