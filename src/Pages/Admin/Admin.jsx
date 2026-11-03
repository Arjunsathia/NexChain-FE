import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import AdminTabs from "@/Components/Admin/Sidebar";
import useUserContext from "@/hooks/useUserContext";
import "@/Components/Admin/admin.css";

/** Admin console shell: console label, section tabs, then the section page */
export default function Admin() {
  const { user } = useUserContext();
  const roleLabel = user?.role === "superadmin" ? "Super administrator" : "Administrator";

  return (
    <div className="admin-workspace mx-auto max-w-[1600px] space-y-5 px-3 py-4 sm:p-0">
      <div className="border-b border-line">
        <div className="flex items-center gap-2 pb-2 text-xs text-fg-subtle">
          <ShieldCheck size={15} className="text-brand" />
          <span className="font-medium text-fg-muted">Admin console</span>
          <span aria-hidden="true">·</span>
          <span>Signed in as {roleLabel.toLowerCase()}</span>
        </div>
        <AdminTabs />
      </div>
      <Suspense
        fallback={
          <div role="status" className="h-80 animate-pulse rounded-xl border border-line bg-surface">
            <span className="sr-only">Loading admin page</span>
          </div>
        }
      >
        <Outlet />
      </Suspense>
    </div>
  );
}
