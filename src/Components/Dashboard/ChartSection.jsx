import React, { memo, useId, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ArrowUpRight } from "lucide-react";
import { getMarketChart, getBinanceKlines } from "@/api/coinApis";
import { useLivePrice } from "@/hooks/useBinanceTicker";
import useChartTheme from "@/hooks/useChartTheme";
import { Card } from "@/Components/ui/card";
import { Segmented } from "@/Components/ui/segmented";
import { Skeleton } from "@/Components/ui/skeleton";
import { Delta } from "@/Components/ui/delta";
import { CoinAvatar } from "@/Components/ui/coin-avatar";
import { FlashPrice } from "@/Components/Crypto/LiveCoinRow";
import { formatCompact, formatPrice } from "@/utils/format";
import { cn } from "@/utils/utils";

const TIMEFRAMES = [
  { label: "24H", value: 1 },
  { label: "7D", value: 7 },
  { label: "30D", value: 30 },
  { label: "3M", value: 90 },
  { label: "1Y", value: 365 },
];

/** Binance klines first (precise, no rate limit), CoinGecko as the fallback */
const fetchChart = async (coinId, days) => {
  const data = (await getBinanceKlines(coinId, days)) || (await getMarketChart(coinId, days));
  const prices = Array.isArray(data?.prices) ? data.prices : [];
  return prices
    .filter((p) => Array.isArray(p) && Number.isFinite(p[0]) && Number.isFinite(Number(p[1])))
    .map(([t, price]) => ({ t, price: Number(price) }));
};

/** One coin tab; re-renders only when its own price ticks */
const MarketTab = memo(({ coin, active, onSelect }) => {
  const live = useLivePrice(coin.id, coin.symbol);
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={() => onSelect(coin.id)}
      className={cn(
        "flex min-w-[132px] shrink-0 items-center gap-2.5 rounded-lg border px-3 py-2 text-left transition-colors",
        active ? "border-brand bg-brand-soft" : "border-line hover:border-line-strong hover:bg-surface-hover",
      )}
    >
      <CoinAvatar src={coin.image} symbol={coin.symbol} size={24} />
      <span className="min-w-0">
        <span className="block text-xs font-semibold text-fg">{coin.symbol?.toUpperCase()}</span>
        <Delta value={live?.price_change_percentage_24h ?? coin.price_change_percentage_24h} className="text-[11px]" />
      </span>
    </button>
  );
});
MarketTab.displayName = "MarketTab";

