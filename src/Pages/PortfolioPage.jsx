import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { ArrowLeftRight, RotateCcw } from "lucide-react";
import { postForm, RATE_LIMIT_TOAST } from "@/api/axiosConfig";
import { useLivePortfolio } from "@/hooks/useLivePortfolio";
import { usePurchasedCoins } from "@/hooks/usePurchasedCoins";
import { useBinanceTicker } from "@/hooks/useBinanceTicker";
import { useOpenOrders } from "@/hooks/useOpenOrders";
import { trackCoin } from "@/lib/tickerStore";
import { refreshBalance } from "@/redux/slices/walletSlice";
import { fetchPurchasedCoins, fetchTransactionHistory } from "@/redux/slices/portfolioSlice";
import { Card } from "@/Components/ui/card";
import AccountSummary from "@/Components/Dashboard/AccountSummary";
import PerformanceChart from "@/Components/portfolio/PerformanceChart";
import AllocationCard from "@/Components/portfolio/AllocationCard";
import HoldingsTable from "@/Components/portfolio/HoldingsTable";
import OpenOrdersTable from "@/Components/portfolio/OpenOrdersTable";
import TransactionHistory from "@/Components/portfolio/TransactionHistory";
import TradeModal from "@/Components/TradeModal";
import PriceAlertModal from "@/Components/Common/PriceAlertModal";
import ConfirmDialog from "@/Components/Common/ConfirmDialog";
import { cn } from "@/utils/utils";

const TABS = ["positions", "orders", "history"];

