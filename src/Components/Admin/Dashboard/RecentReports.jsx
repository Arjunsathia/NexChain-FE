import { Link } from "react-router-dom";
import { Flag, ArrowUpRight } from "lucide-react";
import { Card, CardHeader, EmptyState } from "@/Components/ui/card";
export default function RecentReports({ reports, isLoading }) {
  return <Card className="min-w-0 overflow-hidden"><CardHeader icon={Flag} title="Recent reports" subtitle="Latest platform issues" action={<Link to="/admin/feedback" className="-my-1 flex min-h-9 items-center gap-1 rounded-md px-1 text-[13px] text-brand sm:min-h-0 sm:text-xs">View all<ArrowUpRight size={13} /></Link>} />
    {isLoading ? <div className="space-y-3 p-4">{[0,1,2].map(i => <div key={i} className="h-14 animate-pulse rounded-lg bg-surface-2" />)}</div> : reports.length === 0 ? <EmptyState icon={Flag} title="No reports to review" description="Submitted bugs and issues will appear here." /> :
    <div className="divide-y divide-line">{reports.slice(0,4).map(r => <Link to="/admin/feedback" key={r.id} className="flex items-start gap-3 px-4 py-3.5 hover:bg-surface-hover">
      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-warn" /><div className="min-w-0 flex-1"><p className="line-clamp-1 text-xs font-medium text-fg">{r.title}</p><p className="mt-1 text-xs capitalize text-fg-subtle">{r.type} · {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "Date unavailable"}</p></div>
      <span className={['shrink-0 rounded-md px-2 py-0.5 text-2xs capitalize', ['resolved','closed'].includes(r.status) ? 'bg-up-soft text-up' : 'bg-surface-2 text-fg-muted'].join(' ')}>{r.status.replaceAll('-', ' ')}</span>
    </Link>)}</div>}
  </Card>;
}
