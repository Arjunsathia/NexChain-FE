import React, { memo, useEffect, useRef, useState } from "react";
import useBinanceStream from "@/hooks/useBinanceStream";
import { formatCompact } from "@/utils/format";
import { cn } from "@/utils/utils";

const FLUSH_MS = 250; // the stream sends up to 10 updates/s; render at most 4
const LEVELS = 12;

const decimalsFor = (price) => (price >= 1000 ? 2 : price >= 1 ? 3 : price >= 0.01 ? 5 : 8);
const fmtAmount = (v) => (v >= 10_000 ? formatCompact(v) : v.toLocaleString("en-US", { maximumFractionDigits: v >= 1 ? 4 : 6 }));

const SIDES = [
  { value: "all", label: "Both sides" },
  { value: "bids", label: "Bids only" },
  { value: "asks", label: "Asks only" },
];

/** Two-tone icon for the side filter: green (bids) and red (asks) stripes */
const SideIcon = ({ side }) => (
  <span className="grid w-3.5 gap-px" aria-hidden="true">
    {[0, 1, 2, 3].map((i) => (
      <span
        key={i}
        className={cn(
          "h-[2px] rounded-full",
          side === "bids" ? "bg-up" : side === "asks" ? "bg-down" : i < 2 ? "bg-down" : "bg-up",
        )}
      />
    ))}
  </span>
);

const Level = ({ level, side, maxVolume, decimals }) => (
  <div className="relative grid grid-cols-3 gap-2 px-4 py-[3px] text-xs">
    <span
      className={cn("absolute inset-y-0 right-0", side === "bid" ? "bg-up-soft" : "bg-down-soft")}
      style={{ width: `${maxVolume ? (level.volume / maxVolume) * 100 : 0}%` }}
      aria-hidden="true"
    />
    <span className={cn("tabular relative font-medium", side === "bid" ? "text-up" : "text-down")}>
      {level.price.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
    </span>
    <span className="tabular relative text-right text-fg">{fmtAmount(level.volume)}</span>
    <span className="tabular relative text-right text-fg-muted">{formatCompact(level.price * level.volume)}</span>
  </div>
);

/** Live top-of-book depth from Binance with the spread in the middle */
const OrderBook = memo(({ symbol, baseSymbol }) => {
  const [book, setBook] = useState({ bids: [], asks: [] });
  const [side, setSide] = useState("all");
  const latestRef = useRef(null);

  const status = useBinanceStream(symbol ? `${symbol.toLowerCase()}@depth20@100ms` : null, (data) => {
    if (data.bids && data.asks) latestRef.current = data;
  });

  // Reset when switching coins, then render the latest snapshot on a timer
  useEffect(() => {
    latestRef.current = null;
    setBook({ bids: [], asks: [] });
    const timer = setInterval(() => {
      const data = latestRef.current;
      if (!data) return;
      latestRef.current = null;
      const toLevels = (levels) => levels.slice(0, LEVELS).map(([price, volume]) => ({ price: +price, volume: +volume }));
      setBook({ bids: toLevels(data.bids), asks: toLevels(data.asks) });
    }, FLUSH_MS);
    return () => clearInterval(timer);
  }, [symbol]);

  const levels = side === "all" ? LEVELS / 2 + 2 : LEVELS;
  const asks = book.asks.slice(0, side === "asks" ? LEVELS : side === "all" ? levels : 0);
  const bids = book.bids.slice(0, side === "bids" ? LEVELS : side === "all" ? levels : 0);
  const maxVolume = Math.max(0, ...asks.map((l) => l.volume), ...bids.map((l) => l.volume));
  const bestBid = book.bids[0]?.price;
  const bestAsk = book.asks[0]?.price;
  const decimals = decimalsFor(bestBid || bestAsk || 1);
  const spread = bestBid && bestAsk ? bestAsk - bestBid : null;
  const bidShare = (() => {
    const b = book.bids.reduce((s, l) => s + l.volume * l.price, 0);
    const a = book.asks.reduce((s, l) => s + l.volume * l.price, 0);
    return a + b ? (b / (a + b)) * 100 : null;
  })();

  if (status === "unavailable") {
    return <p className="grid h-full place-items-center px-6 text-center text-sm text-fg-subtle">Order book isn’t available for this coin.</p>;
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-2 px-4 pb-2">
        <div className="inline-flex gap-0.5 rounded-lg bg-surface-2 p-0.5" role="group" aria-label="Order book sides">
          {SIDES.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => setSide(s.value)}
              aria-pressed={side === s.value}
              aria-label={s.label}
              title={s.label}
              className={cn(
                "grid size-7 place-items-center rounded-md transition-colors",
                side === s.value ? "bg-surface shadow-card ring-1 ring-line" : "opacity-60 hover:opacity-100",
              )}
            >
              <SideIcon side={s.value} />
            </button>
          ))}
        </div>
        {bidShare != null && (
          <div className="flex min-w-0 flex-1 items-center gap-2 pl-3 text-[11px] font-medium" title="Share of visible depth on each side">
            <span className="tabular text-up">{bidShare.toFixed(0)}%</span>
            <span className="flex h-1.5 flex-1 overflow-hidden rounded-full">
              <span className="bg-up" style={{ width: `${bidShare}%` }} />
              <span className="flex-1 bg-down" />
            </span>
            <span className="tabular text-down">{(100 - bidShare).toFixed(0)}%</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 border-y border-line px-4 py-1.5 text-[11px] font-medium text-fg-subtle">
        <span>Price (USDT)</span>
        <span className="text-right">Amount ({baseSymbol})</span>
        <span className="text-right">Total</span>
      </div>

      {!book.bids.length ? (
        <p className="grid flex-1 place-items-center text-xs text-fg-subtle" role="status">
          {status === "live" ? "Waiting for the first update…" : "Connecting to Binance…"}
        </p>
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto py-1">
          <div className="flex flex-col-reverse">
            {asks.map((l) => (
              <Level key={`a${l.price}`} level={l} side="ask" maxVolume={maxVolume} decimals={decimals} />
            ))}
          </div>
          {side === "all" && spread != null && (
            <div className="my-1 flex items-center justify-between border-y border-line bg-surface-2/60 px-4 py-1.5 text-xs">
              <span className="tabular text-sm font-semibold text-fg">
                {((bestBid + bestAsk) / 2).toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
              </span>
              <span className="text-fg-subtle">
                Spread{" "}
                <span className="tabular font-medium text-fg">
                  {spread.toLocaleString("en-US", { maximumFractionDigits: decimals })} ({((spread / bestAsk) * 100).toFixed(3)}%)
                </span>
              </span>
            </div>
          )}
          {bids.map((l) => (
            <Level key={`b${l.price}`} level={l} side="bid" maxVolume={maxVolume} decimals={decimals} />
          ))}
        </div>
      )}
    </div>
  );
});

OrderBook.displayName = "OrderBook";

export default OrderBook;
