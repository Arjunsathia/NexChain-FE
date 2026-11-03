import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check, KeyRound, Minus, UserCog } from "lucide-react";
import useUserContext from "@/hooks/useUserContext";
import { Card, CardHeader } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import SecuritySettings from "@/Components/Admin/Settings/SecuritySettings";
import { cn } from "@/utils/utils";

// Mirrors the rules the API enforces (Controllers/userController.js, coin and feedback routes)
const PERMISSIONS = [
  { label: "View users, balances and trade history", admin: true, superadmin: true },
  { label: "Review identity (KYC) submissions", admin: true, superadmin: true },
  { label: "Message users by email or notification", admin: true, superadmin: true },
  { label: "Freeze and unfreeze coins", admin: true, superadmin: true },
  { label: "Manage feedback and bug reports", admin: true, superadmin: true },
  { label: "Promote users to admin, or back to user", admin: true, superadmin: true },
  { label: "Freeze or archive regular users", admin: true, superadmin: true },
  { label: "Freeze or archive other admins", admin: false, superadmin: true },
  { label: "Grant the super admin role", admin: false, superadmin: true },
];

const Cell = ({ on, highlight }) => (
  <td className={cn("px-3 py-2.5 text-center", highlight && "bg-brand-soft/60")}>
    {on ? <Check size={16} className="mx-auto text-up" aria-label="Allowed" /> : <Minus size={16} className="mx-auto text-fg-subtle" aria-label="Not allowed" />}
  </td>
);

/** Admin settings: 2FA, what each role can do, and links to account security */
export default function AdminSettings() {
  const { user } = useUserContext();
  const isSuper = user?.role === "superadmin";

  return (
    <div className="space-y-4 lg:space-y-5">
      <header>
        <h1 className="text-xl font-semibold tracking-tight text-fg sm:text-2xl">Settings</h1>
        <p className="mt-0.5 text-sm text-fg-subtle">Security for your admin account and what each admin role can do.</p>
      </header>

      <div className="grid items-start gap-4 lg:gap-5 xl:grid-cols-12">
        <div className="space-y-4 lg:space-y-5 xl:col-span-7">
          <SecuritySettings />

          <Card>
            <CardHeader icon={KeyRound} title="Password and sessions" subtitle="Managed from your personal account settings." />
            <div className="flex flex-col gap-3 px-4 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-fg-muted">
                Change your password or turn off 2FA from your account settings. A new password signs you out on every other device.
              </p>
              <Link
                to="/user/settings?tab=security"
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-line px-3.5 py-2 text-sm font-semibold text-fg hover:bg-surface-hover"
              >
                Account settings <ArrowRight size={14} />
              </Link>
            </div>
          </Card>
        </div>

        <Card className="xl:col-span-5">
          <CardHeader
            icon={UserCog}
            title="Role permissions"
            subtitle="Enforced by the server for every request."
            action={<Badge tone={isSuper ? "violet" : "brand"}>You: {isSuper ? "Super admin" : "Admin"}</Badge>}
          />
          <div className="overflow-x-auto border-t border-line">
            <table className="w-full border-collapse text-sm">
              <thead className="bg-surface-2/60 text-xs text-fg-subtle">
                <tr>
                  <th className="px-4 py-2.5 text-left font-medium">Action</th>
                  <th className={cn("px-3 py-2.5 font-medium", !isSuper && "bg-brand-soft/60 text-brand")}>Admin</th>
                  <th className={cn("px-3 py-2.5 font-medium", isSuper && "bg-brand-soft/60 text-brand")}>Super admin</th>
                </tr>
              </thead>
              <tbody>
                {PERMISSIONS.map((p) => (
                  <tr key={p.label} className="border-t border-line">
                    <td className="px-4 py-2.5 text-fg-muted">{p.label}</td>
                    <Cell on={p.admin} highlight={!isSuper} />
                    <Cell on={p.superadmin} highlight={isSuper} />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="border-t border-line px-4 py-3 text-xs text-fg-subtle">
            Nobody can change their own role or freeze their own account, and a super admin&apos;s account can only be changed by its owner.
          </p>
        </Card>
      </div>
    </div>
  );
}
