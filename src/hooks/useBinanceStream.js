import { useEffect, useRef, useState } from "react";
import { BINANCE_WS_URL } from "@/api/axiosConfig";

/**
 * Subscribes to one raw Binance stream (e.g. "btcusdt@trade") with automatic
 * reconnects. Pass a null stream for coins without a Binance pair.
 * @returns {"connecting" | "live" | "reconnecting" | "unavailable"}
 */
export default function useBinanceStream(stream, onMessage) {
  const [status, setStatus] = useState(stream ? "connecting" : "unavailable");
  const handlerRef = useRef(onMessage);
  handlerRef.current = onMessage;

  useEffect(() => {
    if (!stream) {
      setStatus("unavailable");
      return;
    }

    let ws = null;
    let retryTimer = null;
    let attempts = 0;
    let active = true;

    const connect = () => {
      setStatus(attempts === 0 ? "connecting" : "reconnecting");
      ws = new WebSocket(`${BINANCE_WS_URL}/ws/${stream}`);

      ws.onopen = () => {
        attempts = 0;
        setStatus("live");
      };
      ws.onmessage = (event) => {
        try {
          handlerRef.current(JSON.parse(event.data));
        } catch {
          // ignore malformed frames
        }
      };
      ws.onclose = () => {
        if (!active) return;
        setStatus("reconnecting");
        attempts += 1;
        retryTimer = setTimeout(connect, Math.min(15000, 1000 * 2 ** attempts));
      };
      ws.onerror = () => ws.close();
    };

    connect();

    return () => {
      active = false;
      clearTimeout(retryTimer);
      if (ws) {
        ws.onclose = null;
        ws.close(); // also cancels a socket that is still connecting
      }
    };
  }, [stream]);

  return status;
}
