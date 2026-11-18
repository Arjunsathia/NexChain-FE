import { useEffect, useState } from "react";

const reducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/**
 * Fades `[data-reveal]` elements inside `rootRef` in once as they scroll into view.
 * Content stays visible if JavaScript, IntersectionObserver or motion is unavailable:
 * the root only gets `is-reveal-ready` (which hides pending items) once observing starts.
 */
export function useReveal(rootRef) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root || reducedMotion() || !("IntersectionObserver" in window)) return;
    const items = [...root.querySelectorAll("[data-reveal]")];
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("is-revealed");
        observer.unobserve(entry.target);
      }
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    // Anything already on screen shows immediately, without animating
    const fold = window.innerHeight;
    items.forEach((el) => {
      if (el.getBoundingClientRect().top < fold * 0.9) el.classList.add("is-revealed");
      else observer.observe(el);
    });
    root.classList.add("is-reveal-ready");
    return () => {
      observer.disconnect();
      root.classList.remove("is-reveal-ready");
    };
  }, [rootRef]);
}

/** Returns the id of the section currently in the middle of the viewport. */
export function useActiveSection(ids) {
  const [active, setActive] = useState(null);
  const key = ids.join(",");
  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    const sections = key.split(",").map((id) => document.getElementById(id)).filter(Boolean);
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) setActive(entry.target.id);
        else setActive((current) => (current === entry.target.id ? null : current));
      }
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [key]);
  return active;
}

/** True once the page has scrolled past `offset` pixels. */
export function useScrolled(offset = 8) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > offset);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [offset]);
  return scrolled;
}
