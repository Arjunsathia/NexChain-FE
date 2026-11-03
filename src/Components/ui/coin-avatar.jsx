import * as React from "react";
import { cn } from "@/utils/utils";

/** Coin logo with a lettered fallback when the image is missing or fails */
function CoinAvatar({ src, symbol = "", size = 32, className }) {
  const [failed, setFailed] = React.useState(false);
  const style = { width: size, height: size };

  if (!src || failed) {
    return (
      <span
        style={style}
        className={cn(
          "grid place-items-center rounded-full bg-surface-2 text-fg-muted text-[10px] font-semibold uppercase shrink-0",
          className,
        )}
      >
        {symbol.slice(0, 3)}
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
