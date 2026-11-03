import React, { memo } from "react";
import { useQuery } from "@tanstack/react-query";
import { CloudOff } from "lucide-react";
import { getGlobalMarketStats } from "@/api/coinApis";
import { Card } from "@/Components/ui/card";
import { Delta } from "@/Components/ui/delta";
import { Skeleton } from "@/Components/ui/skeleton";
import { formatCompact } from "@/utils/format";

const Stat = ({ label, loading, children }) => (
  <div className="min-w-0 px-4 py-3.5">
    <p className="text-xs text-fg-subtle">{label}</p>
    {loading ? <Skeleton className="mt-1.5 h-5 w-24" /> : <div className="mt-1 flex items-center gap-2">{children}</div>}
  </div>
);

const Dominance = ({ value, color }) => (
  <>
    <span className="tabular text-base font-semibold text-fg">{Number.isFinite(value) ? `${value.toFixed(1)}%` : "–"}</span>
    <span className="hidden h-1.5 w-14 overflow-hidden rounded-full bg-surface-2 sm:block">
      <span className="block h-full rounded-full" style={{ width: `${Math.min(value || 0, 100)}%`, background: color }} />
    </span>
  </>
);

/** Global market cap, volume and dominance (CoinGecko /global, cached 5 minutes) */
function MarketStats() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["globalMarketStats"],
    queryFn: getGlobalMarketStats,
    staleTime: 5 * 60_000,
  });
  const usd = (v) => (Number.isFinite(v) ? `$${formatCompact(v, 2)}` : "–");
  const loading = isLoading && !data;

  if (isError && !data) {
    return (
      <Card className="flex items-center gap-3 px-4 py-3.5 text-sm text-fg-muted">
        <CloudOff size={16} className="shrink-0 text-fg-subtle" />
        Global market stats are temporarily unavailable. They will reappear on the next refresh.
      </Card>
    );
  }

  return (
    <Card className="grid grid-cols-2 divide-line md:grid-cols-5 md:divide-x [&>*:nth-child(n+3)]:border-t [&>*:nth-child(n+3)]:border-line md:[&>*:nth-child(n+3)]:border-t-0">
      <Stat label="Market cap" loading={loading}>
        <span className="tabular text-base font-semibold text-fg">{usd(data?.total_market_cap?.usd)}</span>
        <Delta value={data?.market_cap_change_percentage_24h_usd} className="text-xs" />
      </Stat>
      <Stat label="24h volume" loading={loading}>
        <span className="tabular text-base font-semibold text-fg">{usd(data?.total_volume?.usd)}</span>
      </Stat>
      <Stat label="BTC dominance" loading={loading}>
        <Dominance value={data?.market_cap_percentage?.btc} color="#f7931a" />
      </Stat>
      <Stat label="ETH dominance" loading={loading}>
        <Dominance value={data?.market_cap_percentage?.eth} color="#627eea" />
      </Stat>
      <Stat label="Active coins" loading={loading}>
        <span className="tabular text-base font-semibold text-fg">
          {Number.isFinite(data?.active_cryptocurrencies) ? data.active_cryptocurrencies.toLocaleString() : "–"}
        </span>
      </Stat>
    </Card>
  );
}

export default memo(MarketStats);
