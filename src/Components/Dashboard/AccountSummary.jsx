import React, { memo, useMemo } from "react";
import { useSelector } from "react-redux";
import { Wallet, PieChart, TrendingUp, Landmark } from "lucide-react";
import { useLivePortfolio } from "@/hooks/useLivePortfolio";
import { useBinanceTicker } from "@/hooks/useBinanceTicker";
import { Card } from "@/Components/ui/card";
import { Delta } from "@/Components/ui/delta";
import { Skeleton } from "@/Components/ui/skeleton";
import { formatUSD } from "@/utils/format";
import { cn } from "@/utils/utils";

// Every account starts with this much virtual cash (userModel virtualBalance default)
const STARTING_BALANCE = 10000;

const Stat = memo(({ icon: Icon, label, value, footer, loading, emphasis }) => (
  <Card className="p-4">
    <div className="flex items-center justify-between">
      <span className="text-xs font-medium text-fg-muted">{label}</span>
      <Icon size={16} className="text-fg-subtle" />
    </div>
    {loading ? (
      <>
        <Skeleton className="mt-3 h-7 w-32" />
        <Skeleton className="mt-2 h-3.5 w-24" />
      </>
    ) : (
      <>
        <p className={cn("tabular mt-2 font-semibold tracking-tight text-fg", emphasis ? "text-2xl" : "text-xl sm:text-2xl")}>
          {value}
        </p>
        <div className="mt-1 min-h-5 text-xs text-fg-subtle">{footer}</div>
      </>
    )}
  </Card>
));
Stat.displayName = "Stat";

/** Equity, cash, holdings and all-time return, valued at live prices */
export default function AccountSummary() {
  const balance = useSelector((state) => state.wallet.balance);
  const walletLoading = useSelector((state) => state.wallet.loading);
  const { groupedHoldings, loading: portfolioLoading } = useLivePortfolio();
  const live = useBinanceTicker();

  const { holdingsValue, costBasis } = useMemo(() => {
    let value = 0;
    let cost = 0;
    groupedHoldings.forEach((h) => {
      const price = live[h.coinId]?.current_price ?? h.currentPrice ?? 0;
      value += (h.totalQuantity || 0) * price;
      cost += h.remainingInvestment || 0;
    });
    return { holdingsValue: value, costBasis: cost };
  }, [groupedHoldings, live]);

  const cash = Number(balance) || 0;
  const equity = cash + holdingsValue;
  const unrealized = holdingsValue - costBasis;
  const unrealizedPct = costBasis > 0 ? (unrealized / costBasis) * 100 : null;
  const totalReturn = equity - STARTING_BALANCE;
  const totalReturnPct = (totalReturn / STARTING_BALANCE) * 100;
  const loading = (walletLoading && !balance) || (portfolioLoading && groupedHoldings.length === 0);
  const signed = (n) => `${n >= 0 ? "+" : "−"}${formatUSD(Math.abs(n))}`;

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
      <Stat
        icon={Landmark}
        label="Total equity"
        value={formatUSD(equity)}
        emphasis
        loading={loading}
        footer={
          <>
            Cash + holdings<span className="hidden sm:inline"> at market price</span>
          </>
        }
      />
      <Stat
        icon={Wallet}
        label="Available cash"
        value={formatUSD(cash)}
        loading={loading}
        footer={equity > 0 ? `${((cash / equity) * 100).toFixed(0)}% of equity` : null}
      />
      <Stat
        icon={PieChart}
        label="Holdings value"
        value={formatUSD(holdingsValue)}
        loading={loading}
        footer={
          unrealizedPct === null ? (
            "No open positions"
          ) : (
            <span className="flex items-center gap-1.5">
              <span className={cn("tabular", unrealized >= 0 ? "text-up" : "text-down")}>{signed(unrealized)}</span>
              <Delta value={unrealizedPct} />
            </span>
          )
        }
      />
      <Stat
        icon={TrendingUp}
        label="Total return"
        value={<span className={totalReturn >= 0 ? "text-up" : "text-down"}>{signed(totalReturn)}</span>}
        loading={loading}
        footer={
          <span className="flex items-center gap-1.5">
            <Delta value={totalReturnPct} />
            <span className="hidden sm:inline">since $10,000 start</span>
          </span>
        }
      />
    </div>
  );
}
