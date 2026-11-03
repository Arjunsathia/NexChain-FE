import React, { memo, useId, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { LineChart as LineChartIcon } from "lucide-react";
import api from "@/api/axiosConfig";
import useChartTheme from "@/hooks/useChartTheme";
import { Card, CardHeader, EmptyState } from "@/Components/ui/card";
import { Segmented } from "@/Components/ui/segmented";
import { Skeleton } from "@/Components/ui/skeleton";
import { Delta } from "@/Components/ui/delta";
import { formatCompact, formatUSD } from "@/utils/format";

const RANGES = [
  { label: "24H", value: "1d" },
  { label: "7D", value: "7d" },
  { label: "30D", value: "30d" },
  { label: "90D", value: "90d" },
];

const ChartTooltip = ({ active, payload, intraday }) => {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  const pnl = p.value - p.invested;
  return (
    <div className="rounded-lg border border-line bg-surface px-3 py-2 text-xs shadow-pop">
      <p className="mb-1 text-fg-subtle">
        {p.live
          ? "Now"
          : new Intl.DateTimeFormat(undefined, intraday ? { hour: "2-digit", minute: "2-digit" } : { month: "short", day: "numeric" }).format(p.t)}
      </p>
      <p className="tabular text-sm font-semibold text-fg">{formatUSD(p.value)}</p>
      <p className="tabular text-fg-muted">
        Cost {formatUSD(p.invested)} ·{" "}
        <span className={pnl >= 0 ? "text-up" : "text-down"}>
          {pnl >= 0 ? "+" : "−"}
          {formatUSD(Math.abs(pnl))}
        </span>
      </p>
    </div>
  );
};

/**
 * Holdings value over time from the server's hourly snapshots (daily points for
 * longer ranges), ending with a live point. The dashed line is the cost basis.
 */
function PerformanceChart({ holdingsCount }) {
  const userId = useSelector((state) => state.user.user?.id);
  const theme = useChartTheme();
  const gradientId = useId();
  const [range, setRange] = useState("7d");

  const { data = [], isLoading, isFetching } = useQuery({
    // Holdings count in the key: a buy or sell refetches the history
    queryKey: ["performance", userId, range, holdingsCount],
    queryFn: async () => {
      const res = await api.get(`/purchases/performance/${userId}`, { params: { range } });
      return (res.data.points || []).map((p) => ({
        t: new Date(p.at).getTime(),
        value: Math.round(p.holdingsValue * 100) / 100,
        invested: p.invested,
        live: !!p.live,
      }));
    },
    enabled: !!userId && holdingsCount > 0,
    staleTime: 5 * 60_000,
    placeholderData: keepPreviousData,
  });

  // Change in unrealized P&L over the range, relative to the current cost basis,
  // so buying more mid-range doesn't count as a gain
  const change = useMemo(() => {
    if (data.length < 2) return null;
    const first = data[0];
    const last = data[data.length - 1];
    const delta = last.value - last.invested - (first.value - first.invested);
    return { amount: delta, pct: last.invested > 0 ? (delta / last.invested) * 100 : 0 };
  }, [data]);

  const intraday = range === "1d";
  const tickFormat = useMemo(() => {
    const fmt = new Intl.DateTimeFormat(undefined, intraday ? { hour: "2-digit", minute: "2-digit" } : { month: "short", day: "numeric" });
    return (t) => fmt.format(t);
  }, [intraday]);
  const up = !change || change.amount >= 0;
  const color = up ? theme.up : theme.down;

  return (
    <Card className="flex h-full flex-col">
      <CardHeader
        icon={LineChartIcon}
        title="Performance"
        subtitle={
          change ? (
            <span className="flex items-center gap-1.5">
              <span className={`tabular ${up ? "text-up" : "text-down"}`}>
                {up ? "+" : "−"}
                {formatUSD(Math.abs(change.amount))}
              </span>
              <Delta value={change.pct} />
              <span className="hidden sm:inline">this period</span>
            </span>
          ) : (
            "Value of your holdings over time"
          )
        }
        action={holdingsCount > 0 && <Segmented label="Range" options={RANGES} value={range} onChange={setRange} />}
      />

      <div className="relative min-h-[280px] flex-1 px-2 pb-3 sm:px-4">
        {holdingsCount === 0 ? (
          <EmptyState icon={LineChartIcon} title="No performance yet" description="Buy a coin and your portfolio value will be charted here." className="h-full" />
        ) : isLoading ? (
          <Skeleton className="h-[280px] w-full rounded-lg" />
        ) : data.length < 2 ? (
          <EmptyState
            icon={LineChartIcon}
            title="Building your history"
            description="Your portfolio value is recorded every hour. Check back soon to see the chart."
            className="h-full"
          />
        ) : (
          <>
            {isFetching && <div className="absolute inset-x-4 top-0 z-10 h-0.5 animate-pulse rounded-full bg-brand" />}
            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart data={data} margin={{ top: 8, right: 0, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={0.2} />
                    <stop offset="100%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke={theme.grid} />
                <XAxis
                  dataKey="t"
                  type="number"
                  scale="time"
                  domain={["dataMin", "dataMax"]}
                  tickFormatter={tickFormat}
                  tick={{ fill: theme.axis, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  minTickGap={48}
                />
                <YAxis
                  orientation="right"
                  domain={["auto", "auto"]}
                  tickFormatter={(v) => `$${formatCompact(v)}`}
                  tick={{ fill: theme.axis, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={56}
                />
                <Tooltip content={<ChartTooltip intraday={intraday} />} cursor={{ stroke: theme.axis, strokeDasharray: "3 3" }} />
                <Line type="stepAfter" dataKey="invested" stroke={theme.axis} strokeWidth={1} strokeDasharray="4 4" dot={false} isAnimationActive={false} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={color}
                  strokeWidth={1.75}
                  fill={`url(#${gradientId})`}
                  dot={false}
                  activeDot={{ r: 3.5, strokeWidth: 2, stroke: theme.surface, fill: color }}
                  isAnimationActive={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
            <div className="mt-1 flex items-center gap-4 px-2 text-[11px] text-fg-subtle">
              <span className="flex items-center gap-1.5">
                <span className="h-0.5 w-4 rounded-full" style={{ background: color }} /> Holdings value
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-4 border-t border-dashed" style={{ borderColor: theme.axis }} /> Cost basis
              </span>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}

export default memo(PerformanceChart);
