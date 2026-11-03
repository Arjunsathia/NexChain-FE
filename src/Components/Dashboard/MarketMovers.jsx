import React, { memo, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Activity, ArrowRight } from "lucide-react";
import useCoinContext from "@/hooks/useCoinContext";
import { Card, CardHeader, CardLink, EmptyState } from "@/Components/ui/card";
import { Segmented } from "@/Components/ui/segmented";
import { SkeletonRows } from "@/Components/ui/skeleton";
import LiveCoinRow from "@/Components/Crypto/LiveCoinRow";

const VIEWS = [
  { label: "Gainers", value: "gainers" },
  { label: "Losers", value: "losers" },
];

/** Biggest 24h movers among the top coins by market cap */
function MarketMovers() {
  const navigate = useNavigate();
  const { coins, coinsLoading } = useCoinContext();
  const [view, setView] = useState("gainers");

  const movers = useMemo(() => {
    const ranked = coins
      .filter((c) => Number.isFinite(c.price_change_percentage_24h))
      .sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h);
    return view === "gainers" ? ranked.slice(0, 5) : ranked.slice(-5).reverse();
  }, [coins, view]);

  return (
    <Card className="flex h-full flex-col">
      <CardHeader
        icon={Activity}
        title="Market movers"
        subtitle="24h change, top 100 coins"
        action={
          <CardLink onClick={() => navigate("/cryptolist")}>
            Markets <ArrowRight size={12} />
          </CardLink>
        }
      />
      <div className="px-4 pb-2">
        <Segmented label="Movers" options={VIEWS} value={view} onChange={setView} className="w-full [&>button]:flex-1" />
      </div>
      {coinsLoading && coins.length === 0 ? (
        <SkeletonRows rows={5} />
      ) : movers.length === 0 ? (
        <EmptyState icon={Activity} title="Market data unavailable" description="Prices will appear once the feed responds." />
      ) : (
        <div className="divide-y divide-line">
          {movers.map((c) => (
            <LiveCoinRow
              key={c.id}
              id={c.id}
              symbol={c.symbol}
              name={c.name}
              image={c.image}
              price={c.current_price}
              change={c.price_change_percentage_24h}
              onClick={() => navigate(`/coin/coin-details/${c.id}`)}
            />
          ))}
        </div>
      )}
    </Card>
  );
}

export default memo(MarketMovers);
