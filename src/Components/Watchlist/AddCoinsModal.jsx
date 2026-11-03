import React, { useMemo, useState } from "react";
import { Check, Plus } from "lucide-react";
import useCoinContext from "@/hooks/useCoinContext";
import { Modal, ModalHeader } from "@/Components/ui/modal";
import { SearchInput } from "@/Components/ui/table";
import { CoinAvatar } from "@/Components/ui/coin-avatar";
import { Delta } from "@/Components/ui/delta";
import { formatPrice } from "@/utils/format";
import { cn } from "@/utils/utils";

/** Search the top 100 coins and add or remove them without leaving the page */
export default function AddCoinsModal({ open, onClose, watchedIds, onToggle }) {
  const { coins } = useCoinContext();
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (q ? coins.filter((c) => c.name?.toLowerCase().includes(q) || c.symbol?.toLowerCase().includes(q)) : coins).slice(0, 50);
  }, [coins, query]);

  return (
    <Modal open={open} onClose={onClose} size="lg" label="Add coins to watchlist">
      <ModalHeader title="Add coins" subtitle="Follow coins to see their live prices on your watchlist." onClose={onClose} />
      <div className="px-5 pb-3">
        <SearchInput value={query} onChange={setQuery} placeholder="Search by name or symbol" />
      </div>
      <ul className="max-h-[55dvh] divide-y divide-line overflow-y-auto border-t border-line">
        {results.length === 0 && <li className="px-5 py-10 text-center text-sm text-fg-subtle">No coins match “{query}”.</li>}
        {results.map((coin) => {
          const watched = watchedIds.has(coin.id);
          return (
            <li key={coin.id} className="flex items-center gap-3 px-5 py-2.5">
              <CoinAvatar src={coin.image} symbol={coin.symbol} size={28} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-fg">
                  {coin.name} <span className="text-fg-subtle">{coin.symbol?.toUpperCase()}</span>
                </p>
                <p className="text-xs text-fg-subtle">#{coin.market_cap_rank ?? "–"}</p>
              </div>
              <div className="text-right text-xs">
                <span className="tabular block text-sm text-fg">{formatPrice(coin.current_price)}</span>
                <Delta value={coin.price_change_percentage_24h} />
              </div>
              <button
                type="button"
                onClick={() => onToggle(coin)}
                aria-pressed={watched}
                aria-label={watched ? `Remove ${coin.symbol} from watchlist` : `Add ${coin.symbol} to watchlist`}
                className={cn(
                  "ml-2 inline-flex h-8 w-[88px] items-center justify-center gap-1 rounded-md text-xs font-semibold transition-colors",
                  watched ? "bg-brand-soft text-brand" : "border border-line text-fg hover:border-brand hover:text-brand",
                )}
              >
                {watched ? <Check size={14} /> : <Plus size={14} />}
                {watched ? "Added" : "Add"}
              </button>
            </li>
          );
        })}
      </ul>
    </Modal>
  );
}
