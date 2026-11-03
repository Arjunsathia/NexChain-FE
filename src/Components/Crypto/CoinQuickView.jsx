import React, { memo } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { useLivePrice } from "@/hooks/useBinanceTicker";
import { Modal, ModalHeader, ModalTitle } from "@/Components/ui/modal";
import { CoinAvatar } from "@/Components/ui/coin-avatar";
import { Delta } from "@/Components/ui/delta";
import { FlashPrice } from "./LiveCoinRow";
import Sparkline from "./Sparkline";
import DayRange from "./DayRange";
import { formatCompact, formatPrice } from "@/utils/format";

const usd = (v) => (Number.isFinite(v) ? `$${formatCompact(v, 2)}` : "–");
const amount = (v) => (Number.isFinite(v) ? formatCompact(v, 2) : "–");

const Stat = ({ label, children, hint }) => (
  <div className="min-w-0 rounded-lg bg-surface-2/60 px-3 py-2.5">
    <p className="text-[11px] text-fg-subtle">{label}</p>
    <p className="tabular mt-0.5 truncate text-sm font-semibold text-fg">{children}</p>
    {hint && <div className="mt-0.5 text-[11px]">{hint}</div>}
  </div>
);

function QuickViewBody({ coin, onClose, onTrade }) {
  const live = useLivePrice(coin.id, coin.symbol);
  const price = live?.current_price ?? coin.current_price;
  const change = live?.price_change_percentage_24h ?? coin.price_change_percentage_24h;
  const supplyPct = coin.max_supply ? (coin.circulating_supply / coin.max_supply) * 100 : null;

  return (
    <>
      <ModalHeader onClose={onClose}>
        <div className="flex items-center gap-3">
          <CoinAvatar src={coin.image} symbol={coin.symbol} size={40} />
          <div className="min-w-0">
            <ModalTitle className="truncate text-base font-semibold text-fg">{coin.name}</ModalTitle>
            <p className="flex items-center gap-1.5 text-xs text-fg-subtle">
              {coin.symbol?.toUpperCase()}
              {coin.market_cap_rank && <span className="rounded bg-surface-2 px-1 py-px font-medium">#{coin.market_cap_rank}</span>}
            </p>
          </div>
        </div>
      </ModalHeader>

      <div className="space-y-5 px-5 pb-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <FlashPrice value={price} className="text-2xl font-semibold tracking-tight text-fg" />
            <div className="mt-1 flex items-center gap-2 text-xs text-fg-subtle">
              <Delta value={change} pill /> 24h
              <Delta value={coin.price_change_percentage_7d_in_currency} className="ml-1" /> 7d
            </div>
          </div>
          <div className="text-right">
            <Sparkline data={coin.sparkline_in_7d?.price} width={150} height={44} />
            <p className="mt-0.5 text-[11px] text-fg-subtle">Last 7 days</p>
          </div>
        </div>

        <DayRange low={coin.low_24h} high={coin.high_24h} price={price} />

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          <Stat label="Market cap">{usd(coin.market_cap)}</Stat>
          <Stat label="24h volume">{usd(coin.total_volume)}</Stat>
          <Stat label="Volume / market cap">
            {coin.market_cap ? `${((coin.total_volume / coin.market_cap) * 100).toFixed(2)}%` : "–"}
          </Stat>
          <Stat label="All-time high" hint={<Delta value={coin.ath_change_percentage} className="text-[11px]" />}>
            {formatPrice(coin.ath)}
          </Stat>
          <Stat label="Circulating supply" hint={supplyPct != null && <span className="text-fg-subtle">{supplyPct.toFixed(0)}% of max</span>}>
            {amount(coin.circulating_supply)}
          </Stat>
          <Stat label="Max supply">{coin.max_supply ? amount(coin.max_supply) : "No cap"}</Stat>
        </div>

        <div className="flex gap-2">
          <Link
            to={`/coin/coin-details/${coin.id}`}
            onClick={onClose}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-line px-4 py-2.5 text-sm font-semibold text-fg transition-colors hover:bg-surface-hover"
          >
            Full details <ArrowUpRight size={15} />
          </Link>
          {onTrade && (
            <button
              type="button"
              onClick={() => onTrade(coin)}
              className="flex-1 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-brand-fg transition-opacity hover:opacity-90"
            >
              Trade {coin.symbol?.toUpperCase()}
            </button>
          )}
        </div>
      </div>
    </>
  );
}

/**
 * Quick look at a coin from a markets list: live price, 24h range, 7d trend
 * and the key market numbers, with links to trade or open the full page.
 * Keep `coin` set while `open` turns false so the exit animation has content.
 */
function CoinQuickView({ coin, open, onClose, onTrade }) {
  return (
    <Modal open={open && !!coin} onClose={onClose} size="lg" label={coin ? `${coin.name} quick view` : "Coin"}>
      {coin && <QuickViewBody coin={coin} onClose={onClose} onTrade={onTrade} />}
    </Modal>
  );
}

export default memo(CoinQuickView);