/** Live price and 24h stats above the chart */
const PriceHeader = memo(({ coin }) => {
  const live = useLivePrice(coin.id, coin.symbol);
  const price = live?.current_price ?? coin.current_price;
  const stats = [
    { label: "24h high", value: formatPrice(live?.high_24h ?? coin.high_24h) },
    { label: "24h low", value: formatPrice(live?.low_24h ?? coin.low_24h) },
    { label: "24h volume", value: `$${formatCompact(live?.total_volume ?? coin.total_volume ?? 0)}` },
  ];
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
      <div className="flex items-center gap-3">
        <CoinAvatar src={coin.image} symbol={coin.symbol} size={36} />
        <div>
          <p className="text-sm font-semibold text-fg">
            {coin.name} <span className="font-normal text-fg-subtle">{coin.symbol?.toUpperCase()}/USD</span>
          </p>
          <div className="flex items-center gap-2">
            <FlashPrice value={price} className="text-2xl font-semibold tracking-tight text-fg" />
            <Delta value={live?.price_change_percentage_24h ?? coin.price_change_percentage_24h} pill />
          </div>
        </div>
      </div>
      <dl className="flex gap-6">
        {stats.map((s) => (
          <div key={s.label}>
            <dt className="text-[11px] text-fg-subtle">{s.label}</dt>
            <dd className="tabular text-sm font-medium text-fg">{s.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
});
PriceHeader.displayName = "PriceHeader";

/** Tooltip rendered as HTML, so it can use the theme classes */
const ChartTooltip = ({ active, payload, days }) => {
  if (!active || !payload?.length) return null;
  const { t, price } = payload[0].payload;
  const date = new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    ...(days <= 30 ? { hour: "2-digit", minute: "2-digit" } : { year: "numeric" }),
  }).format(t);
  return (
    <div className="rounded-lg border border-line bg-surface px-3 py-2 shadow-pop">
      <p className="text-[11px] text-fg-subtle">{date}</p>
      <p className="tabular text-sm font-semibold text-fg">{formatPrice(price)}</p>
    </div>
  );
};

const PriceChart = memo(({ coinId, days }) => {
  const theme = useChartTheme();
  const gradientId = useId();
  const { data = [], isLoading, isFetching, isError } = useQuery({
    queryKey: ["chart", coinId, days],
    queryFn: () => fetchChart(coinId, days),
    enabled: !!coinId,
    staleTime: 60_000,
    placeholderData: keepPreviousData,
  });

  const up = data.length < 2 || data[data.length - 1].price >= data[0].price;
  const color = up ? theme.up : theme.down;

  const formatTick = useMemo(() => {
    const opts =
      days <= 1
        ? { hour: "2-digit", minute: "2-digit" }
        : days <= 90
          ? { day: "numeric", month: "short" }
          : { month: "short", year: "2-digit" };
    const fmt = new Intl.DateTimeFormat(undefined, opts);
    return (t) => fmt.format(t);
  }, [days]);

  if (isLoading) return <Skeleton className="h-full w-full rounded-lg" />;
  if (isError || data.length === 0) {
    return (
      <div className="grid h-full place-items-center text-sm text-fg-subtle">
        Chart data is unavailable right now.
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      {/* Thin progress bar instead of covering the chart while a new range loads */}
      {isFetching && <div className="absolute inset-x-0 top-0 z-10 h-0.5 animate-pulse rounded-full bg-brand" />}
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.22} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke={theme.grid} />
          <XAxis
            dataKey="t"
            type="number"
            scale="time"
            domain={["dataMin", "dataMax"]}
            tickFormatter={formatTick}
            tick={{ fill: theme.axis, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            minTickGap={48}
          />
          <YAxis
            orientation="right"
            domain={["auto", "auto"]}
            tickFormatter={(v) => (v >= 1000 ? `${formatCompact(v)}` : formatPrice(v).replace("$", ""))}
            tick={{ fill: theme.axis, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={56}
            tickCount={5}
          />
          <Tooltip
            content={<ChartTooltip days={days} />}
            cursor={{ stroke: theme.axis, strokeWidth: 1, strokeDasharray: "3 3" }}
          />
          <Area
            type="monotone"
            dataKey="price"
            stroke={color}
            strokeWidth={1.75}
            fill={`url(#${gradientId})`}
            isAnimationActive={false}
            dot={false}
            activeDot={{ r: 3.5, strokeWidth: 2, stroke: theme.surface, fill: color }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
});
PriceChart.displayName = "PriceChart";

/** Market overview: coin tabs, live price header and the price chart */
export default function ChartSection({ coins, selectedCoinId, onSelect, loading }) {
  const [days, setDays] = useState(1);
  const coin = coins.find((c) => c.id === selectedCoinId) || coins[0];

  return (
    <Card className="flex h-full flex-col">
      <div role="tablist" aria-label="Markets" className="flex gap-2 overflow-x-auto px-4 pt-4 no-scrollbar">
        {loading
          ? Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="h-[46px] w-[132px] shrink-0 rounded-lg" />)
          : coins.map((c) => <MarketTab key={c.id} coin={c} active={c.id === coin?.id} onSelect={onSelect} />)}
      </div>

      <div className="flex flex-1 flex-col gap-4 p-4">
        {coin ? <PriceHeader coin={coin} /> : <Skeleton className="h-12 w-64" />}

        <div className="flex items-center justify-between gap-3">
          <Segmented label="Timeframe" options={TIMEFRAMES} value={days} onChange={setDays} />
          {coin && (
            <Link
              to={`/coin/coin-details/${coin.id}`}
              className="inline-flex items-center gap-1 text-xs font-medium text-fg-muted transition-colors hover:text-brand"
            >
              Trade {coin.symbol?.toUpperCase()} <ArrowUpRight size={14} />
            </Link>
          )}
        </div>

        <div className="h-[260px] min-h-[260px] flex-1 sm:h-[320px] xl:h-auto xl:min-h-[340px]">
          {coin ? <PriceChart coinId={coin.id} days={days} /> : <Skeleton className="h-full w-full rounded-lg" />}
        </div>
      </div>
    </Card>
  );
}
