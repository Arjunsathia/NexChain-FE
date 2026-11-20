import React, { memo, useMemo } from "react";
import { useSelector } from "react-redux";
import { Wallet, PieChart, TrendingUp, Landmark } from "lucide-react";
import { useLivePortfolio } from "@/hooks/useLivePortfolio";
import { useBinanceTicker } from "@/hooks/useBinanceTicker";
import { Card } from "@/Components/ui/card";
import { Delta } from "@/Components/ui/delta";
import { Skeleton } from "@/Components/ui/skeleton";
import { formatUSD } from "@/utils/format";
import useMediaQuery from "@/hooks/useMediaQuery";
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

/** Phones: one card with equity as the headline, cash and holdings side by side */
const PhoneSummary = ({ equity, cash, holdingsValue, unrealized, unrealizedPct, totalReturn, totalReturnPct, loading, signed }) => (
  <Card className="p-4">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-xs font-medium text-fg-muted">Total equity</p>
        {loading ? (
          <Skeleton className="mt-2 h-8 w-40" />
        ) : (
          <p className="tabular mt-1 text-[28px] font-semibold leading-tight tracking-tight text-fg">{formatUSD(equity)}</p>
        )}
        {loading ? (
          <Skeleton className="mt-2 h-4 w-32" />
        ) : (
          <p className="mt-1 flex flex-wrap items-center gap-x-1.5 text-xs">
            <span className={cn("tabular font-semibold", totalReturn >= 0 ? "text-up" : "text-down")}>{signed(totalReturn)}</span>
            <Delta value={totalReturnPct} />
            <span className="text-fg-subtle">since $10,000 start</span>
          </p>
        )}
      </div>
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand" aria-hidden="true">
        <Landmark size={18} />
      </span>
    </div>
    <dl className="mt-5 grid grid-cols-2 divide-x divide-line border-t border-line pt-4">
      <div className="min-w-0 pr-3">
        <dt className="flex items-center gap-1.5 text-xs text-fg-muted"><Wallet size={13} aria-hidden="true" /> Available cash</dt>
        <dd className="tabular mt-1 truncate text-base font-semibold text-fg">{loading ? <Skeleton className="h-5 w-20" /> : formatUSD(cash)}</dd>
        <dd className="text-xs text-fg-subtle">{!loading && equity > 0 ? `${((cash / equity) * 100).toFixed(0)}% of equity` : " "}</dd>
      </div>
      <div className="min-w-0 pl-3">
        <dt className="flex items-center gap-1.5 text-xs text-fg-muted"><PieChart size={13} aria-hidden="true" /> Holdings</dt>
        <dd className="tabular mt-1 truncate text-base font-semibold text-fg">{loading ? <Skeleton className="h-5 w-20" /> : formatUSD(holdingsValue)}</dd>
        <dd className="text-xs">
          {loading ? " " : unrealizedPct === null ? <span className="text-fg-subtle">No open positions</span> : (
            <span className="flex flex-wrap items-center gap-x-1">
              <span className={cn("tabular whitespace-nowrap", unrealized >= 0 ? "text-up" : "text-down")}>{signed(unrealized)}</span>
              <Delta value={unrealizedPct} />
            </span>
          )}
        </dd>
      </div>
    </dl>
  </Card>
);

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
  const isPhone = useMediaQuery("(max-width: 639px)");

  if (isPhone) {
    return (
      <PhoneSummary
        {...{ equity, cash, holdingsValue, unrealized, unrealizedPct, totalReturn, totalReturnPct, loading, signed }}
      />
    );
  }

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
            <span className="flex flex-wrap items-center gap-x-1.5">
              <span className={cn("tabular whitespace-nowrap", unrealized >= 0 ? "text-up" : "text-down")}>{signed(unrealized)}</span>
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