/** Positions, open orders and trade history, valued at live prices */
const PortfolioPage = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const balance = useSelector((state) => state.wallet.balance);
  const { groupedHoldings, loading } = useLivePortfolio();
  const { purchasedCoins, transactionHistory, loading: historyLoading } = usePurchasedCoins();
  const { orders, refetch: refetchOrders } = useOpenOrders();
  const live = useBinanceTicker();

  const [params, setParams] = useSearchParams();
  const tab = TABS.includes(params.get("tab")) ? params.get("tab") : "positions";
  const setTab = (next) => setParams(next === "positions" ? {} : { tab: next }, { replace: true });

  const [trade, setTrade] = useState({ open: false, coin: null, type: "buy" });
  const [alert, setAlert] = useState({ open: false, coin: null });
  const [confirmReset, setConfirmReset] = useState(false);
  const [resetting, setResetting] = useState(false);

  // Stream live prices for holdings outside the core coin list too
  useEffect(() => {
    groupedHoldings.forEach((h) => trackCoin(h.coinId, h.coinSymbol));
  }, [groupedHoldings]);

  const positions = useMemo(() => {
    const rows = groupedHoldings.map((h) => {
      const ticker = live[h.coinId];
      const price = ticker?.current_price ?? h.currentPrice ?? 0;
      const quantity = h.totalQuantity || 0;
      const cost = h.remainingInvestment || 0;
      const value = quantity * price;
      return {
        coinId: h.coinId,
        symbol: h.coinSymbol?.toUpperCase(),
        name: h.coinName,
        image: h.marketData?.image || h.image,
        quantity,
        cost,
        avgCost: quantity > 0 ? cost / quantity : 0,
        price,
        change24: ticker?.price_change_percentage_24h ?? h.priceChange24h,
        value,
        pnl: value - cost,
        pnlPct: cost > 0 ? ((value - cost) / cost) * 100 : 0,
      };
    });
    const total = rows.reduce((s, r) => s + r.value, 0);
    return rows.map((r) => ({ ...r, allocation: total > 0 ? (r.value / total) * 100 : 0 }));
  }, [groupedHoldings, live]);

  // Editing or cancelling an order changes how much cash is reserved for it
  const onOrdersChanged = useCallback(() => {
    refetchOrders();
    dispatch(refreshBalance());
  }, [refetchOrders, dispatch]);

  const toTradeCoin = (p) => ({ id: p.coinId, symbol: p.symbol, name: p.name, image: p.image, current_price: p.price });
  const onBuy = useCallback((p) => setTrade({ open: true, coin: toTradeCoin(p), type: "buy" }), []);
  const onSell = useCallback((p) => setTrade({ open: true, coin: toTradeCoin(p), type: "sell" }), []);
  const onAlert = useCallback((p) => setAlert({ open: true, coin: toTradeCoin(p) }), []);

  const resetAccount = async () => {
    setConfirmReset(false);
    setResetting(true);
    try {
      const res = await postForm("/purchases/reset-balance", {});
      if (!res.success) throw new Error(res.error);
      toast.success("Account reset to $10,000");
      dispatch(refreshBalance());
      dispatch(fetchPurchasedCoins());
      dispatch(fetchTransactionHistory());
      refetchOrders();
      queryClient.invalidateQueries({ queryKey: ["performance"] });
    } catch (error) {
      const message = error.response?.data?.error || error.message || "Couldn't reset the account";
      // The 24h cooldown answers 429; replace the generic rate-limit toast
      toast.error(message, error.response?.status === 429 ? { id: RATE_LIMIT_TOAST } : undefined);
    } finally {
      setResetting(false);
    }
  };

  const counts = { positions: positions.length, orders: orders.length, history: transactionHistory.length };
  const labels = { positions: "Positions", orders: "Open orders", history: "Trade history" };
  // Phones show short labels so all three tabs fit side by side
  const shortLabels = { positions: "Positions", orders: "Orders", history: "History" };
  const portfolioLoading = loading && groupedHoldings.length === 0;

  return (
    <div className="mx-auto flex max-w-[1600px] flex-col gap-5 px-4 py-5 sm:block sm:space-y-4 sm:p-0 lg:space-y-5">
      {/* Phones: title and actions on one row; positions come right after the summary */}
      <header className="flex items-center justify-between gap-3 sm:items-end">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold tracking-tight text-fg sm:text-2xl">Portfolio</h1>
          <p className="mt-0.5 text-sm text-fg-subtle max-sm:hidden">Your positions, orders and trades, valued at live prices.</p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => setConfirmReset(true)}
            disabled={resetting}
            aria-label="Reset account"
            title="Reset account"
            className="inline-flex size-10 items-center justify-center gap-2 rounded-full border border-line bg-surface text-sm font-semibold text-fg-muted transition-colors hover:border-down hover:text-down disabled:opacity-50 sm:size-auto sm:rounded-lg sm:px-3.5 sm:py-2"
          >
            <RotateCcw size={15} className={resetting ? "animate-spin" : ""} />
            <span className="max-sm:hidden">Reset account</span>
          </button>
          <Link
            to="/cryptolist"
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-brand-fg transition-colors hover:bg-brand-hover sm:min-h-0 sm:rounded-lg sm:px-3.5"
          >
            <ArrowLeftRight size={16} /> Trade
          </Link>
        </div>
      </header>

      <AccountSummary />

      <div className="grid gap-5 max-sm:order-4 sm:gap-4 lg:gap-5 xl:grid-cols-12">
        <div className="min-w-0 xl:col-span-8">
          <PerformanceChart holdingsCount={groupedHoldings.length} />
        </div>
        <div className="min-w-0 xl:col-span-4">
          <AllocationCard positions={positions} cash={Number(balance) || 0} loading={portfolioLoading} />
        </div>
      </div>

      <Card className="max-sm:order-3">
        <div role="tablist" aria-label="Portfolio sections" className="flex gap-1 overflow-x-auto border-b border-line px-2 no-scrollbar">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={cn(
                "relative flex min-h-12 flex-1 shrink-0 items-center justify-center gap-1.5 px-2 py-3 text-sm font-medium transition-colors sm:flex-none sm:justify-start sm:gap-2 sm:px-3",
                "after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full",
                tab === t ? "text-fg after:bg-brand" : "text-fg-muted hover:text-fg",
              )}
            >
              <span className="sm:hidden">{shortLabels[t]}</span>
              <span className="hidden sm:inline">{labels[t]}</span>
              {counts[t] > 0 && (
                <span className={cn("tabular rounded-full px-1.5 py-px text-2xs", tab === t ? "bg-brand-soft text-brand" : "bg-surface-2 text-fg-subtle")}>
                  {counts[t]}
                </span>
              )}
            </button>
          ))}
        </div>
        {tab === "positions" && (
          <HoldingsTable positions={positions} loading={portfolioLoading} onBuy={onBuy} onSell={onSell} onAlert={onAlert} />
        )}
        {tab === "orders" && <OpenOrdersTable orders={orders} onChanged={onOrdersChanged} />}
        {tab === "history" && <TransactionHistory transactions={transactionHistory} loading={historyLoading} />}
      </Card>

      <TradeModal
        show={trade.open}
        onClose={() => setTrade((t) => ({ ...t, open: false }))}
        coin={trade.coin}
        type={trade.type}
        purchasedCoins={purchasedCoins}
      />
      <PriceAlertModal show={alert.open} onClose={() => setAlert((a) => ({ ...a, open: false }))} coin={alert.coin} />
      <ConfirmDialog
        show={confirmReset}
        onClose={() => setConfirmReset(false)}
        onConfirm={resetAccount}
        title="Reset your account?"
        message="Your cash goes back to $10,000, all holdings are removed and open orders are cancelled. Trade history is kept. You can reset once every 24 hours."
        confirmText="Reset account"
        variant="danger"
        icon={RotateCcw}
      />
    </div>
  );
};

export default PortfolioPage;
