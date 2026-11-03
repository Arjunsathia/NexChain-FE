import React, { memo, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { PieChart, Coins, ArrowRight } from "lucide-react";
import { useLivePortfolio } from "@/hooks/useLivePortfolio";
import { useBinanceTicker } from "@/hooks/useBinanceTicker";
import { Card, CardHeader, CardLink, EmptyState } from "@/Components/ui/card";
import { SkeletonRows } from "@/Components/ui/skeleton";
import { Delta } from "@/Components/ui/delta";
import LiveCoinRow from "@/Components/Crypto/LiveCoinRow";
import { formatUSD } from "@/utils/format";

// Allocation colors: brand first, then distinct hues that work in both themes
const SEGMENT_COLORS = ["var(--brand)", "#8b5cf6", "#f59e0b", "#14b8a6", "#ec4899", "#64748b"];

const HoldingValue = memo(({ quantity, cost, price }) => {
  const value = quantity * (price || 0);
  const pnlPct = cost > 0 ? ((value - cost) / cost) * 100 : null;
  return (
    <div className="text-right">
      <p className="tabular text-sm font-medium text-fg">{formatUSD(value)}</p>
      <Delta value={pnlPct} className="text-xs" />
    </div>
  );
});
HoldingValue.displayName = "HoldingValue";

/** Open positions with allocation, valued at live prices */
function PortfolioCard() {
  const navigate = useNavigate();
  const { groupedHoldings, loading } = useLivePortfolio();
  const live = useBinanceTicker();

  const holdings = useMemo(
    () =>
      groupedHoldings
        .map((h) => {
          const price = live[h.coinId]?.current_price ?? h.currentPrice ?? 0;
          return { ...h, value: (h.totalQuantity || 0) * price };
        })
        .sort((a, b) => b.value - a.value),
    [groupedHoldings, live],
  );
  const total = holdings.reduce((sum, h) => sum + h.value, 0);
  const costBasis = holdings.reduce((sum, h) => sum + (h.remainingInvestment || 0), 0);
  const pnl = total - costBasis;

  // Top five positions get their own segment; the rest are grouped as "Other"
  const segments = useMemo(() => {
    if (total <= 0) return [];
    const top = holdings.slice(0, 5).map((h, i) => ({
      label: h.coinSymbol?.toUpperCase(),
      pct: (h.value / total) * 100,
      color: SEGMENT_COLORS[i],
    }));
    const rest = holdings.slice(5).reduce((sum, h) => sum + h.value, 0);
    if (rest > 0) top.push({ label: "Other", pct: (rest / total) * 100, color: SEGMENT_COLORS[5] });
    return top;
  }, [holdings, total]);

  return (
    <Card className="flex h-full flex-col">
      <CardHeader
        icon={PieChart}
        title="Holdings"
        subtitle={holdings.length ? `${holdings.length} position${holdings.length > 1 ? "s" : ""} · ${formatUSD(total)}` : undefined}
        action={
          <CardLink onClick={() => navigate("/portfolio")}>
            Details <ArrowRight size={12} />
          </CardLink>
        }
      />

      {loading && holdings.length === 0 ? (
        <SkeletonRows rows={5} />
      ) : holdings.length === 0 ? (
        <EmptyState
          icon={Coins}
          title="No positions yet"
          description="Buy your first coin with your virtual balance to start tracking performance."
          className="flex-1"
          action={
            <button
              type="button"
              onClick={() => navigate("/cryptolist")}
              className="mt-2 rounded-lg bg-brand px-3.5 py-2 text-xs font-semibold text-brand-fg hover:bg-brand-hover"
            >
              Explore markets
            </button>
          }
        />
      ) : (
        <>
          <div className="px-4 pb-3">
            <div className="flex h-2 overflow-hidden rounded-full bg-surface-2" role="img" aria-label="Portfolio allocation">
              {segments.map((s) => (
                <div key={s.label} style={{ width: `${s.pct}%`, background: s.color }} className="h-full first:rounded-l-full last:rounded-r-full" />
              ))}
            </div>
            <ul className="mt-2.5 flex flex-wrap gap-x-3 gap-y-1">
              {segments.map((s) => (
                <li key={s.label} className="flex items-center gap-1.5 text-[11px] text-fg-muted">
                  <span className="size-2 rounded-full" style={{ background: s.color }} />
                  {s.label} <span className="tabular text-fg-subtle">{s.pct.toFixed(1)}%</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="max-h-[320px] flex-1 divide-y divide-line overflow-y-auto border-t border-line xl:max-h-none" data-lenis-prevent>
            {holdings.map((h) => (
              <LiveCoinRow
                key={h.coinId}
                id={h.coinId}
                symbol={h.coinSymbol}
                image={h.marketData?.image || h.image}
                meta={`${Number(h.totalQuantity || 0).toLocaleString(undefined, { maximumFractionDigits: 6 })} ${h.coinSymbol?.toUpperCase() ?? ""}`}
                price={h.currentPrice}
                onClick={() => navigate(`/coin/coin-details/${h.coinId}`)}
                right={({ price }) => (
                  <HoldingValue quantity={h.totalQuantity || 0} cost={h.remainingInvestment || 0} price={price} />
                )}
              />
            ))}
          </div>
          <dl className="grid grid-cols-2 gap-3 border-t border-line px-4 py-3 text-xs">
            <div>
              <dt className="text-fg-subtle">Cost basis</dt>
              <dd className="tabular mt-0.5 text-sm font-medium text-fg">{formatUSD(costBasis)}</dd>
            </div>
            <div className="text-right">
              <dt className="text-fg-subtle">Unrealized P&amp;L</dt>
              <dd className={`tabular mt-0.5 text-sm font-medium ${pnl >= 0 ? "text-up" : "text-down"}`}>
                {pnl >= 0 ? "+" : "−"}
                {formatUSD(Math.abs(pnl))}
              </dd>
            </div>
          </dl>
        </>
      )}
    </Card>
  );
}

export default memo(PortfolioCard);
