import React from "react";
import { X } from "lucide-react";
import { ModalTitle } from "@/Components/ui/modal";
import { CoinAvatar } from "@/Components/ui/coin-avatar";
import { Delta } from "@/Components/ui/delta";
import { FlashPrice } from "@/Components/Crypto/LiveCoinRow";

/** Coin, live price and 24h change, with the close button */
const TradeModalHeader = React.memo(({ image, coinName, symbol, currentPrice, priceChange, onClose }) => (
  <div className="flex items-center gap-3 border-b border-line px-5 py-4">
    <CoinAvatar src={image} symbol={symbol} size={36} />
    <div className="min-w-0 flex-1">
      <ModalTitle className="truncate text-sm font-semibold text-fg">
        {coinName} <span className="font-normal text-fg-subtle">{symbol}/USD</span>
      </ModalTitle>
      <div className="flex items-center gap-2">
        <FlashPrice value={currentPrice} className="text-lg font-semibold text-fg" />
        <Delta value={priceChange} pill />
      </div>
    </div>
    <button
      type="button"
      onClick={onClose}
      aria-label="Close"
      className="grid size-8 shrink-0 place-items-center rounded-lg text-fg-subtle transition-colors hover:bg-surface-hover hover:text-fg"
    >
      <X size={18} />
    </button>
  </div>
));

TradeModalHeader.displayName = "TradeModalHeader";

export default TradeModalHeader;
