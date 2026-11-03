import React, { memo, useEffect, useRef, useState } from "react";
import { useLivePrice } from "@/hooks/useBinanceTicker";
import { CoinAvatar } from "@/Components/ui/coin-avatar";
import { Delta } from "@/Components/ui/delta";
import { formatPrice } from "@/utils/format";
import { cn } from "@/utils/utils";

/** Price text that tints green/red for a moment whenever the value changes */
export const FlashPrice = memo(({ value, className }) => {
  const prev = useRef(value);
  const [flash, setFlash] = useState({ dir: "", tick: 0 });

  useEffect(() => {
    if (prev.current !== undefined && value !== prev.current && Number.isFinite(value)) {
      setFlash((f) => ({ dir: value > prev.current ? "flash-up" : "flash-down", tick: f.tick + 1 }));
    }
    prev.current = value;
  }, [value]);

  return (
    // The key restarts the CSS animation on every change
    <span key={flash.tick} className={cn("tabular rounded px-1 -mx-1", flash.dir, className)}>
      {formatPrice(value)}
    </span>
  );
});
FlashPrice.displayName = "FlashPrice";

/**
 * One coin in a dashboard list. Subscribes to that coin's live price only, so
 * a tick re-renders this row and nothing else.
 */
const LiveCoinRow = memo(({ id, symbol, name, image, price, change, meta, right, onClick }) => {
  const live = useLivePrice(id, symbol);
  const currentPrice = live?.current_price ?? price;
  const currentChange = live?.price_change_percentage_24h ?? change;
  const Comp = onClick ? "button" : "div";

  return (
    <Comp
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 px-4 py-2.5 text-left",
        onClick && "transition-colors hover:bg-surface-hover focus-visible:bg-surface-hover outline-none",
      )}
    >
      <CoinAvatar src={image} symbol={symbol} size={30} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-fg">{symbol?.toUpperCase()}</p>
        <p className="truncate text-xs text-fg-subtle">{meta ?? name}</p>
      </div>
      {right ? (
        right({ price: currentPrice, change: currentChange })
      ) : (
        <div className="text-right">
          <FlashPrice value={currentPrice} className="block text-sm font-medium text-fg" />
          <Delta value={currentChange} className="text-xs" />
        </div>
      )}
    </Comp>
  );
});
LiveCoinRow.displayName = "LiveCoinRow";

export default LiveCoinRow;
