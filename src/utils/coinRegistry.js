// CoinGecko id → Binance base symbol for the coins streamed from startup.
// Mirrors NexChain-backend/config/coins.js; the server re-derives symbols itself.
export const CORE_COINS = {
  bitcoin: "btc",
  ethereum: "eth",
  binancecoin: "bnb",
  ripple: "xrp",
  cardano: "ada",
  solana: "sol",
  dogecoin: "doge",
  polkadot: "dot",
  "polygon-ecosystem-token": "pol",
  litecoin: "ltc",
  chainlink: "link",
  stellar: "xlm",
  cosmos: "atom",
  "ethereum-classic": "etc",
  "bitcoin-cash": "bch",
  filecoin: "fil",
  "theta-token": "theta",
  vechain: "vet",
  tron: "trx",
  "avalanche-2": "avax",
  "shiba-inu": "shib",
  "the-open-network": "ton",
  "usd-coin": "usdc",
  arbitrum: "arb",
  optimism: "op",
  near: "near",
  aptos: "apt",
  sui: "sui",
  uniswap: "uni",
};

/**
 * Binance USDT pair for a coin, e.g. ("bitcoin") → "btcusdt". Coins outside the
 * core list fall back to their CoinGecko symbol. Tether has no USDT pair.
 * @param {string} coinId CoinGecko id
 * @param {string} [symbol] CoinGecko symbol, used when the id isn't in CORE_COINS
 */
export const getBinancePair = (coinId, symbol) => {
  const base = CORE_COINS[coinId] || (symbol ? String(symbol).toLowerCase() : null);
  if (!base || base === "usdt" || !/^[a-z0-9]{1,15}$/.test(base)) return null;
  return `${base}usdt`;
};
