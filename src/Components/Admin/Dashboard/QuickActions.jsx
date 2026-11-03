import { Users, Coins, Settings, MessageSquare, ArrowUpRight, Zap } from "lucide-react";
import { Card, CardHeader } from "@/Components/ui/card";
export default function QuickActions({ handleQuickAction }) {
  return <Card><CardHeader icon={Zap} title="Quick actions" />
    <div className="grid grid-cols-2 gap-2 px-4 pb-4">{[
      { label: "Manage assets", action: "addCoin", icon: Coins }, { label: "Manage users", action: "viewUsers", icon: Users },
      { label: "Configuration", action: "systemSettings", icon: Settings }, { label: "Review reports", action: "generateReport", icon: MessageSquare },
    ].map(({label, action, icon: Icon}) => <button key={action} onClick={() => handleQuickAction(action)} className="flex items-center gap-2 rounded-lg border border-line px-3 py-3 text-left text-[11px] font-medium text-fg-muted transition-colors hover:border-line-strong hover:bg-surface-hover hover:text-fg"><Icon size={14} className="shrink-0" /><span className="flex-1">{label}</span><ArrowUpRight size={12} /></button>)}</div>
  </Card>;
}
