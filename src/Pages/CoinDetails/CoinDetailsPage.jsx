import React, { useCallback, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, SearchX } from "lucide-react";
import toast from "react-hot-toast";
import { getCoinById } from "@/api/coinApis";
import useUserContext from "@/hooks/useUserContext";
import useCoinContext from "@/hooks/useCoinContext";
import useWatchlistToggle from "@/hooks/useWatchlistToggle";
import { usePurchasedCoins } from "@/hooks/usePurchasedCoins";
import { useLivePortfolio } from "@/hooks/useLivePortfolio";
import { useLivePrice } from "@/hooks/useBinanceTicker";
import { getBinancePair } from "@/utils/coinRegistry";
import { toCoinInfo } from "@/utils/coinDetails";
import { Card, EmptyState } from "@/Components/ui/card";
import { Skeleton } from "@/Components/ui/skeleton";
import TradeModal from "@/Components/TradeModal";
import PriceAlertModal from "@/Components/Common/PriceAlertModal";
import CoinHero from "@/Components/CoinDetails/CoinHero";
import PriceChart from "@/Components/CoinDetails/PriceChart";
import { AboutCard, MarketActivityCard, MarketStatsCard, PositionCard } from "@/Components/CoinDetails/CoinPanels";

const PageSkeleton = () => (
  <div className="space-y-4 lg:space-y-5" aria-busy="true">
    <Skeleton className="h-[188px] w-full rounded-xl" />
    <div className="grid grid-cols-1 gap-4 lg:gap-5 xl:grid-cols-12">
      <Skeleton className="h-[540px] rounded-xl xl:col-span-8" />
      <Skeleton className="h-[540px] rounded-xl xl:col-span-4" />
    </div>
  </div>
);

/**
 * One coin: live price and actions, a line/candlestick chart, the Binance
 * order book and trades, market stats, your position and the project profile.
 */
function CoinDetailsPage() {
  const { coinId } = useParams();
  const location = useLocation();
  const { user } = useUserContext();
  const { coins, coinsLoading } = useCoinContext();
  const { purchasedCoins } = usePurchasedCoins();
  const { groupedHoldings } = useLivePortfolio();
  const { ids: watchedIds, toggle: toggleWatch } = useWatchlistToggle();

  // The markets row renders the page instantly; the full document fills in the rest
  const marketRow = useMemo(() => {
    const fromList = Array.isArray(coins) ? coins.find((c) => c.id === coinId) : null;
    const passed = location.state?.coin;
    return fromList || (passed?.id === coinId && passed.current_price != null ? passed : null);
  }, [coins, coinId, location.state]);

  const { data: full, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["coin", coinId],
    queryFn: () => getCoinById(coinId),
    enabled: !!coinId,
    staleTime: 5 * 60_000,
    retry: 1,
  });

  const info = useMemo(() => toCoinInfo(full, marketRow), [full, marketRow]);
  const live = useLivePrice(coinId, info?.symbol);
  const pair = getBinancePair(coinId, info?.symbol);

  const price = live?.current_price ?? info?.price;
  const change24h = live?.price_change_percentage_24h ?? info?.change24h;
  const high24h = live?.high_24h ?? info?.high24h;
  const low24h = live?.low_24h ?? info?.low24h;
  const volume = live?.total_volume ?? info?.volume;

  const holding = useMemo(() => groupedHoldings.find((h) => h.coinId === coinId && h.totalQuantity > 0), [groupedHoldings, coinId]);

  // Modals keep their coin while animating out
  const [tradeOpen, setTradeOpen] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const tradeCoin = useMemo(() => (info ? { ...info.marketCoin, current_price: price ?? info.marketCoin.current_price } : null), [info, price]);

  const openTrade = useCallback(() => {
    if (!user) return toast.error("Please sign in to trade");
    setTradeOpen(true);
  }, [user]);
  const onToggleWatch = useCallback(() => tradeCoin && toggleWatch(tradeCoin), [toggleWatch, tradeCoin]);

  if (!info) {
    const paused = isError && /unavailable/i.test(error?.message);
    const notFound = error?.response?.status === 404;
    return (
      <div className="mx-auto max-w-[1600px] px-3 py-4 sm:p-0">
        {isLoading || isFetching || coinsLoading ? (
          <PageSkeleton />
        ) : (
          <Card>
            <EmptyState
              icon={SearchX}
              title={paused ? "This coin is unavailable" : notFound ? "Coin not found" : "Couldn't load this coin"}
              description={
                paused
                  ? "An admin has paused this coin. You can still sell it from your portfolio."
                  : notFound
                    ? "There's no coin at this address. Check the link or find it in Markets."
                    : "The market-data provider is busy right now. Try again in a moment."
              }
              action={
                <div className="mt-2 flex gap-2">
                  {!paused && !notFound && (
                    <button
                      type="button"
                      onClick={() => refetch()}
                      className="rounded-lg border border-line px-3.5 py-2 text-sm font-semibold text-fg transition-colors hover:bg-surface-hover"
                    >
                      Try again
                    </button>
                  )}
                  <Link to="/cryptolist" className="rounded-lg bg-brand px-3.5 py-2 text-sm font-semibold text-brand-fg">
                    Back to Markets
                  </Link>
                </div>
              }
              className="py-16"
            />
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1600px] space-y-4 px-3 py-4 sm:p-0 lg:space-y-5">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs text-fg-subtle">
        <Link to="/cryptolist" className="transition-colors hover:text-fg">
          Markets
        </Link>
        <ChevronRight size={13} aria-hidden="true" />
        <span className="font-medium text-fg" aria-current="page">
          {info.name}
        </span>
      </nav>

      <CoinHero
        info={info}
        price={price}
        change24h={change24h}
        volume={volume}
        holding={holding?.totalQuantity || 0}
        watched={watchedIds.has(coinId)}
        onToggleWatch={onToggleWatch}
        onAlert={() => setAlertOpen(true)}
        onTrade={openTrade}
      />

      <div className="grid grid-cols-1 items-start gap-4 lg:gap-5 xl:grid-cols-12">
        <div className="min-w-0 space-y-4 lg:space-y-5 xl:col-span-8">
          <PriceChart key={coinId} coinId={coinId} symbol={info.symbol} />
          {full ? (
            <AboutCard info={info} />
          ) : isLoading ? (
            <Skeleton className="h-[220px] w-full rounded-xl" />
          ) : null}
        </div>

        <div className="min-w-0 space-y-4 lg:space-y-5 xl:col-span-4">
          {holding && <PositionCard holding={holding} price={price} symbol={info.symbol} />}
          <MarketActivityCard key={coinId} pair={pair} symbol={info.symbol} />
          <MarketStatsCard info={info} price={price} high24h={high24h} low24h={low24h} />
        </div>
      </div>

      <TradeModal show={tradeOpen} onClose={() => setTradeOpen(false)} coin={tradeCoin} type="buy" purchasedCoins={purchasedCoins} />
      <PriceAlertModal show={alertOpen} onClose={() => setAlertOpen(false)} coin={tradeCoin} />
    </div>
  );
}

export default CoinDetailsPage;
