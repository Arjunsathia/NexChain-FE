import { useState, useEffect } from "react";

const getMatch = (query) =>
  typeof window !== "undefined" && window.matchMedia ? window.matchMedia(query).matches : false;

// Reads the real value on the first render, so layouts don't flash the wrong variant
const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(() => getMatch(query));

  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);
    const listener = () => setMatches(media.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [query]);

  return matches;
};

export default useMediaQuery;
