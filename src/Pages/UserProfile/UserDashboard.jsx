import React, { useMemo } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { BellRing, Camera, ChevronRight, IdCard, ListChecks, Pencil, ShieldCheck } from "lucide-react";
import api from "@/api/axiosConfig";
import useUserContext from "@/hooks/useUserContext";
import { usePurchasedCoins } from "@/hooks/usePurchasedCoins";
import { useLivePortfolio } from "@/hooks/useLivePortfolio";
import { Card, CardHeader } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { UserAvatar } from "@/Components/ui/user-avatar";
import AccountSummary from "@/Components/Dashboard/AccountSummary";
import RecentTradesCard from "@/Components/Dashboard/RecentTradesCard";
import WatchlistPreview from "@/Components/Dashboard/WatchlistPreview";
import { cn } from "@/utils/utils";

const memberSince = new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" });

const KYC = {
  verified: { label: "Verified", tone: "up", done: true },
  pending: { label: "In review", tone: "warn" },
  rejected: { label: "Needs changes", tone: "down" },
  unverified: { label: "Not started", tone: "neutral" },
};

const HeaderStat = ({ label, value }) => (
  <div className="min-w-0">
    <p className="tabular text-lg font-semibold text-fg">{value}</p>
    <p className="text-xs text-fg-subtle">{label}</p>
  </div>
);

/** One account setup step with its status and a link to fix it */
const ChecklistRow = ({ icon: Icon, title, description, status, done, to }) => (
  <li>
    <Link to={to} className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-hover">
      <span className={cn("grid size-8 shrink-0 place-items-center rounded-lg", done ? "bg-up-soft text-up" : "bg-surface-2 text-fg-muted")}>
        <Icon size={16} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-fg">{title}</span>
        <span className="block truncate text-xs text-fg-subtle">{description}</span>
      </span>
      {status}
      <ChevronRight size={16} className="shrink-0 text-fg-subtle" />
    </Link>
  </li>
);

/** Account overview: who you are, what you hold and what's left to set up */
export default function UserDashboard() {
  const { userId } = useParams();
  const { user } = useUserContext();
  const { transactionHistory } = usePurchasedCoins();
  const { groupedHoldings } = useLivePortfolio();

  // Same key and shape as Settings → Price alerts, so both share one cache entry
  const { data: alerts = [] } = useQuery({
    queryKey: ["alerts", user?.id],
    queryFn: async () => (await api.get(`/alerts/${user.id}`)).data.alerts || [],
    enabled: !!user?.id,
    staleTime: 30_000,
  });

  const kyc = KYC[user?.kycStatus] || KYC.unverified;
  const steps = useMemo(
    () => [
      {
        key: "photo",
        icon: Camera,
        title: "Profile photo",
        description: user?.image ? "Shown on the leaderboard" : "Add a photo so others recognise you",
        done: !!user?.image,
        to: "/user/settings",
      },
      {
        key: "2fa",
        icon: ShieldCheck,
        title: "Two-factor authentication",
        description: user?.twoFactorEnabled ? "A code is needed at every sign-in" : "Protect sign-in with an authenticator app",
        done: !!user?.twoFactorEnabled,
        to: "/user/settings?tab=security",
      },
      {
        key: "kyc",
        icon: IdCard,
        title: "Identity verification",
        description: user?.kycStatus === "rejected" ? "An admin asked for changes" : "Confirm who you are with an ID document",
        done: !!kyc.done,
        status: <Badge tone={kyc.tone}>{kyc.label}</Badge>,
        to: "/user/settings?tab=identity",
      },
    ],
    [user, kyc],
  );
  const doneCount = steps.filter((s) => s.done).length;

  // The overview is always your own; old links with another id land here too
  if (user?.id && userId && userId !== String(user.id)) {
    return <Navigate to={`/user-profile/${user.id}`} replace />;
  }

  return (
    <div className="space-y-4 lg:space-y-5">
      <Card className="flex flex-col gap-5 p-4 sm:p-5 lg:flex-row lg:items-center">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <UserAvatar user={user} size={64} />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-xl font-semibold tracking-tight text-fg">{user?.name || "Your account"}</h1>
              {user?.role === "superadmin" && <Badge tone="violet">Super admin</Badge>}
              {user?.role === "admin" && <Badge tone="brand">Admin</Badge>}
              {kyc.done && <Badge tone="up" dot>Verified</Badge>}
            </div>
            <p className="truncate text-sm text-fg-muted">
              {user?.user_name && <>@{user.user_name} · </>}
              {user?.email}
            </p>
            {user?.createdAt && <p className="mt-0.5 text-xs text-fg-subtle">Member since {memberSince.format(new Date(user.createdAt))}</p>}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 border-t border-line pt-4 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-6">
          <HeaderStat label="Trades made" value={transactionHistory.length.toLocaleString()} />
          <HeaderStat label="Coins held" value={groupedHoldings.length} />
          <HeaderStat label="Active alerts" value={alerts.length} />
        </div>

        <Link
          to="/user/settings"
          className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-line px-3.5 py-2 text-sm font-semibold text-fg transition-colors hover:bg-surface-hover"
        >
          <Pencil size={14} /> Edit profile
        </Link>
      </Card>

      <AccountSummary />

      <div className="grid grid-cols-1 items-start gap-4 lg:gap-5 xl:grid-cols-12">
        <div className="min-w-0 xl:col-span-7">
          <RecentTradesCard />
        </div>

        <div className="min-w-0 space-y-4 lg:space-y-5 xl:col-span-5">
          <Card>
            <CardHeader
              icon={ListChecks}
              title="Account setup"
              subtitle={doneCount === steps.length ? "Everything is set up" : `${doneCount} of ${steps.length} steps done`}
              action={
                <span className="h-1.5 w-20 overflow-hidden rounded-full bg-surface-2" aria-hidden="true">
                  <span className="block h-full rounded-full bg-up" style={{ width: `${(doneCount / steps.length) * 100}%` }} />
                </span>
              }
            />
            <ul className="divide-y divide-line border-t border-line">
              {steps.map(({ key, ...step }) => (
                <ChecklistRow
                  key={key}
                  {...step}
                  status={step.status || (step.done ? <Badge tone="up">Done</Badge> : <Badge tone="warn">To do</Badge>)}
                />
              ))}
              <ChecklistRow
                icon={BellRing}
                title="Price alerts"
                description={alerts.length ? "Notifications when coins hit your targets" : "Get notified when a coin crosses a price"}
                status={<Badge tone={alerts.length ? "brand" : "neutral"}>{alerts.length} active</Badge>}
                done={alerts.length > 0}
                to="/user/settings?tab=alerts"
              />
            </ul>
          </Card>

          <WatchlistPreview />
        </div>
      </div>
    </div>
  );
}
