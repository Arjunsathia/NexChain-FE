// Third-party links (news feeds) are only rendered if they're plain http(s);
// anything else, e.g. "javascript:", becomes a harmless "#".
export const safeUrl = (url) => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:" ? parsed.href : "#";
  } catch {
    return "#";
  }
};
