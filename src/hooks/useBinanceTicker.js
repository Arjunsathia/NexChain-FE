import { useEffect, useRef, useState } from 'react';

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

export function useBinanceTicker(coins = [], throttleMs = 2000) {
  const [livePrices, setLivePrices] = useState({});
  const ws = useRef(null);
  const bufferRef = useRef({});

  useEffect(() => {
    if (!coins || coins.length === 0) return;

    // Create reverse map for this specific subset of coins to identify incoming messages
    // Note: This relies on the global symbolMap. If a coin isn't there, it won't get live updates.
    const activeSymbolToId = {};
    const streams = coins
      .map((coin) => {
        const id = coin.id || coin.coinId;
        const symbol = symbolMap[id];
        if (symbol) {
          activeSymbolToId[symbol] = id;
          return `${symbol}@ticker`;
        }
        return null;
      })
      .filter(Boolean)
      .join('/');

    if (!streams) return;

    ws.current = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams}`);

    ws.current.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.data && message.stream) {
          const symbol = message.stream.split('@')[0];
          const coinId = activeSymbolToId[symbol];

          if (coinId) {
            bufferRef.current[coinId] = {
              current_price: parseFloat(message.data.c),
              price_change_percentage_24h: parseFloat(message.data.P),
              price_change_24h: parseFloat(message.data.p),
              // Helper boolean often used
              isPositive: parseFloat(message.data.P) >= 0,
              // Some components use 'price' and 'change' properties
              price: parseFloat(message.data.c),
              change: parseFloat(message.data.P),
              // Volume data
              volume: parseFloat(message.data.v),
              quoteVolume: parseFloat(message.data.q),
              // derived total_volume (approx quote volume for USDT pairs)
              total_volume: parseFloat(message.data.q)
            };
          }
        }
      } catch (e) {
        console.error("WS Parse Error", e);
      }
    };

    const interval = setInterval(() => {
        if (Object.keys(bufferRef.current).length > 0) {
            setLivePrices(prev => ({ ...prev, ...bufferRef.current }));
            bufferRef.current = {};
        }
    }, throttleMs);

    return () => {
      clearInterval(interval);
      if (ws.current) ws.current.close();
    };
  }, [coins, throttleMs]);

  return livePrices;
}
