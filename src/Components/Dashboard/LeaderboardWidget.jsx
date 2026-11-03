import React, { memo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Trophy } from "lucide-react";
import api from "@/api/axiosConfig";
import useUserContext from "@/hooks/useUserContext";
import { getAvatarUrl } from "@/utils/avatar";
import { Card, CardHeader, EmptyState } from "@/Components/ui/card";
import { SkeletonRows } from "@/Components/ui/skeleton";
import { Delta } from "@/Components/ui/delta";
import { formatUSD } from "@/utils/format";
import { cn } from "@/utils/utils";

const STARTING_BALANCE = 10000;
const MEDALS = ["text-amber-500", "text-slate-400", "text-orange-600"];

const TraderAvatar = ({ trader }) => {
  const [failed, setFailed] = React.useState(false);
  const src = getAvatarUrl(trader.image);
  return src && !failed ? (
    <img src={src} alt="" loading="lazy" onError={() => setFailed(true)} className="size-7 rounded-full object-cover" />
  ) : (
    <span className="grid size-7 place-items-center rounded-full bg-surface-2 text-[11px] font-semibold text-fg-muted">
      {(trader.name || trader.user_name || "?")[0].toUpperCase()}
    </span>
  );
};

/** Top traders by equity (cash + holdings), refreshed by the server every few minutes */
function LeaderboardWidget() {
  const { user } = useUserContext();
  const { data = [], isLoading, isError } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: async () => (await api.get("/users/leaderboard")).data,
    staleTime: 2 * 60_000,
  });
  const traders = Array.isArray(data) ? data.slice(0, 5) : [];

  return (
    <Card className="flex flex-col">
      <CardHeader icon={Trophy} title="Leaderboard" subtitle="Top traders by total equity" />
      {isLoading ? (
        <SkeletonRows rows={5} />
      ) : isError || traders.length === 0 ? (
        <EmptyState icon={Trophy} title="No rankings yet" description="Rankings appear once traders hold positions." />
      ) : (
        <ol className="divide-y divide-line">
          {traders.map((t, i) => {
            const equity = t.equity ?? t.virtualBalance ?? 0;
            const isMe = t.id === user?.id;
            return (
              <li key={t.id || i} className={cn("flex items-center gap-3 px-4 py-2.5", isMe && "bg-brand-soft")}>
                <span className={cn("w-4 text-center text-sm font-bold tabular", MEDALS[i] || "text-fg-subtle")}>{i + 1}</span>
                <TraderAvatar trader={t} />
                <p className="min-w-0 flex-1 truncate text-sm font-medium text-fg">
                  {t.name || t.user_name}
                  {isMe && <span className="ml-1.5 text-xs font-normal text-brand">You</span>}
                </p>
                <div className="text-right">
                  <p className="tabular text-sm font-medium text-fg">{formatUSD(equity, { maximumFractionDigits: 0, minimumFractionDigits: 0 })}</p>
                  <Delta value={((equity - STARTING_BALANCE) / STARTING_BALANCE) * 100} digits={1} className="text-xs" />
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </Card>
  );
}

export default memo(LeaderboardWidget);
