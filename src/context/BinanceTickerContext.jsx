import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

const BinanceTickerContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useBinanceTickerContext = () => {
  const context = useContext(BinanceTickerContext);
  if (!context) {
    throw new Error(
      "useBinanceTickerContext must be used within a BinanceTickerProvider",
    );
  }
  return context;
};

const symbolMap = {
  bitcoin: "btcusdt",
  ethereum: "ethusdt",
  binancecoin: "bnbusdt",
  ripple: "xrpusdt",
  cardano: "adausdt",
  solana: "solusdt",
  dogecoin: "dogeusdt",
  polkadot: "dotusdt",
  "matic-network": "maticusdt",
  litecoin: "ltcusdt",
  chainlink: "linkusdt",
  stellar: "xlmusdt",
  cosmos: "atomusdt",
  monero: "xmusdt",
  "ethereum-classic": "etcusdt",
  "bitcoin-cash": "bchusdt",
  filecoin: "filusdt",
  theta: "thetausdt",
  vechain: "vetusdt",
  tron: "trxusdt",
  avalanche: "avaxusdt",
  shiba: "shibusdt",
  toncoin: "tonusdt",
  "usd-coin": "usdcusdt",
  tether: "usdtusdt",
  arbitrum: "arbusdt",
  optimism: "opusdt",
  near: "nearusdt",
  aptos: "aptusdt",
  fantom: "ftmusdt",
};

export const BinanceTickerProvider = ({ children }) => {
  const [livePrices, setLivePrices] = useState({});
  const ws = useRef(null);
  const bufferRef = useRef({});

  useEffect(() => {
    let isMounted = true;
    let reconnectTimeout = null;

    const connect = () => {
      if (!isMounted) return;

      // Subscribe to a broad list of popular coins to ensure high cache hit rate
      const streams = Object.values(symbolMap)
        .map((s) => `${s}@ticker`)
        .join("/");

      ws.current = new WebSocket(
        `wss://stream.binance.com:9443/stream?streams=${streams}`,
      );

      ws.current.onmessage = (event) => {
        if (!isMounted) return;
        try {
          const message = JSON.parse(event.data);
          if (message.data && message.stream) {
            const symbol = message.stream.split("@")[0];
            // Find the ID for this symbol (reverse lookup)
            const coinId = Object.keys(symbolMap).find(
              (key) => symbolMap[key] === symbol,
            );

            if (coinId) {
              bufferRef.current[coinId] = {
                current_price: parseFloat(message.data.c),
                price_change_percentage_24h: parseFloat(message.data.P),
                price_change_24h: parseFloat(message.data.p),
                high_24h: parseFloat(message.data.h),
                low_24h: parseFloat(message.data.l),
                isPositive: parseFloat(message.data.P) >= 0,
                price: parseFloat(message.data.c),
                change: parseFloat(message.data.P),
                volume: parseFloat(message.data.v),
                quoteVolume: parseFloat(message.data.q),
                total_volume: parseFloat(message.data.q),
              };
            }
          }
        } catch (e) {
          console.error("WS Parse Error", e);
        }
      };

      ws.current.onclose = () => {
        if (isMounted) {
          reconnectTimeout = setTimeout(connect, 3000);
        }
      };

      ws.current.onerror = () => {
        if (ws.current) ws.current.close();
      };
    };

    connect();

    // Batch updates to every 1 seond to prevent React render thrashing
    const interval = setInterval(() => {
      if (isMounted && Object.keys(bufferRef.current).length > 0) {
        setLivePrices((prev) => ({ ...prev, ...bufferRef.current }));
        bufferRef.current = {};
      }
    }, 1000);

    return () => {
      isMounted = false;
      clearInterval(interval);
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (ws.current) {
        ws.current.onclose = null; // Prevent reconnection attempt during cleanup
        ws.current.close();
      }
    };
  }, []);

  return (
    <BinanceTickerContext.Provider value={livePrices}>
      {children}
    </BinanceTickerContext.Provider>
  );
};
