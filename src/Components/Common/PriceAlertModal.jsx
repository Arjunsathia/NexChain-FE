import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, BellRing, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import api from "@/api/axiosConfig";
import useUserContext from "@/hooks/useUserContext";
import { useLivePrice } from "@/hooks/useBinanceTicker";
import { Modal, ModalHeader, ModalTitle } from "@/Components/ui/modal";
import { CoinAvatar } from "@/Components/ui/coin-avatar";
import { Delta } from "@/Components/ui/delta";
import { FlashPrice } from "@/Components/Crypto/LiveCoinRow";
import { formatPrice } from "@/utils/format";
import { cn } from "@/utils/utils";

const PRESETS = [-10, -5, -2, 2, 5, 10];

const coinImage = (coin) =>
  typeof coin?.image === "string" ? coin.image : coin?.image?.small || coin?.image?.large || coin?.image?.thumb;
const round = (p) => parseFloat(p.toFixed(p < 1 ? 6 : 2));

/** Notify the user when a coin crosses a target price */
const PriceAlertModal = ({ show, onClose, coin }) => {
  const { user } = useUserContext();
  const queryClient = useQueryClient();
  const coinId = coin?.id || coin?.coinId;
  const live = useLivePrice(coinId, coin?.symbol || coin?.coinSymbol);
  const currentPrice = live?.current_price || coin?.current_price || coin?.currentPrice || 0;
  const change24h = live?.price_change_percentage_24h ?? coin?.price_change_percentage_24h;
  const [targetPrice, setTargetPrice] = useState("");
  const [preset, setPreset] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const symbol = (coin?.symbol || coin?.coinSymbol || "").toUpperCase();
  const alertsKey = ["alerts", user?.id];

  // Same key and shape as Settings → Price alerts, so both share one cache entry
  const { data: alerts = [] } = useQuery({
    queryKey: alertsKey,
    queryFn: async () => (await api.get(`/alerts/${user.id}`)).data.alerts || [],
    enabled: !!user?.id && !!show,
    staleTime: 30_000,
  });
  const coinAlerts = alerts.filter((a) => a.coin_id === coinId);

  // Start from the live price each time the modal opens (read through a ref so
  // later ticks don't overwrite what the user typed)
  const priceRef = useRef(currentPrice);
  priceRef.current = currentPrice;
  useEffect(() => {
    if (show) {
      const p = priceRef.current;
      setTargetPrice(p ? round(p) : "");
      setPreset(null);
      setIsSubmitting(false);
    }
  }, [show, coin]);

  const applyPreset = (percent) => {
    setTargetPrice(round(currentPrice * (1 + percent / 100)));
    setPreset(percent);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const priceValue = parseFloat(targetPrice);
    if (!priceValue || priceValue <= 0) {
      toast.error("Enter a target price above zero");
      return;
    }
    setIsSubmitting(true);
    try {
      const condition = priceValue > currentPrice ? "above" : "below";
      const res = await api.post("/alerts/create", {
        user_id: user.id,
        coin_id: coinId,
        coin_symbol: coin.symbol || coin.coinSymbol,
        coin_name: coin.name || coin.coinName,
        coin_image: coinImage(coin),
        target_price: priceValue,
        condition,
      });
      if (!res.data.success) throw new Error("Failed to create alert");
      queryClient.invalidateQueries({ queryKey: alertsKey });
      toast.success(`We'll tell you when ${symbol} goes ${condition} ${formatPrice(priceValue)}`);
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.error || "Couldn't create the alert");
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeAlert = async (alert) => {
    setDeletingId(alert._id);
    try {
      await api.delete(`/alerts/${alert._id}`);
      queryClient.setQueryData(alertsKey, (old = []) => old.filter((a) => a._id !== alert._id));
      toast.success("Alert deleted");
    } catch (error) {
      toast.error(error.response?.data?.error || "Couldn't delete the alert");
    } finally {
      setDeletingId(null);
    }
  };

  const priceValue = parseFloat(targetPrice) || 0;
  const diff = currentPrice > 0 && priceValue > 0 ? ((priceValue - currentPrice) / currentPrice) * 100 : 0;
  const above = priceValue > currentPrice;
  const same = priceValue > 0 && Math.abs(diff) < 0.005;
  const canSubmit = priceValue > 0 && !same && !isSubmitting;

  return (
    <Modal open={!!show && !!coin} onClose={onClose} label="Price alert">
      {coin && (
        <form onSubmit={handleSubmit}>
          <ModalHeader onClose={onClose}>
            <div className="flex items-center gap-3">
              <CoinAvatar src={coinImage(coin)} symbol={symbol} size={40} />
              <div className="min-w-0">
                <ModalTitle className="truncate text-base font-semibold text-fg">Alert for {coin.name || coin.coinName}</ModalTitle>
                <p className="flex items-center gap-1.5 text-xs text-fg-subtle">
                  <FlashPrice value={currentPrice} className="font-medium text-fg" />
                  <Delta value={change24h} className="text-xs" /> 24h
                </p>
              </div>
            </div>
          </ModalHeader>

          <div className="space-y-4 px-5 pb-5">
            <div>
              <label htmlFor="alert-target" className="mb-1.5 block text-xs font-medium text-fg-muted">
                Target price (USD)
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-lg text-fg-subtle">$</span>
                <input
                  id="alert-target"
                  type="number"
                  inputMode="decimal"
                  step="any"
                  min="0"
                  value={targetPrice}
                  onChange={(e) => {
                    setTargetPrice(e.target.value);
                    setPreset(null);
                  }}
                  placeholder="0.00"
                  className="tabular h-14 w-full rounded-xl border border-line bg-surface-2/60 pr-24 pl-8 text-xl font-semibold text-fg transition-colors outline-none focus:border-brand focus:bg-surface"
                />
                {priceValue > 0 && !same && (
                  <span
                    className={cn(
                      "tabular absolute top-1/2 right-2.5 inline-flex -translate-y-1/2 items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold",
                      above ? "bg-up-soft text-up" : "bg-down-soft text-down",
                    )}
                  >
                    {above ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                    {Math.abs(diff).toFixed(2)}%
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-6 gap-1.5" role="group" aria-label="Quick targets">
              {PRESETS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => applyPreset(p)}
                  aria-pressed={preset === p}
                  className={cn(
                    "tabular rounded-lg border py-1.5 text-xs font-medium transition-colors",
                    preset === p
                      ? p > 0
                        ? "border-up/40 bg-up-soft text-up"
                        : "border-down/40 bg-down-soft text-down"
                      : "border-line text-fg-muted hover:border-line-strong hover:text-fg",
                  )}
                >
                  {p > 0 ? "+" : "−"}
                  {Math.abs(p)}%
                </button>
              ))}
            </div>

            {/* Plain-language summary of what will trigger the alert */}
            <div className="flex items-center gap-3 rounded-xl border border-line px-3.5 py-3">
              <span
                className={cn(
                  "grid size-8 shrink-0 place-items-center rounded-full",
                  same || !priceValue ? "bg-surface-2 text-fg-subtle" : above ? "bg-up-soft text-up" : "bg-down-soft text-down",
                )}
              >
                {above ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
              </span>
              <p className="text-xs leading-relaxed text-fg-muted">
                {!priceValue ? (
                  "Enter a price to see when you'll be notified."
                ) : same ? (
                  "That's the current price. Pick a target above or below it."
                ) : (
                  <>
                    You&apos;ll get a notification and an email when {symbol}{" "}
                    <span className="font-semibold text-fg">
                      {above ? "rises above" : "falls below"} {formatPrice(priceValue)}
                    </span>
                    . The alert fires once.
                  </>
                )}
              </p>
            </div>

            <button
              type="submit"
              disabled={!canSubmit}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand text-sm font-semibold text-brand-fg transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <>
                  <BellRing size={16} /> Create alert
                </>
              )}
            </button>

            {coinAlerts.length > 0 && (
              <div className="border-t border-line pt-4">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-medium text-fg-muted">Your {symbol} alerts</p>
                  <Link to="/user/settings?tab=alerts" onClick={onClose} className="text-xs font-medium text-fg-subtle transition-colors hover:text-brand">
                    All alerts
                  </Link>
                </div>
                <ul className="space-y-1.5">
                  {coinAlerts.map((a) => (
                    <li key={a._id} className="flex items-center gap-2.5 rounded-lg bg-surface-2/60 py-1.5 pr-1.5 pl-3">
                      {a.condition === "above" ? <ArrowUp size={14} className="text-up" /> : <ArrowDown size={14} className="text-down" />}
                      <span className="flex-1 text-xs text-fg-muted">
                        {a.condition === "above" ? "Above" : "Below"}{" "}
                        <span className="tabular font-semibold text-fg">{formatPrice(a.target_price)}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => removeAlert(a)}
                        disabled={deletingId === a._id}
                        aria-label={`Delete alert ${a.condition} ${formatPrice(a.target_price)}`}
                        className="grid size-7 place-items-center rounded-md text-fg-subtle transition-colors hover:bg-down-soft hover:text-down disabled:opacity-50"
                      >
                        <Trash2 size={13} />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </form>
      )}
    </Modal>
  );
};

export default PriceAlertModal;
