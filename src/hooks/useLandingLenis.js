import { useEffect, useRef } from 'react';
import Lenis from 'lenis';

/**
 * Custom hook to initialize Lenis smooth scroll on a specific page.
 * It ensures the instance is cleaned up on unmount.
 */
export const useLandingLenis = () => {
    const lenisRef = useRef(null);
    const rafRef = useRef(null);

    useEffect(() => {
        // Initialize Lenis
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            direction: 'vertical',
            gestureDirection: 'vertical',
            smooth: true,
            mouseMultiplier: 1,
            smoothTouch: false,
            touchMultiplier: 2,
        });

        lenisRef.current = lenis;
        window.lenis = lenis; // Expose to window for scrollTo usage

        // RAF callback
        const raf = (time) => {
            lenis.raf(time);
            rafRef.current = requestAnimationFrame(raf);
        };

        rafRef.current = requestAnimationFrame(raf);

        // Cleanup function
        return () => {
            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current);
            }
            if (lenisRef.current) {
                lenisRef.current.destroy();
            }
            window.lenis = null;
            // Also clean up any potential classes added to html/body by Lenis
            document.documentElement.classList.remove('lenis', 'lenis-smooth', 'lenis-scrolling', 'lenis-stopped');
        };
    }, []);

    return lenisRef.current;
};

export default useLandingLenis;
