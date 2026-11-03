// Flattens the coin page's two sources into one shape: the full /coins/:id
// document (description, links, every timeframe) and the cached /coins/markets
// row (always there first, survives CoinGecko rate limits).

const num = (v) => {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};
const pick = (...values) => {
  for (const v of values) {
    const n = num(v);
    if (n !== null) return n;
  }
  return null;
};

const safeUrl = (url) => (typeof url === "string" && /^https?:\/\//i.test(url.trim()) ? url.trim() : null);
const hostOf = (url) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};

/** CoinGecko descriptions are HTML with links; the page shows plain paragraphs */
const toParagraphs = (html) =>
  (html || "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .split(/\n{2,}|\r\n\r\n/)
    .map((p) => p.trim())
    .filter(Boolean);

const buildLinks = (links) => {
  if (!links) return [];
  const out = [];
  const add = (kind, label, url) => {
    const safe = safeUrl(url);
    if (safe && !out.some((l) => l.url === safe)) out.push({ kind, label, url: safe });
  };
  add("website", "Website", links.homepage?.find(Boolean));
  (links.blockchain_site || []).filter(Boolean).slice(0, 2).forEach((u) => add("explorer", hostOf(u), u));
  add("source", "Source code", links.repos_url?.github?.find(Boolean));
  add("whitepaper", "Whitepaper", links.whitepaper);
  add("forum", "Forum", links.official_forum_url?.find(Boolean));
  add("reddit", "Reddit", links.subreddit_url);
  if (links.twitter_screen_name) add("x", `@${links.twitter_screen_name}`, `https://x.com/${links.twitter_screen_name}`);
  return out;
};

/**
 * @param {object|null} full   CoinGecko /coins/:id response
 * @param {object|null} market Row from the top-100 markets list
 */
export function toCoinInfo(full, market) {
  if (!full && !market) return null;
  const md = full?.market_data || {};
  const usd = (field) => md[field]?.usd;

  const image =
    (typeof market?.image === "string" && market.image) ||
    full?.image?.large ||
    full?.image?.small ||
    (typeof full?.image === "string" ? full.image : null);

  return {
    id: full?.id || market?.id,
    name: full?.name || market?.name,
    symbol: (full?.symbol || market?.symbol || "").toLowerCase(),
    image,
    rank: pick(full?.market_cap_rank, market?.market_cap_rank),
    price: pick(market?.current_price, usd("current_price")),
    change24h: pick(md.price_change_percentage_24h, market?.price_change_percentage_24h),
    marketCap: pick(usd("market_cap"), market?.market_cap),
    fdv: pick(usd("fully_diluted_valuation"), market?.fully_diluted_valuation),
    volume: pick(usd("total_volume"), market?.total_volume),
    high24h: pick(usd("high_24h"), market?.high_24h),
    low24h: pick(usd("low_24h"), market?.low_24h),
    ath: pick(usd("ath"), market?.ath),
    athDate: md.ath_date?.usd || market?.ath_date || null,
    athChange: pick(md.ath_change_percentage?.usd, market?.ath_change_percentage),
    atl: pick(usd("atl"), market?.atl),
    atlDate: md.atl_date?.usd || market?.atl_date || null,
    atlChange: pick(md.atl_change_percentage?.usd, market?.atl_change_percentage),
    circulating: pick(md.circulating_supply, market?.circulating_supply),
    totalSupply: pick(md.total_supply, market?.total_supply),
    // 0 and null both mean "no cap" upstream
    maxSupply: pick(md.max_supply, market?.max_supply) || null,
    performance: [
      { label: "1h", value: pick(md.price_change_percentage_1h_in_currency?.usd, market?.price_change_percentage_1h_in_currency) },
      { label: "24h", value: pick(md.price_change_percentage_24h, market?.price_change_percentage_24h) },
      { label: "7d", value: pick(md.price_change_percentage_7d, market?.price_change_percentage_7d_in_currency) },
      { label: "30d", value: pick(md.price_change_percentage_30d) },
      { label: "60d", value: pick(md.price_change_percentage_60d) },
      { label: "1y", value: pick(md.price_change_percentage_1y) },
    ],
    description: toParagraphs(full?.description?.en),
    links: buildLinks(full?.links),
    categories: (full?.categories || []).filter(Boolean),
    genesisDate: full?.genesis_date || null,
    hashingAlgorithm: full?.hashing_algorithm || null,
    // The markets-list shape that TradeModal, alerts and the watchlist expect
    marketCoin: market || {
      id: full?.id,
      name: full?.name,
      symbol: full?.symbol,
      image,
      current_price: usd("current_price"),
      price_change_percentage_24h: md.price_change_percentage_24h,
      market_cap: usd("market_cap"),
      total_volume: usd("total_volume"),
      market_cap_rank: full?.market_cap_rank,
    },
  };
}
