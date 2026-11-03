import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Activity, BarChart3, ChevronDown, ExternalLink, Info, Wallet } from "lucide-react";
import { Card, CardHeader } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { Delta } from "@/Components/ui/delta";
import { Segmented } from "@/Components/ui/segmented";
import DayRange from "@/Components/Crypto/DayRange";
import OrderBook from "./OrderBook";
import TradeHistory from "./TradeHistory";
import { formatCompact, formatPrice, formatUSD } from "@/utils/format";
import { cn } from "@/utils/utils";

const fmtDate = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" });
const dateOf = (iso) => {
  const d = iso ? new Date(iso) : null;
  return d && !Number.isNaN(d.getTime()) ? fmtDate.format(d) : null;
};

const Row = ({ label, children }) => (
  <div className="flex items-baseline justify-between gap-4 py-2.5">
    <dt className="shrink-0 text-xs text-fg-subtle">{label}</dt>
    <dd className="tabular min-w-0 truncate text-right text-sm font-medium text-fg">{children}</dd>
  </div>
);

/** 24h range, supply, all-time high/low and the timeframe returns */
export function MarketStatsCard({ info, price, high24h, low24h }) {
  const symbol = info.symbol.toUpperCase();
  const supplyPct = info.maxSupply && info.circulating ? Math.min(100, (info.circulating / info.maxSupply) * 100) : null;
  const amount = (v) => (Number.isFinite(v) ? `${formatCompact(v, 2)} ${symbol}` : "–");

  return (
    <Card>
      <CardHeader icon={BarChart3} title="Market stats" subtitle="Prices in US dollars" />
      <div className="space-y-5 px-4 pb-4">
        <DayRange low={low24h} high={high24h} price={price} />

        <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-6 xl:grid-cols-3">
          {info.performance.map((p) => (
            <div key={p.label} className="rounded-lg bg-surface-2/60 px-2 py-2 text-center">
              <p className="text-[11px] text-fg-subtle">{p.label}</p>
              <Delta value={p.value} digits={p.value != null && Math.abs(p.value) >= 100 ? 0 : 1} className="text-xs" />
            </div>
          ))}
        </div>

        <div>
          <dl className="divide-y divide-line">
            <Row label="Circulating supply">{amount(info.circulating)}</Row>
            <Row label="Total supply">{amount(info.totalSupply)}</Row>
            <Row label="Max supply">{info.maxSupply ? amount(info.maxSupply) : "No cap"}</Row>
          </dl>
          {supplyPct != null && (
            <div className="mt-1">
              <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
                <div className="h-full rounded-full bg-brand" style={{ width: `${supplyPct}%` }} />
              </div>
              <p className="mt-1 text-[11px] text-fg-subtle">{supplyPct.toFixed(1)}% of the max supply is in circulation</p>
            </div>
          )}
        </div>

        <dl className="divide-y divide-line border-t border-line">
          <Row label="All-time high">
            {formatPrice(info.ath)}
            {dateOf(info.athDate) && <span className="ml-1.5 text-xs font-normal text-fg-subtle">{dateOf(info.athDate)}</span>}
          </Row>
          <Row label="All-time low">
            {formatPrice(info.atl)}
            {dateOf(info.atlDate) && <span className="ml-1.5 text-xs font-normal text-fg-subtle">{dateOf(info.atlDate)}</span>}
          </Row>
          {info.atl && price ? (
            <Row label="Since all-time low">
              <Delta value={((price - info.atl) / info.atl) * 100} digits={0} />
            </Row>
          ) : null}
        </dl>
      </div>
    </Card>
  );
}

