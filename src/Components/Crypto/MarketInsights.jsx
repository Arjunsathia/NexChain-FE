import React, { memo, useMemo, useState } from "react";
import { Activity, CloudOff, LayoutGrid, PieChart, TrendingDown, TrendingUp, Zap } from "lucide-react";
import useCoinContext from "@/hooks/useCoinContext";
import { Card, CardHeader, CardLink, EmptyState } from "@/Components/ui/card";
import { Segmented } from "@/Components/ui/segmented";
import { Skeleton, SkeletonRows } from "@/Components/ui/skeleton";
import { Delta } from "@/Components/ui/delta";
import { isStablecoin } from "@/utils/coinRegistry";
import { formatCompact } from "@/utils/format";
import LiveCoinRow, { FlashPrice } from "./LiveCoinRow";
import CoinListModal from "./CoinListModal";

const PERIODS = [
  { value: "24h", label: "24h", get: (c) => c.price_change_percentage_24h, scale: 8 },
  { value: "7d", label: "7d", get: (c) => c.price_change_percentage_7d_in_currency, scale: 20 },
];
const HEATMAP_SIZE = 40;
const LIST_SIZE = 5;
const FLAT = 0.1; // |change| below this counts as unchanged

const median = (values) => {
  if (!values.length) return null;
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
};

/** Tile tint: gray at 0%, stronger green or red up to the period's scale */
const tileColor = (change, scale) => {
  if (!Number.isFinite(change)) return "var(--surface-2)";
  const strength = Math.round(Math.min(Math.abs(change) / scale, 1) * 55);
  const tone = change >= 0 ? "var(--up)" : "var(--down)";
  return `color-mix(in oklab, ${tone} ${strength}%, var(--surface-2))`;
};

/** Advancing, unchanged and declining coins as one split bar */
function Breadth({ stats, period }) {
  const { up, flat, down, total } = stats;
  const parts = [
    { key: "up", label: "Advancing", count: up, color: "var(--up)" },
    { key: "flat", label: "Unchanged", count: flat, color: "var(--line-strong)" },
    { key: "down", label: "Declining", count: down, color: "var(--down)" },
  ];
  const mood = up / total >= 0.6 ? "Broad rally" : down / total >= 0.6 ? "Broad sell-off" : "Mixed market";

  return (
    <Card>
      <CardHeader icon={Activity} title="Market breadth" subtitle={`${total} coins, ${period} change`} action={<span className="text-xs font-medium text-fg-muted">{mood}</span>} />
      <div className="px-4 pb-4">
        <div className="flex h-2.5 gap-0.5 overflow-hidden rounded-full" role="img" aria-label={`${up} advancing, ${flat} unchanged, ${down} declining`}>
          {parts.map((p) =>
            p.count ? <span key={p.key} title={`${p.label}: ${p.count}`} style={{ width: `${(p.count / total) * 100}%`, background: p.color }} /> : null,
          )}
        </div>
        <ul className="mt-3 grid grid-cols-3 gap-2">
          {parts.map((p) => (
            <li key={p.key}>
              <p className="flex items-center gap-1.5 text-[11px] text-fg-subtle">
                <span className="size-2 rounded-full" style={{ background: p.color }} />
                {p.label}
              </p>
              <p className="tabular mt-0.5 text-base font-semibold text-fg">{p.count}</p>
            </li>
          ))}
        </ul>
        <dl className="mt-3 grid grid-cols-2 gap-2 border-t border-line pt-3 text-xs">
          <div>
            <dt className="text-fg-subtle">Median change</dt>
            <dd className="mt-0.5 text-sm"><Delta value={stats.median} /></dd>
          </div>
          <div>
            <dt className="text-fg-subtle">Within 10% of ATH</dt>
            <dd className="tabular mt-0.5 text-sm font-medium text-fg">{stats.nearAth} coins</dd>
          </div>
        </dl>
      </div>
    </Card>
  );
}

