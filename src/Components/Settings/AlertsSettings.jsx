import React, { memo, useMemo, useState } from "react";
import useCoinContext from "@/hooks/useCoinContext";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { ArrowDown, ArrowUp, BellRing, Trash2 } from "lucide-react";
import api from "@/api/axiosConfig";
import useUserContext from "@/hooks/useUserContext";
import { useLivePrice } from "@/hooks/useBinanceTicker";
import { CoinAvatar } from "@/Components/ui/coin-avatar";
import { EmptyState } from "@/Components/ui/card";
import { SkeletonRows } from "@/Components/ui/skeleton";
import { FlashPrice } from "@/Components/Crypto/LiveCoinRow";
import { formatPrice } from "@/utils/format";
import SettingsSection from "./SettingsSection";
import { primaryButton } from "./settingsStyles";

const created = new Intl.DateTimeFormat(undefined, { dateStyle: "medium" });

/** One alert with the live price and how far it is from the target */
const AlertRow = memo(({ alert, fallbackPrice, onDelete, deleting }) => {
  const live = useLivePrice(alert.coin_id, alert.coin_symbol);
  // Market-list price until the live feed's first tick arrives
  const price = live?.current_price ?? fallbackPrice;
  const away = price ? ((alert.target_price - price) / price) * 100 : null;
  const above = alert.condition === "above";

  return (
    <li className="flex items-center gap-3 py-3">
      <CoinAvatar src={alert.coin_image} symbol={alert.coin_symbol} size={32} />
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5 text-sm font-semibold text-fg">
          {alert.coin_symbol?.toUpperCase()}
          <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${above ? "text-up" : "text-down"}`}>
            {above ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
            {above ? "above" : "below"} <span className="tabular">{formatPrice(alert.target_price)}</span>
          </span>
        </p>
        <p className="text-xs text-fg-subtle">
          Set {created.format(new Date(alert.createdAt))}
          {away != null && (
            <span className="tabular">
              {" "}
              · {Math.abs(away).toFixed(2)}% {away >= 0 ? "above" : "below"} the current price
            </span>
          )}
        </p>
      </div>
      <div className="hidden text-right sm:block">
        <p className="text-[11px] text-fg-subtle">Now</p>
        <FlashPrice value={price} className="text-sm font-medium text-fg" />
      </div>
      <button
        type="button"
        onClick={() => onDelete(alert)}
        disabled={deleting}
        aria-label={`Delete ${alert.coin_symbol} alert`}
        className="grid size-8 shrink-0 place-items-center rounded-md text-fg-subtle transition-colors hover:bg-down-soft hover:text-down disabled:opacity-40"
      >
        <Trash2 size={15} />
      </button>
    </li>
  );
});
AlertRow.displayName = "AlertRow";

/** Active price alerts, which previously could be created but not seen or removed */
export default function AlertsSettings() {
  const { user } = useUserContext();
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState(null);
  const key = ["alerts", user?.id];
  const { coins } = useCoinContext();
  const market = useMemo(() => new Map(coins.map((c) => [c.id, c])), [coins]);

  const { data: alerts = [], isLoading, isError } = useQuery({
    queryKey: key,
    queryFn: async () => (await api.get(`/alerts/${user.id}`)).data.alerts || [],
    enabled: !!user?.id,
    staleTime: 30_000,
  });

  const remove = async (alert) => {
    setDeletingId(alert._id);
    try {
      await api.delete(`/alerts/${alert._id}`);
      queryClient.setQueryData(key, (old = []) => old.filter((a) => a._id !== alert._id));
      toast.success("Alert deleted");
    } catch (error) {
      toast.error(error.response?.data?.error || "Couldn't delete the alert");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <SettingsSection
      title="Price alerts"
      description="Get a notification and an email when a coin crosses your target. Each alert fires once, then leaves this list."
      action={alerts.length > 0 && <span className="tabular shrink-0 whitespace-nowrap text-sm text-fg-subtle">{alerts.length} active</span>}
    >
      {isLoading ? (
        <SkeletonRows rows={3} />
      ) : isError ? (
        <EmptyState icon={BellRing} title="Couldn't load your alerts" description="Check your connection and refresh the page." />
      ) : alerts.length === 0 ? (
        <EmptyState
          icon={BellRing}
          title="No active alerts"
          description="Use the bell next to any coin in Markets, your Watchlist or Portfolio to set one."
          action={
            <Link to="/cryptolist" className={`${primaryButton} mt-2`}>
              Go to Markets
            </Link>
          }
        />
      ) : (
        <ul className="-my-3 divide-y divide-line">
          {alerts.map((a) => (
            <AlertRow
              key={a._id}
              alert={a}
              fallbackPrice={market.get(a.coin_id)?.current_price}
              onDelete={remove}
              deleting={deletingId === a._id}
            />
          ))}
        </ul>
      )}
    </SettingsSection>
  );
}
