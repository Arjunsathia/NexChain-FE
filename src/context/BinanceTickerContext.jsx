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
    let wsInstance = null;
    let updateInterval = null;

    const connect = () => {
      if (!isMounted) return;

      const streams = Object.values(symbolMap)
        .map((s) => `${s}@ticker`)
        .join("/");

      wsInstance = new WebSocket(
        `wss://stream.binance.com:9443/stream?streams=${streams}`,
      );
      ws.current = wsInstance;

      wsInstance.onmessage = (event) => {
        if (!isMounted) return;
        try {
          const message = JSON.parse(event.data);
          if (message.data && message.stream) {
            const symbol = message.stream.split("@")[0];
            const coinId = Object.keys(symbolMap).find(
              (key) => symbolMap[key] === symbol,
            );

            if (coinId) {
              const data = message.data;
              // Direct assignment to buffer to avoid object creation overhead
              bufferRef.current[coinId] = {
                current_price: parseFloat(data.c),
                price_change_percentage_24h: parseFloat(data.P),
                price_change_24h: parseFloat(data.p),
                high_24h: parseFloat(data.h),
                low_24h: parseFloat(data.l),
                isPositive: parseFloat(data.P) >= 0,
                price: parseFloat(data.c),
                change: parseFloat(data.P),
                volume: parseFloat(data.v),
                quoteVolume: parseFloat(data.q),
                total_volume: parseFloat(data.q),
              };
            }
          }
        } catch (e) {
          // Silent catch for JSON parse errors
        }
      };

      wsInstance.onclose = () => {
        if (isMounted) {
          reconnectTimeout = setTimeout(connect, 3000);
        }
      };

      wsInstance.onerror = () => {
        if (wsInstance) wsInstance.close();
      };
    };

    connect();

    // Batch updates to every 1 seond to prevent React render thrashing
    updateInterval = setInterval(() => {
      if (isMounted && Object.keys(bufferRef.current).length > 0) {
        setLivePrices((prev) => {
          // Only create new object if we have updates
          return { ...prev, ...bufferRef.current };
        });
        bufferRef.current = {};
      }
    }, 1000);

    return () => {
      isMounted = false;
      clearInterval(updateInterval);
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (ws.current) {
        ws.current.onclose = null;
        ws.current.close();
      }
    };
  }, []);

  // Memoize the context value to prevent unnecessary re-renders of consumers
  // Although livePrices changes frequently, using useMemo ensures we don't trigger
  // updates for other reasons.
  // We use the direct livePrices state which updates every second.
  return (
    <BinanceTickerContext.Provider value={livePrices}>
      {children}
    </BinanceTickerContext.Provider>
  );
};
