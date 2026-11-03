import React, { memo, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { History, ArrowRight, ArrowLeftRight } from "lucide-react";
import { usePurchasedCoins } from "@/hooks/usePurchasedCoins";
import useCoinContext from "@/hooks/useCoinContext";
import { Card, CardHeader, CardLink, EmptyState } from "@/Components/ui/card";
import { SkeletonRows } from "@/Components/ui/skeleton";
import { CoinAvatar } from "@/Components/ui/coin-avatar";
import { formatUSD } from "@/utils/format";
import { cn } from "@/utils/utils";

const dateFormat = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const when = (tx) => new Date(tx.transactionDate || tx.purchase_date || 0);

/** Latest buys and sells */
function RecentTradesCard() {
  const navigate = useNavigate();
  const { transactionHistory, loading } = usePurchasedCoins();
  const { coins } = useCoinContext();
  // Current market logos; the stored trade image is only a fallback
  const logos = useMemo(() => new Map(coins.map((c) => [c.id, c.image])), [coins]);

  const trades = useMemo(
    () => [...transactionHistory].sort((a, b) => when(b) - when(a)).slice(0, 5),
    [transactionHistory],
  );

  return (
    <Card className="flex h-full flex-col">
      <CardHeader
        icon={History}
        title="Recent activity"
        action={
          <CardLink onClick={() => navigate("/portfolio")}>
            History <ArrowRight size={12} />
          </CardLink>
        }
      />
      {loading && trades.length === 0 ? (
        <SkeletonRows rows={5} />
      ) : trades.length === 0 ? (
        <EmptyState
          icon={ArrowLeftRight}
          title="No trades yet"
          description="Your buys and sells will show up here."
          className="flex-1"
        />
      ) : (
        <ul className="divide-y divide-line">
          {trades.map((tx, i) => {
            const isBuy = tx.type === "buy";
            const total = tx.totalValue ?? tx.total_cost ?? 0;
            return (
              <li key={tx._id || tx.id || i} className="flex items-center gap-3 px-4 py-2.5">
                <CoinAvatar src={logos.get(tx.coin_id) || tx.image} symbol={tx.coinSymbol} size={30} />
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 text-sm font-semibold text-fg">
                    <span
                      className={cn(
                        "rounded px-1.5 py-px text-[10px] font-bold uppercase",
                        isBuy ? "bg-up-soft text-up" : "bg-down-soft text-down",
                      )}
                    >
                      {isBuy ? "Buy" : "Sell"}
                    </span>
                    {tx.coinSymbol?.toUpperCase()}
                  </p>
                  <p className="truncate text-xs text-fg-subtle">{dateFormat.format(when(tx))}</p>
                </div>
                <div className="text-right">
                  <p className="tabular text-sm font-medium text-fg">
                    {isBuy ? "−" : "+"}
                    {formatUSD(total)}
                  </p>
                  <p className="tabular text-xs text-fg-subtle">
                    {Number(tx.quantity || 0).toLocaleString(undefined, { maximumFractionDigits: 6 })}{" "}
                    {tx.coinSymbol?.toUpperCase()}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}

export default memo(RecentTradesCard);
