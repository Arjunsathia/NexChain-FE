// Shared display formatters. Components with deliberately different formats
// (CoinTable's T/B/M abbreviations, CoinDetails' small-price precision) keep their own.

/** "$1,234.50" (2 decimals by default) */
export const formatUSD = (value, { minimumFractionDigits = 2, maximumFractionDigits = 2 } = {}) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(value);

/** "1.2K", "3.45M" */
export const formatCompact = (value, maximumFractionDigits = 2) =>
  new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits }).format(value);

/** "5 min ago" / "3h ago" / "2d ago" from a unix timestamp in seconds */
export const formatTimeAgo = (unixSeconds) => {
  if (!unixSeconds) return "";
  const minutes = Math.floor((Date.now() - unixSeconds * 1000) / 60000);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};
