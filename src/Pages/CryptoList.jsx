import React, { useCallback, useState } from "react";
import { useSearchParams } from "react-router-dom";
import MarketStats from "@/Components/Crypto/MarketStats";
import MarketHighlights from "@/Components/Crypto/MarketHighlights";
import MarketInsights from "@/Components/Crypto/MarketInsights";
import CoinTable from "@/Components/Crypto/CoinTable";
import CoinQuickView from "@/Components/Crypto/CoinQuickView";
import TradeModal from "@/Components/TradeModal";
import PriceAlertModal from "@/Components/Common/PriceAlertModal";
import { Segmented } from "@/Components/ui/segmented";
import { usePurchasedCoins } from "@/hooks/usePurchasedCoins";

const VIEWS = [
  { value: "overview", label: "Overview" },
  { value: "insights", label: "Insights" },
];

/** Markets: global stats, then either the top-100 table or market insights */
function CryptoList() {
  const { purchasedCoins } = usePurchasedCoins();
  const [params, setParams] = useSearchParams();
  const view = params.get("view") === "insights" ? "insights" : "overview";
  const [tradeCoin, setTradeCoin] = useState(null);
  const [tradeOpen, setTradeOpen] = useState(false);
  const [alertCoin, setAlertCoin] = useState(null);
  const [alertOpen, setAlertOpen] = useState(false);
  const [viewCoin, setViewCoin] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);

  // Coins stay set while the modals animate out
  const openTrade = useCallback((coin) => {
    setViewOpen(false);
    setTradeCoin(coin);
    setTradeOpen(true);
  }, []);
  const closeTrade = useCallback(() => setTradeOpen(false), []);
  const openAlert = useCallback((coin) => {
    setAlertCoin(coin);
    setAlertOpen(true);
  }, []);
  const closeAlert = useCallback(() => setAlertOpen(false), []);
  const openView = useCallback((coin) => {
    setViewCoin(coin);
    setViewOpen(true);
  }, []);
  const closeView = useCallback(() => setViewOpen(false), []);

  const selectView = (value) => setParams(value === "overview" ? {} : { view: value }, { replace: true });

  return (
    <div className="mx-auto max-w-[1600px] space-y-4 px-3 py-4 sm:p-0 lg:space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-fg sm:text-2xl">Markets</h1>
          <p className="mt-0.5 text-sm text-fg-subtle">
            {view === "insights" ? "How the top 100 cryptocurrencies are moving, at a glance." : "Live prices for the top 100 cryptocurrencies by market cap."}
          </p>
        </div>
        <Segmented label="Markets view" options={VIEWS} value={view} onChange={selectView} size="md" />
      </header>

      <MarketStats />
      {view === "insights" ? (
        <MarketInsights onSelect={openView} />
      ) : (
        <>
          <MarketHighlights />
          <CoinTable onTrade={openTrade} onAlert={openAlert} />
        </>
      )}

      <CoinQuickView coin={viewCoin} open={viewOpen} onClose={closeView} onTrade={openTrade} />
      <TradeModal show={tradeOpen} onClose={closeTrade} coin={tradeCoin} type="buy" purchasedCoins={purchasedCoins} />
      <PriceAlertModal show={alertOpen} onClose={closeAlert} coin={alertCoin} />
    </div>
  );
}

export default CryptoList;