/** The signed-in user's holding of this coin, valued at the live price */
export function PositionCard({ holding, price, symbol }) {
  const qty = holding.totalQuantity || 0;
  const cost = holding.remainingInvestment || 0;
  const value = qty * (price || 0);
  const pnl = value - cost;
  const pnlPct = cost > 0 ? (pnl / cost) * 100 : null;

  return (
    <Card>
      <CardHeader
        icon={Wallet}
        title="Your position"
        subtitle={`${qty.toLocaleString("en-US", { maximumFractionDigits: 6 })} ${symbol.toUpperCase()}`}
        action={
          <Link to="/portfolio" className="text-xs font-medium text-fg-muted transition-colors hover:text-brand">
            Portfolio
          </Link>
        }
      />
      <dl className="grid grid-cols-2 gap-px overflow-hidden border-t border-line bg-line">
        {[
          ["Value", formatUSD(value)],
          ["Average cost", qty ? formatPrice(cost / qty) : "–"],
          ["Cost basis", formatUSD(cost)],
          [
            "Profit / loss",
            <span key="pnl" className={cn(pnl >= 0 ? "text-up" : "text-down")}>
              {pnl >= 0 ? "+" : "−"}
              {formatUSD(Math.abs(pnl))}
              {pnlPct != null && <span className="ml-1 text-xs">({pnlPct >= 0 ? "+" : "−"}{Math.abs(pnlPct).toFixed(2)}%)</span>}
            </span>,
          ],
        ].map(([label, v]) => (
          <div key={label} className="bg-surface px-4 py-3">
            <dt className="text-[11px] text-fg-subtle">{label}</dt>
            <dd className="tabular mt-0.5 truncate text-sm font-semibold text-fg">{v}</dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}

const ACTIVITY_TABS = [
  { value: "book", label: "Order book" },
  { value: "trades", label: "Trades" },
];

/** Live Binance order book and trade feed, one at a time */
export function MarketActivityCard({ pair, symbol }) {
  const [tab, setTab] = useState("book");
  const base = symbol.toUpperCase();

  return (
    <Card className="flex h-[520px] flex-col">
      <CardHeader
        icon={Activity}
        title="Live market"
        subtitle={pair ? `${base}/USDT on Binance` : "Not listed on Binance"}
      />
      {pair && (
        <div className="px-4 pb-3">
          <Segmented label="Live market view" options={ACTIVITY_TABS} value={tab} onChange={setTab} className="grid w-full grid-cols-2" />
        </div>
      )}
      <div className="min-h-0 flex-1">
        {!pair ? (
          <p className="grid h-full place-items-center px-6 text-center text-sm text-fg-subtle">
            Live order book and trades are only available for coins traded on Binance.
          </p>
        ) : tab === "book" ? (
          <OrderBook symbol={pair} baseSymbol={base} />
        ) : (
          <TradeHistory symbol={pair} baseSymbol={base} />
        )}
      </div>
    </Card>
  );
}

/** Description, categories and official links from CoinGecko */
export function AboutCard({ info }) {
  const [expanded, setExpanded] = useState(false);
  const paragraphs = info.description;
  const long = paragraphs.length > 1 || (paragraphs[0]?.length ?? 0) > 420;
  const shown = expanded ? paragraphs : paragraphs.slice(0, 1);
  const facts = [
    info.genesisDate && ["Launched", dateOf(info.genesisDate)],
    info.hashingAlgorithm && ["Hashing algorithm", info.hashingAlgorithm],
  ].filter(Boolean);

  if (!paragraphs.length && !info.links.length && !info.categories.length) return null;

  return (
    <Card>
      <CardHeader icon={Info} title={`About ${info.name}`} subtitle="From CoinGecko" />
      <div className="space-y-4 px-4 pb-4">
        {paragraphs.length > 0 && (
          <div>
            <div className={cn("space-y-3 text-sm leading-relaxed text-fg-muted", !expanded && long && "line-clamp-4")}>
              {shown.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            {long && (
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                aria-expanded={expanded}
                className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline"
              >
                {expanded ? "Show less" : "Read more"}
                <ChevronDown size={14} className={cn("transition-transform", expanded && "rotate-180")} />
              </button>
            )}
          </div>
        )}

        {facts.length > 0 && (
          <dl className="flex flex-wrap gap-x-6 gap-y-2">
            {facts.map(([label, value]) => (
              <div key={label}>
                <dt className="text-[11px] text-fg-subtle">{label}</dt>
                <dd className="text-sm font-medium text-fg">{value}</dd>
              </div>
            ))}
          </dl>
        )}

        {info.categories.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {info.categories.slice(0, 8).map((c) => (
              <Badge key={c}>{c}</Badge>
            ))}
          </div>
        )}

        {info.links.length > 0 && (
          <div className="flex flex-wrap gap-2 border-t border-line pt-4">
            {info.links.map((l) => (
              <a
                key={l.url}
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex max-w-full items-center gap-1.5 rounded-lg border border-line px-2.5 py-1.5 text-xs font-medium text-fg transition-colors hover:border-line-strong hover:bg-surface-hover"
              >
                <span className="truncate">{l.label}</span>
                <ExternalLink size={12} className="shrink-0 text-fg-subtle" />
              </a>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

