import { useCallback, useEffect, useState } from "react";

const KEY = "nexchain:guides-read";
const EVENT = "nexchain:guides-read";

const load = () => {
  try {
    return new Set(JSON.parse(localStorage.getItem(KEY) || "[]"));
  } catch {
    return new Set();
  }
};

/**
 * Guides this browser has finished. A per-device convenience: if storage is
 * unavailable, progress just isn't remembered.
 */
export default function useReadGuides() {
  const [read, setRead] = useState(load);

  // Keep every mounted instance (hub and article) in sync
  useEffect(() => {
    const sync = () => setRead(load());
    window.addEventListener(EVENT, sync);
    return () => window.removeEventListener(EVENT, sync);
  }, []);

  const markRead = useCallback((slug) => {
    const next = load();
    if (next.has(slug)) return;
    next.add(slug);
    try {
      localStorage.setItem(KEY, JSON.stringify([...next]));
    } catch {
      // storage unavailable
    }
    window.dispatchEvent(new Event(EVENT));
  }, []);

  return { read, markRead };
}
