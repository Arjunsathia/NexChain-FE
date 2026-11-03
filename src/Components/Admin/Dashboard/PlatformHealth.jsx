import { useQuery } from "@tanstack/react-query";
import { Activity, Zap, Database, Radio } from "lucide-react";
import { Card, CardHeader } from "@/Components/ui/card";
import api from "@/api/axiosConfig";
const uptime = seconds => {
  const days = Math.floor(seconds / 86400), hours = Math.floor(seconds % 86400 / 3600), minutes = Math.floor(seconds % 3600 / 60);
  return days > 0 ? days + "d " + hours + "h" : hours > 0 ? hours + "h " + minutes + "m" : minutes + "m";
};
export default function PlatformHealth() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["platformHealth"],
    queryFn: async () => {
      const started = performance.now();
      const response = await api.get("/health", { validateStatus: () => true });
      if (!response.data || typeof response.data !== "object" || response.status >= 500 && !response.data.db) throw new Error("Service unavailable");
      return { ...response.data, apiLatencyMs: Math.round(performance.now() - started) };
    },
    refetchInterval: 30000, retry: false,
  });
  const items = data ? [
    {label: "API round trip", value: data.apiLatencyMs + " ms", icon: Zap, ok: data.apiLatencyMs < 500},
    {label: "Database", value: data.db?.ok ? "Healthy · " + data.db.latencyMs + " ms" : "Unreachable", icon: Database, ok: data.db?.ok},
    {label: "Price feed", value: data.priceFeed?.connected ? data.priceFeed.freshSymbols + "/" + data.priceFeed.trackedSymbols + " live" : "Disconnected", icon: Radio, ok: data.priceFeed?.connected},
  ] : [];
  return <Card><CardHeader icon={Activity} title="Service health" action={data?.uptimeSeconds != null ? <span className="text-[10px] text-fg-subtle">Uptime {uptime(data.uptimeSeconds)}</span> : undefined} />
    <div className="px-4 pb-3">{isLoading ? <div role="status" className="h-28 animate-pulse rounded-lg bg-surface-2"><span className="sr-only">Checking services</span></div> : isError ? <div className="rounded-lg bg-down-soft p-3"><p className="text-xs text-down">Unable to reach the health service.</p><button onClick={() => refetch()} className="mt-2 text-xs font-medium text-brand">Try again</button></div> : <div className="divide-y divide-line">{items.map(({label,value,icon:Icon,ok}) => <div key={label} className="flex items-center justify-between gap-2 py-2.5"><span className="flex items-center gap-2 text-[11px] text-fg-muted"><Icon size={13} />{label}</span><span className={['text-[11px] tabular-nums',ok ? 'text-up' : 'text-down'].join(' ')}>{value}</span></div>)}</div>}</div>
  </Card>;
}
