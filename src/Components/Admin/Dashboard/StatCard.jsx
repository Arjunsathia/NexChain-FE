import { ArrowUpRight } from "lucide-react";
export default function StatCard({ label, value, icon: Icon, badge, onClick, isLoading, description }) {
  const Tag = onClick ? "button" : "div";
  return <Tag type={onClick ? "button" : undefined} onClick={onClick} className={[
    "premium-card min-w-0 rounded-xl border border-line bg-surface p-4 text-left shadow-card",
    onClick ? "group transition-colors hover:border-line-strong hover:bg-surface-hover" : "",
  ].join(" ")}>
    <div className="mb-3 flex items-center justify-between gap-2"><span className="text-xs font-medium text-fg-muted">{label}</span><Icon size={16} className="shrink-0 text-fg-subtle" /></div>
    {isLoading ? <span className="block h-8 w-20 animate-pulse rounded bg-surface-2" /> : <p className="truncate text-2xl font-semibold tracking-tight text-fg tabular-nums">{value ?? "—"}</p>}
    <div className="mt-2 flex min-h-4 items-center justify-between gap-2"><span className="truncate text-[11px] text-fg-subtle">{badge || description || "View details"}</span>{onClick && <ArrowUpRight size={13} className="shrink-0 text-fg-subtle group-hover:text-brand" />}</div>
  </Tag>;
}
