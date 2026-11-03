import React, { memo, useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { PieChart as PieIcon } from "lucide-react";
import useChartTheme from "@/hooks/useChartTheme";
import { Card, CardHeader } from "@/Components/ui/card";
import { Skeleton } from "@/Components/ui/skeleton";
import { formatUSD } from "@/utils/format";

// Distinct hues that read in both themes; brand color comes from the theme
const PALETTE = ["#8b5cf6", "#f59e0b", "#14b8a6", "#ec4899", "#84cc16"];

const SliceTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const s = payload[0].payload;
  return (
    <div className="rounded-lg border border-line bg-surface px-3 py-2 text-xs shadow-pop">
      <p className="font-semibold text-fg">{s.label}</p>
      <p className="tabular text-fg-muted">
        {formatUSD(s.value)} · {s.pct.toFixed(1)}%
      </p>
    </div>
  );
};

/** Where the account's equity sits: top positions, the rest, and cash */
function AllocationCard({ positions, cash, loading }) {
  const theme = useChartTheme();

  const { slices, total } = useMemo(() => {
    const sorted = [...positions].sort((a, b) => b.value - a.value);
    const top = sorted.slice(0, 5).map((p, i) => ({ label: p.symbol, value: p.value, color: i === 0 ? theme.brand : PALETTE[i - 1] }));
    const rest = sorted.slice(5).reduce((s, p) => s + p.value, 0);
    if (rest > 0) top.push({ label: "Other", value: rest, color: PALETTE[4] });
    // Cash is neutral grey so the coins stand out
    if (cash > 0) top.push({ label: "Cash", value: cash, color: theme.axis });
    const sum = top.reduce((s, x) => s + x.value, 0);
    return { slices: top.map((x) => ({ ...x, pct: sum > 0 ? (x.value / sum) * 100 : 0 })), total: sum };
  }, [positions, cash, theme]);

  return (
    <Card className="flex h-full flex-col">
      <CardHeader icon={PieIcon} title="Allocation" subtitle="Share of total equity" />
      {loading ? (
        <div className="flex flex-1 flex-col items-center gap-4 p-4">
          <Skeleton className="size-44 rounded-full" />
          <Skeleton className="h-3 w-40" />
        </div>
      ) : (
        <div className="flex flex-1 flex-col gap-4 px-4 pb-4 sm:flex-row sm:items-center xl:flex-col xl:items-stretch">
          <div className="relative mx-auto size-48 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={slices} dataKey="value" nameKey="label" innerRadius="70%" outerRadius="100%" paddingAngle={slices.length > 1 ? 1.5 : 0} stroke="none" isAnimationActive={false}>
                  {slices.map((s) => (
                    <Cell key={s.label} fill={s.color} />
                  ))}
                </Pie>
                <Tooltip content={<SliceTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 grid place-content-center text-center">
              <span className="text-[11px] text-fg-subtle">Total equity</span>
              <span className="tabular text-base font-semibold text-fg">{formatUSD(total, { maximumFractionDigits: 0, minimumFractionDigits: 0 })}</span>
            </div>
          </div>
          <ul className="flex-1 space-y-2">
            {slices.map((s) => (
              <li key={s.label} className="flex items-center gap-2.5 text-sm">
                <span className="size-2.5 shrink-0 rounded-full" style={{ background: s.color }} />
                <span className="min-w-0 flex-1 truncate font-medium text-fg">{s.label}</span>
                <span className="tabular text-fg-muted">{formatUSD(s.value, { maximumFractionDigits: 0, minimumFractionDigits: 0 })}</span>
                <span className="tabular w-12 text-right text-fg-subtle">{s.pct.toFixed(1)}%</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}

export default memo(AllocationCard);
