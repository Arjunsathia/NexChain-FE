import { useBinanceTickerContext } from '../context/BinanceTickerContext';

const symbolMap = {
  bitcoin: "btcusdt", ethereum: "ethusdt", binancecoin: "bnbusdt", ripple: "xrpusdt",
  cardano: "adausdt", solana: "solusdt", dogecoin: "dogeusdt", polkadot: "dotusdt",
  "matic-network": "maticusdt", litecoin: "ltcusdt", chainlink: "linkusdt",
  stellar: "xlmusdt", cosmos: "atomusdt", monero: "xmusdt", "ethereum-classic": "etcusdt",
  "bitcoin-cash": "bchusdt", filecoin: "filusdt", theta: "thetausdt", vechain: "vetusdt",
  tron: "trxusdt", avalanche: "avaxusdt", shiba: "shibusdt", toncoin: "tonusdt",
  "usd-coin": "usdcusdt"
};

export const coinToSymbol = (id) => symbolMap[id];

export function useBinanceTicker() {
  // Now simply returns the live global state
  // The 'coins' argument is technically not needed for fetching anymore, 
  // but we keep the signature compatible.
  const livePrices = useBinanceTickerContext();
  
  return livePrices;
}
