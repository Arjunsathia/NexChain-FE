import React from "react";
import { ArrowLeftRight, BellPlus, Star } from "lucide-react";
import { Card } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { Delta } from "@/Components/ui/delta";
import { CoinAvatar } from "@/Components/ui/coin-avatar";
import { FlashPrice } from "@/Components/Crypto/LiveCoinRow";
import { formatCompact } from "@/utils/format";
import { cn } from "@/utils/utils";

const usd = (v) => (Number.isFinite(v) ? `$${formatCompact(v, 2)}` : "–");

const KeyStat = ({ label, value, hint }) => (
  <div className="min-w-0">
    <p className="text-xs text-fg-subtle">{label}</p>
    <p className="tabular mt-0.5 truncate text-sm font-semibold text-fg">{value}</p>
    {hint && <p className="mt-0.5 truncate text-xs text-fg-subtle">{hint}</p>}
  </div>
);

/** Coin identity, live price, the main actions and the headline market numbers */
export default function CoinHero({ info, price, change24h, volume, holding, watched, onToggleWatch, onAlert, onTrade }) {
  const symbol = info.symbol.toUpperCase();
  const volToCap = info.marketCap && volume ? (volume / info.marketCap) * 100 : null;
  const athChange = info.ath && price ? ((price - info.ath) / info.ath) * 100 : info.athChange;
  const supplyPct = info.maxSupply && info.circulating ? (info.circulating / info.maxSupply) * 100 : null;

  return (
    <Card className="p-4 sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 items-center gap-3.5 max-sm:items-start max-sm:gap-3">
          <span className="contents sm:hidden">
            <CoinAvatar src={info.image} symbol={info.symbol} size={44} />
          </span>
          <span className="contents max-sm:hidden">
            <CoinAvatar src={info.image} symbol={info.symbol} size={52} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-xl font-semibold tracking-tight text-fg sm:text-2xl">{info.name}</h1>
              <Badge>{symbol}</Badge>
              {info.rank && <Badge tone="brand">Rank #{info.rank}</Badge>}
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1">
              <FlashPrice value={price} className="text-[28px] leading-tight font-semibold tracking-tight text-fg sm:text-3xl" />
              <Delta value={change24h} pill />
              <span className="text-xs text-fg-subtle">24h</span>
            </div>
            {holding > 0 && (
              <p className="mt-2 inline-flex items-center rounded-full bg-up-soft px-2.5 py-1 text-xs font-medium text-up sm:hidden">
                You hold {holding.toLocaleString("en-US", { maximumFractionDigits: 6 })} {symbol}
              </p>
            )}
          </div>
          {/* Phones: Alert and Watch as round icon buttons beside the name */}
          <div className="flex shrink-0 gap-2 sm:hidden">
            <button
              type="button"
              onClick={onAlert}
              aria-label={`Set a price alert for ${symbol}`}
              className="grid size-10 place-items-center rounded-full border border-line text-fg-muted transition-colors hover:bg-surface-hover hover:text-fg"
            >
              <BellPlus size={17} />
            </button>
            <button
              type="button"
              onClick={onToggleWatch}
              aria-pressed={watched}
              aria-label={watched ? `Remove ${symbol} from watchlist` : `Add ${symbol} to watchlist`}
              className={cn(
                "grid size-10 place-items-center rounded-full border transition-colors",
                watched ? "border-warn/40 bg-warn/10 text-warn" : "border-line text-fg-muted hover:bg-surface-hover hover:text-fg",
              )}
            >
              <Star size={17} className={cn(watched && "fill-current")} />
            </button>
          </div>
        </div>

        {/* Phones: Alert and Watch side by side (Trade lives in the sticky bar); larger screens: one row */}
        <div className="grid grid-cols-2 gap-2 max-sm:hidden sm:flex sm:flex-wrap sm:items-center lg:justify-end">
          {holding > 0 && (
            <span className="col-span-2 inline-flex items-center justify-center rounded-lg bg-up-soft px-2.5 py-2 text-xs font-medium text-up sm:mr-1 sm:py-1.5">
              You hold {holding.toLocaleString("en-US", { maximumFractionDigits: 6 })} {symbol}
            </span>
          )}
          <button
            type="button"
            onClick={onAlert}
            className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg border border-line px-3 py-2 text-sm font-semibold text-fg transition-colors hover:bg-surface-hover sm:min-h-0"
          >
            <BellPlus size={15} /> Alert
          </button>
          <button
            type="button"
            onClick={onToggleWatch}
            aria-pressed={watched}
            className={cn(
              "inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors sm:min-h-0",
              watched ? "border-warn/40 bg-warn/10 text-warn" : "border-line text-fg hover:bg-surface-hover",
            )}
          >
            <Star size={15} className={cn(watched && "fill-current")} />
            {watched ? "Watching" : "Watch"}
          </button>
          <button
            type="button"
            onClick={onTrade}
            className="hidden items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-fg transition-opacity hover:opacity-90 sm:inline-flex"
          >
            <ArrowLeftRight size={15} /> Trade {symbol}
          </button>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-4 border-t border-line pt-4 max-sm:hidden sm:grid-cols-3 lg:grid-cols-5">
        <KeyStat label="Market cap" value={usd(info.marketCap)} hint={info.rank ? `#${info.rank} by market cap` : null} />
        <KeyStat label="24h volume" value={usd(volume)} hint={volToCap != null ? `${volToCap.toFixed(2)}% of market cap` : null} />
        <KeyStat label="Fully diluted value" value={usd(info.fdv)} hint={info.fdv && info.marketCap ? `${((info.marketCap / info.fdv) * 100).toFixed(0)}% already circulating` : null} />
        <KeyStat
          label="Circulating supply"
          value={Number.isFinite(info.circulating) ? `${formatCompact(info.circulating, 2)} ${symbol}` : "–"}
          hint={supplyPct != null ? `${supplyPct.toFixed(0)}% of max supply` : info.maxSupply === null ? "No max supply" : null}
        />
        <KeyStat
          label="All-time high"
          value={Number.isFinite(info.ath) ? `$${info.ath.toLocaleString("en-US", { maximumSignificantDigits: 6 })}` : "–"}
          hint={athChange != null ? <><Delta value={athChange} className="text-xs" /> from the high</> : null}
        />
      </div>
    </Card>
  );
}
