import { Link } from "react-router-dom";
import { Users, ArrowUpRight } from "lucide-react";
import { Card, CardHeader, EmptyState } from "@/Components/ui/card";
import { getAvatarUrl } from "@/utils/avatar";
export default function LatestUsers({ users, isLoading }) {
  return <Card className="min-w-0 overflow-hidden"><CardHeader icon={Users} title="Newest members" subtitle="Recently registered accounts" action={<Link to="/admin/users" className="flex items-center gap-1 text-xs text-brand">View all<ArrowUpRight size={13} /></Link>} />
    {isLoading ? <div className="space-y-3 p-4">{[0,1,2,3].map(i => <div key={i} className="h-12 animate-pulse rounded-lg bg-surface-2" />)}</div> : users.length === 0 ? <EmptyState icon={Users} title="No members yet" description="New accounts will appear here after registration." /> :
    <div className="divide-y divide-line">{users.slice(0,5).map(u => <Link key={u.id} to="/admin/users" className="flex items-center gap-3 px-4 py-3 hover:bg-surface-hover">
      {u.image ? <img src={getAvatarUrl(u.image)} alt="" className="size-8 rounded-full object-cover" /> : <span className="grid size-8 shrink-0 place-items-center rounded-full bg-surface-2 text-xs font-semibold text-fg-muted">{u.name?.[0] || "U"}</span>}
      <div className="min-w-0 flex-1"><p className="truncate text-xs font-medium text-fg">{u.name}</p><p className="mt-0.5 truncate text-[11px] text-fg-subtle">{u.email}</p></div>
      <div className="shrink-0 text-right"><p className="text-[10px] capitalize text-fg-muted">{u.role}</p><p className="mt-0.5 text-[10px] text-fg-subtle">{u.joinDate}</p></div>
    </Link>)}</div>}
  </Card>;
}
