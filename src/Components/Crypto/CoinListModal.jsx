import React, { memo } from "react";
import { Modal, ModalHeader } from "@/Components/ui/modal";
import { Delta } from "@/Components/ui/delta";
import LiveCoinRow, { FlashPrice } from "./LiveCoinRow";

/** Full ranked list behind a "View all" link; picking a coin opens its quick view */
function CoinListModal({ open, onClose, title, subtitle, coins = [], onSelect, metric }) {
  return (
    <Modal open={open} onClose={onClose} size="lg" label={title}>
      <ModalHeader title={title} subtitle={subtitle} onClose={onClose} />
      <ol className="max-h-[65dvh] divide-y divide-line overflow-y-auto border-t border-line">
        {coins.map((c, i) => (
          <li key={c.id} className="flex items-center">
            <span className="tabular w-10 shrink-0 pl-5 text-xs text-fg-subtle">{i + 1}</span>
            <div className="min-w-0 flex-1">
              <LiveCoinRow
                id={c.id}
                symbol={c.symbol}
                name={c.name}
                image={c.image}
                price={c.current_price}
                change={c.price_change_percentage_24h}
                meta={c.name}
                onClick={() => onSelect(c)}
                // The live feed only carries the 24h change, so other periods render their own value
                right={
                  metric &&
                  (({ price }) => (
                    <div className="text-right">
                      <FlashPrice value={price} className="block text-sm font-medium text-fg" />
                      <Delta value={metric(c)} className="text-xs" />
                    </div>
                  ))
                }
              />
            </div>
          </li>
        ))}
        {coins.length === 0 && <li className="px-5 py-8 text-center text-sm text-fg-subtle">No coins match right now.</li>}
      </ol>
    </Modal>
  );
}

export default memo(CoinListModal);
