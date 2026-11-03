import React, { memo, useEffect, useRef, useState } from "react";
import useBinanceStream from "@/hooks/useBinanceStream";
import { formatCompact } from "@/utils/format";
import { cn } from "@/utils/utils";

const FLUSH_MS = 250;
const KEEP = 40;

const decimalsFor = (price) => (price >= 1000 ? 2 : price >= 1 ? 3 : price >= 0.01 ? 5 : 8);
const fmtAmount = (v) => (v >= 10_000 ? formatCompact(v) : v.toLocaleString("en-US", { maximumFractionDigits: v >= 1 ? 4 : 6 }));
const fmtTime = new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });

/** The latest trades on Binance for this pair, newest first */
const TradeHistory = memo(({ symbol, baseSymbol }) => {
  const [trades, setTrades] = useState([]);
  const tradesRef = useRef([]);
  const dirtyRef = useRef(false);

  const status = useBinanceStream(symbol ? `${symbol.toLowerCase()}@trade` : null, (trade) => {
    if (!trade.t) return;
    tradesRef.current = [
      { id: trade.t, price: +trade.p, volume: +trade.q, time: trade.T, buy: !trade.m },
      ...tradesRef.current,
    ].slice(0, KEEP);
    dirtyRef.current = true;
  });

  // Reset when switching coins; busy pairs trade many times a second, so render in batches
  useEffect(() => {
    tradesRef.current = [];
    setTrades([]);
    const timer = setInterval(() => {
      if (!dirtyRef.current) return;
      dirtyRef.current = false;
      setTrades(tradesRef.current);
    }, FLUSH_MS);
    return () => clearInterval(timer);
  }, [symbol]);

  if (status === "unavailable") {
    return <p className="grid h-full place-items-center px-6 text-center text-sm text-fg-subtle">Live trades aren’t available for this coin.</p>;
  }

  const decimals = decimalsFor(trades[0]?.price || 1);

  return (
    <div className="flex h-full flex-col">
      <div className="grid grid-cols-3 gap-2 border-y border-line px-4 py-1.5 text-[11px] font-medium text-fg-subtle">
        <span>Price (USDT)</span>
        <span className="text-right">Amount ({baseSymbol})</span>
        <span className="text-right">Time</span>
      </div>
      {trades.length === 0 ? (
        <p className="grid flex-1 place-items-center text-xs text-fg-subtle" role="status">
          {status === "live" ? "Waiting for trades…" : "Connecting to Binance…"}
        </p>
      ) : (
        <ul className="min-h-0 flex-1 overflow-y-auto py-1">
          {trades.map((t) => (
            <li key={t.id} className="grid grid-cols-3 gap-2 px-4 py-[3px] text-xs transition-colors hover:bg-surface-hover">
              <span className={cn("tabular font-medium", t.buy ? "text-up" : "text-down")}>
                {t.price.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
              </span>
              <span className="tabular text-right text-fg">{fmtAmount(t.volume)}</span>
              <span className="tabular text-right text-fg-muted">{fmtTime.format(t.time)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
});

TradeHistory.displayName = "TradeHistory";

export default TradeHistory;
