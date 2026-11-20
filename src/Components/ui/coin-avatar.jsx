import * as React from "react";
import { cn } from "@/utils/utils";

/** Coin logo with a lettered fallback when the image is missing or fails */
function CoinAvatar({ src, symbol = "", size = 32, className }) {
  const [failed, setFailed] = React.useState(false);
  const style = { width: size, height: size };

  if (!src || failed) {
    // Letters scale with the circle (never below the 11px badge size); small circles fit two
    return (
      <span
        aria-hidden="true"
        style={{ ...style, fontSize: Math.max(11, Math.round(size * 0.34)) }}
        className={cn(
          "grid place-items-center rounded-full bg-surface-2 text-fg-muted font-semibold uppercase leading-none tracking-tight shrink-0",
          className,
        )}
      >
        {symbol.slice(0, size < 28 ? 2 : 3)}
      </span>
    );
  }
  return (
    <img
      src={src}
      alt=""
      loading="lazy"
      decoding="async"
      style={style}
      onError={() => setFailed(true)}
      className={cn("rounded-full object-cover shrink-0 bg-surface-2", className)}
    />
  );
}

export { CoinAvatar };
