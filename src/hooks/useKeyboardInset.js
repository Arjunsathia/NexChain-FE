import { useEffect, useState } from "react";

const NONE = { inset: 0, height: 0 };

/**
 * Phones: how much of the screen the on-screen keyboard covers, so a bottom
 * sheet can sit just above it (its submit button stays tappable while typing).
 * Uses the visual viewport, which shrinks when the keyboard opens on both iOS
 * and Android. Returns { inset: 0 } on larger screens, when inactive or when
 * the keyboard is closed.
 */
export default function useKeyboardInset(active) {
  const [state, setState] = useState(NONE);

  useEffect(() => {
    const vv = typeof window !== "undefined" ? window.visualViewport : null;
    if (!active || !vv || !window.matchMedia("(max-width: 639px)").matches) return undefined;

    const update = () => {
      const covered = Math.round(window.innerHeight - vv.height - vv.offsetTop);
      // Small differences are browser toolbars, not the keyboard
      setState(covered > 80 ? { inset: covered, height: Math.round(vv.height) } : NONE);
    };
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
      setState(NONE);
    };
  }, [active]);

  return state;
}
