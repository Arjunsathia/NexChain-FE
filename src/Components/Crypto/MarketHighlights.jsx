import React, { memo, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Flame, TrendingUp, TrendingDown, CloudOff } from "lucide-react";
import useCoinContext from "@/hooks/useCoinContext";
import useMediaQuery from "@/hooks/useMediaQuery";
import { Card, CardHeader, EmptyState } from "@/Components/ui/card";
import { Segmented } from "@/Components/ui/segmented";
import { SkeletonRows } from "@/Components/ui/skeleton";
import { formatCompact } from "@/utils/format";
import { isStablecoin } from "@/utils/coinRegistry";
import LiveCoinRow from "./LiveCoinRow";

const LISTS = [
  { value: "volume", label: "Most traded", icon: Flame, subtitle: "24h volume, excl. stablecoins" },
  { value: "gainers", label: "Top gainers", icon: TrendingUp, subtitle: "Best 24h change" },
  { value: "losers", label: "Top losers", icon: TrendingDown, subtitle: "Worst 24h change" },
];
const SIZE = 4;

function HighlightRows({ coins, loading, kind }) {
  const navigate = useNavigate();
  if (loading) return <SkeletonRows rows={SIZE} />;
  if (coins.length === 0) {
    return <EmptyState icon={CloudOff} title="Market data unavailable" description="Retrying automatically." />;
  }
  return (
    <div className="divide-y divide-line">
      {coins.map((c) => (
        <LiveCoinRow
          key={c.id}
          id={c.id}
          symbol={c.symbol}
          name={c.name}
          image={c.image}
          price={c.current_price}
          change={c.price_change_percentage_24h}
          meta={kind === "volume" ? `Vol $${formatCompact(c.total_volume || 0)}` : c.name}
          onClick={() => navigate(`/coin/coin-details/${c.id}`)}
        />
      ))}
    </div>
  );
}

/** Three short lists above the market table: most traded, gainers and losers */
function MarketHighlights() {
  const { coins, coinsLoading } = useCoinContext();
  const isWide = useMediaQuery("(min-width: 1024px)");
  const [active, setActive] = useState("volume");
  const loading = coinsLoading && coins.length === 0;

  const lists = useMemo(() => {
    const byChange = coins
      .filter((c) => Number.isFinite(c.price_change_percentage_24h))
      .sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h);
    return {
      volume: coins
        .filter((c) => !isStablecoin(c))
        .sort((a, b) => (b.total_volume || 0) - (a.total_volume || 0))
        .slice(0, SIZE),
      gainers: byChange.slice(0, SIZE),
      losers: byChange.slice(-SIZE).reverse(),
    };
  }, [coins]);

  // Only one layout is mounted, so rows don't subscribe to prices twice
  if (!isWide) {
    const current = LISTS.find((l) => l.value === active);
    return (
      <Card>
        <div className="px-4 pt-4 pb-2">
          <Segmented label="Highlights" options={LISTS} value={active} onChange={setActive} className="w-full [&>button]:flex-1" />
        </div>
        <p className="px-4 pb-1 text-xs text-fg-subtle">{current.subtitle}</p>
        <HighlightRows coins={lists[active]} loading={loading} kind={active} />
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-4 lg:gap-5">
      {LISTS.map((list) => (
        <Card key={list.value}>
          <CardHeader icon={list.icon} title={list.label} subtitle={list.subtitle} className="pb-2" />
          <HighlightRows coins={lists[list.value]} loading={loading} kind={list.value} />
        </Card>
      ))}
    </div>
  );
}

export default memo(MarketHighlights);
