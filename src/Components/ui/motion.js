import { useReducedMotion } from "framer-motion";

/** One motion for every sheet and drawer on phones (matches --ease-sheet in design-system.css) */
export const SHEET_EASE = [0.32, 0.72, 0, 1];
export const SHEET_IN = { duration: 0.3, ease: SHEET_EASE };
export const SHEET_OUT = { duration: 0.22, ease: SHEET_EASE };
export const BACKDROP = { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.2 } };

/**
 * Framer props for a sheet that slides in from an edge ("bottom" or "top").
 * With reduced motion turned on it fades instead.
 */
export function useSheetMotion(from = "bottom") {
  const reduce = useReducedMotion();
  if (reduce) return { initial: { opacity: 0 }, animate: { opacity: 1, transition: { duration: 0.15 } }, exit: { opacity: 0, transition: { duration: 0.15 } } };
  const off = from === "top" ? "-100%" : "100%";
  return { initial: { y: off }, animate: { y: 0, transition: SHEET_IN }, exit: { y: off, transition: SHEET_OUT } };
}