/** Share of the top-100 market cap held by the largest coins */
function Concentration({ coins }) {
  const { rows, top10 } = useMemo(() => {
    const total = coins.reduce((sum, c) => sum + (c.market_cap || 0), 0) || 1;
    const sorted = [...coins].sort((a, b) => (b.market_cap || 0) - (a.market_cap || 0));
    const share = (c) => ((c.market_cap || 0) / total) * 100;
    return {
      rows: sorted.slice(0, 6).map((c) => ({ id: c.id, symbol: c.symbol?.toUpperCase(), pct: share(c) })),
      top10: sorted.slice(0, 10).reduce((sum, c) => sum + share(c), 0),
    };
  }, [coins]);
  const max = rows[0]?.pct || 1;

  return (
    <Card>
      <CardHeader icon={PieChart} title="Market cap share" subtitle={`Top 10 hold ${top10.toFixed(1)}% of the top 100`} />
      <ul className="space-y-2 px-4 pb-4">
        {rows.map((r) => (
          <li key={r.id} className="grid grid-cols-[3.5rem_1fr_3.5rem] items-center gap-2 text-xs">
            <span className="font-medium text-fg">{r.symbol}</span>
            <span className="h-2 rounded-full bg-surface-2">
              <span className="block h-full rounded-full bg-brand" style={{ width: `${(r.pct / max) * 100}%` }} />
            </span>
            <span className="tabular text-right text-fg-muted">{r.pct.toFixed(1)}%</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

/** The largest coins as tiles tinted by their change */
function Heatmap({ coins, period, onSelect }) {
  const tiles = useMemo(
    () => [...coins].sort((a, b) => (b.market_cap || 0) - (a.market_cap || 0)).slice(0, HEATMAP_SIZE),
    [coins],
  );

  return (
    <Card className="flex flex-col">
      <CardHeader
        icon={LayoutGrid}
        title="Heatmap"
        subtitle={`Top ${tiles.length} by market cap, ${period.label} change`}
        action={
          <span className="hidden items-center gap-1.5 text-[11px] text-fg-subtle sm:flex" aria-hidden="true">
            −{period.scale}%
            <span
              className="h-1.5 w-20 rounded-full"
              style={{ background: `linear-gradient(90deg, ${tileColor(-period.scale, period.scale)}, var(--surface-2), ${tileColor(period.scale, period.scale)})` }}
            />
            +{period.scale}%
          </span>
        }
      />
      <ul className="grid flex-1 grid-cols-4 gap-1 px-4 pb-4 sm:grid-cols-6 lg:grid-cols-8">
        {tiles.map((c, i) => {
          const change = period.get(c);
          return (
            <li key={c.id} className={i < 2 ? "col-span-2 row-span-2" : undefined}>
              <button
                type="button"
                onClick={() => onSelect(c)}
                title={`${c.name}: ${Number.isFinite(change) ? `${change.toFixed(2)}%` : "no data"}`}
                className="flex h-full min-h-14 w-full flex-col items-center justify-center rounded-md px-1 py-2 text-center transition-[filter] hover:brightness-110 focus-visible:outline-2 focus-visible:outline-brand"
                style={{ background: tileColor(change, period.scale) }}
              >
                <span className={i < 2 ? "text-base font-semibold text-fg" : "text-xs font-semibold text-fg"}>{c.symbol?.toUpperCase()}</span>
                <span className={`tabular text-fg-muted ${i < 2 ? "text-sm" : "text-[11px]"}`}>
                  {Number.isFinite(change) ? `${change >= 0 ? "+" : "−"}${Math.abs(change).toFixed(1)}%` : "–"}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

/** Short ranked list with a "View all" link to the full list */
function MoverList({ icon, title, subtitle, coins, period, onSelect, onViewAll, meta }) {
  return (
    <Card>
      <CardHeader icon={icon} title={title} subtitle={subtitle} className="pb-2" action={onViewAll && <CardLink onClick={onViewAll}>View all</CardLink>} />
      {coins.length === 0 ? (
        <EmptyState title="Nothing to show" description="No coins match right now." />
      ) : (
        <div className="divide-y divide-line">
          {coins.slice(0, LIST_SIZE).map((c) => (
            <LiveCoinRow
              key={c.id}
              id={c.id}
              symbol={c.symbol}
              name={c.name}
              image={c.image}
              price={c.current_price}
              change={c.price_change_percentage_24h}
              meta={meta ? meta(c) : c.name}
              onClick={() => onSelect(c)}
              right={
                period.value === "24h"
                  ? undefined
                  : ({ price }) => (
                      <div className="text-right">
                        <FlashPrice value={price} className="block text-sm font-medium text-fg" />
                        <Delta value={period.get(c)} className="text-xs" />
                      </div>
                    )
              }
            />
          ))}
        </div>
      )}
    </Card>
  );
}

/** Markets → Insights: breadth, heatmap, concentration and movers from the top-100 list */
function MarketInsights({ onSelect }) {
  const { coins, coinsLoading } = useCoinContext();
  const [periodKey, setPeriodKey] = useState("24h");
  // The list stays set while its modal animates out
  const [listKey, setListKey] = useState("gainers");
  const [listOpen, setListOpen] = useState(false);
  const period = PERIODS.find((p) => p.value === periodKey);

  const data = useMemo(() => {
    // Stablecoins sit at $1, so they would only pad the "unchanged" count and the heatmap
    const tradable = coins.filter((c) => !isStablecoin(c));
    const valued = tradable.filter((c) => Number.isFinite(period.get(c)));
    const changes = valued.map(period.get);
    const ranked = [...valued].sort((a, b) => period.get(b) - period.get(a));
    return {
      tradable,
      breadth: {
        up: changes.filter((v) => v >= FLAT).length,
        down: changes.filter((v) => v <= -FLAT).length,
        flat: changes.filter((v) => Math.abs(v) < FLAT).length,
        total: changes.length || 1,
        median: median(changes),
        nearAth: tradable.filter((c) => Number.isFinite(c.ath_change_percentage) && c.ath_change_percentage > -10).length,
      },
      gainers: ranked.filter((c) => period.get(c) > 0),
      losers: [...ranked].reverse().filter((c) => period.get(c) < 0),
      // Heavy trading relative to size often comes before or with a big move
      turnover: coins
        .filter((c) => !isStablecoin(c) && c.market_cap > 0)
        .sort((a, b) => b.total_volume / b.market_cap - a.total_volume / a.market_cap),
    };
  }, [coins, period]);

  const lists = {
    gainers: { title: `Top gainers (${period.label})`, coins: data.gainers },
    losers: { title: `Top losers (${period.label})`, coins: data.losers },
  };
  const openList = lists[listKey];
  const showList = (key) => {
    setListKey(key);
    setListOpen(true);
  };

  if (coinsLoading && coins.length === 0) {
    return (
      <div className="grid gap-4 lg:gap-5 xl:grid-cols-12">
        <Skeleton className="h-96 rounded-xl xl:col-span-8" />
        <Card className="xl:col-span-4"><SkeletonRows rows={6} /></Card>
      </div>
    );
  }
  if (coins.length === 0) {
    return (
      <Card>
        <EmptyState icon={CloudOff} title="Market data unavailable" description="The price provider is limiting requests. Insights will appear on the next refresh." />
      </Card>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-fg-subtle">Top {coins.length} coins by market cap. Stablecoins are left out of breadth, movers and the heatmap.</p>
        <Segmented label="Change period" options={PERIODS} value={periodKey} onChange={setPeriodKey} />
      </div>

      <div className="grid items-start gap-4 lg:gap-5 xl:grid-cols-12">
        <div className="xl:col-span-8">
          <Heatmap coins={data.tradable} period={period} onSelect={onSelect} />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:gap-5 xl:col-span-4 xl:grid-cols-1">
          <Breadth stats={data.breadth} period={period.label} />
          <Concentration coins={coins} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:gap-5 xl:grid-cols-3">
        <MoverList icon={TrendingUp} title={lists.gainers.title} subtitle="Biggest rises" coins={data.gainers} period={period} onSelect={onSelect} onViewAll={() => showList("gainers")} />
        <MoverList icon={TrendingDown} title={lists.losers.title} subtitle="Biggest falls" coins={data.losers} period={period} onSelect={onSelect} onViewAll={() => showList("losers")} />
        <MoverList
          icon={Zap}
          title="Unusual volume"
          subtitle="24h volume vs. market cap, excl. stablecoins"
          coins={data.turnover}
          period={PERIODS[0]}
          onSelect={onSelect}
          meta={(c) => `Vol $${formatCompact(c.total_volume)} · ${((c.total_volume / c.market_cap) * 100).toFixed(0)}% of cap`}
        />
      </div>

      <CoinListModal
        open={listOpen}
        onClose={() => setListOpen(false)}
        title={openList.title}
        subtitle={`${openList.coins.length} coins in the top 100`}
        coins={openList.coins}
        metric={period.value === "24h" ? undefined : period.get}
        onSelect={(c) => {
          setListOpen(false);
          onSelect(c);
        }}
      />
    </div>
  );
}

export default memo(MarketInsights);
