import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { Archive, ArchiveRestore, ChevronDown, Info, Mail, Shield, Snowflake, Sun } from "lucide-react";
import { getData } from "@/api/axiosConfig";
import { getAvatarUrl } from "@/utils/avatar";
import { formatPrice, formatUSD } from "@/utils/format";
import { Sheet, SheetBody, SheetHeader, SheetTitle } from "@/Components/ui/sheet";
import { Badge } from "@/Components/ui/badge";
import { EmptyState } from "@/Components/ui/card";
import { SkeletonRows, Skeleton } from "@/Components/ui/skeleton";
import { CoinAvatar } from "@/Components/ui/coin-avatar";
import ConfirmDialog from "@/Components/Common/ConfirmDialog";
import KycReviewPanel from "./KycReviewPanel";
import MessageUserModal from "./MessageUserModal";
import {
  KYC_LABELS,
  KYC_TONES,
  ROLE_LABELS,
  ROLE_TONES,
  STATUS_META,
  allowedActions,
  userId,
  userStatus,
} from "./userMeta";
import { cn } from "@/utils/utils";

const TABS = ["overview", "holdings", "activity", "identity"];
const TAB_LABELS = { overview: "Overview", holdings: "Holdings", activity: "Activity", identity: "Identity" };
const dateTime = new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" });
const date = (v) => (v ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(v)) : "–");

const CONFIRM_COPY = {
  freeze: (u) => ({
    title: `Freeze ${u.name}?`,
    message: "They're signed out immediately and can't sign in or trade until you unfreeze the account.",
    confirmText: "Freeze account",
    variant: "danger",
    icon: Snowflake,
  }),
  archive: (u) => ({
    title: `Archive ${u.name}?`,
    message: "The account is deactivated: they're signed out and can't sign in. It moves to the Archived filter and can be restored later.",
    confirmText: "Archive account",
    variant: "danger",
    icon: Archive,
  }),
  role: (u, role) => ({
    title: `Change role to ${ROLE_LABELS[role]}?`,
    message: `${u.name} will be signed out of all sessions and get ${role === "user" ? "standard user" : ROLE_LABELS[role].toLowerCase()} access when they sign in again.`,
    confirmText: "Change role",
    variant: "warning",
    icon: Shield,
  }),
};

function Avatar({ user, size = 48 }) {
  const [failed, setFailed] = useState(false);
  const src = getAvatarUrl(user.image);
  return src && !failed ? (
    <img src={src} alt="" onError={() => setFailed(true)} style={{ width: size, height: size }} className="shrink-0 rounded-full object-cover ring-1 ring-line" />
  ) : (
    <span style={{ width: size, height: size }} className="grid shrink-0 place-items-center rounded-full bg-brand-soft text-base font-semibold text-brand ring-1 ring-line">
      {(user.name || "?")[0].toUpperCase()}
    </span>
  );
}

const Stat = ({ label, children }) => (
  <div className="rounded-lg border border-line px-3 py-2.5">
    <dt className="text-xs text-fg-subtle">{label}</dt>
    <dd className="tabular mt-0.5 text-sm font-semibold text-fg">{children}</dd>
  </div>
);

/** Balance, holdings and trades for one user (fetched when the panel opens) */
function useUserDetail(id, enabled) {
  return useQuery({
    queryKey: ["adminUserDetail", id],
    enabled: !!id && enabled,
    staleTime: 30_000,
    queryFn: async () => {
      const [holdings, transactions] = await Promise.allSettled([
        getData(`/purchases/holdings/${id}`),
        getData(`/purchases/transactions/${id}`),
      ]);
      return {
        holdings: holdings.status === "fulfilled" ? holdings.value?.holdings || [] : null,
        transactions: transactions.status === "fulfilled" ? transactions.value?.transactions || [] : null,
      };
    },
  });
}

/** Everything about one user, plus the actions the signed-in admin is allowed to take */
export default function UserDetailSheet({ user, actor, open, onClose, onAction, busy }) {
  const [tab, setTab] = useState("overview");
  const [confirm, setConfirm] = useState(null); // { type, role? }
  const [messaging, setMessaging] = useState(false);
  const id = userId(user);
  const { data, isLoading } = useUserDetail(id, open);

  // Each user opens on the overview
  useEffect(() => setTab("overview"), [id]);

  if (!user) return null;
  const allowed = allowedActions(actor, user);
  const status = userStatus(user);
  const invested = (data?.holdings || []).reduce((s, h) => s + (h.totalInvested || 0), 0);
  const trades = data?.transactions?.length;

  const run = async (type, role) => {
    setConfirm(null);
    await onAction(type, user, role);
  };
  const copy = confirm && (confirm.type === "role" ? CONFIRM_COPY.role(user, confirm.role) : CONFIRM_COPY[confirm.type](user));

  return (
    <Sheet open={open} onClose={onClose} label={`User ${user.name}`}>
      <SheetHeader onClose={onClose}>
        <div className="flex items-center gap-3">
          <Avatar user={user} />
          <div className="min-w-0">
            <SheetTitle className="truncate text-base font-semibold text-fg">{user.name}</SheetTitle>
            <p className="truncate text-xs text-fg-subtle">
              {user.user_name ? `@${user.user_name} · ` : ""}
              {user.email}
            </p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              <Badge tone={ROLE_TONES[user.role]}>{ROLE_LABELS[user.role] || user.role}</Badge>
              <Badge tone={STATUS_META[status].tone} dot>
                {STATUS_META[status].label}
              </Badge>
              <Badge tone={KYC_TONES[user.kycStatus || "unverified"]}>KYC: {KYC_LABELS[user.kycStatus || "unverified"]}</Badge>
            </div>
          </div>
        </div>
      </SheetHeader>

      {/* Actions */}
      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-line px-5 py-3">
        <button
          type="button"
          onClick={() => setMessaging(true)}
          disabled={user.isDeleted}
          className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-fg hover:bg-surface-hover disabled:opacity-40"
        >
          <Mail size={14} /> Message
        </button>
        {allowed.roles.length > 0 && !user.isDeleted && (
          <Menu as="div" className="relative">
            <MenuButton className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-fg hover:bg-surface-hover data-[open]:bg-surface-hover">
              <Shield size={14} /> Change role <ChevronDown size={13} />
            </MenuButton>
            <MenuItems
              anchor={{ to: "bottom start", gap: 6 }}
              className="z-[9500] w-44 rounded-lg border border-line bg-surface p-1 shadow-pop outline-none"
            >
              {allowed.roles.map((role) => (
                <MenuItem key={role}>
                  <button
                    type="button"
                    onClick={() => setConfirm({ type: "role", role })}
                    className="w-full rounded-md px-2.5 py-1.5 text-left text-sm text-fg-muted data-[focus]:bg-surface-hover data-[focus]:text-fg"
                  >
                    Make {ROLE_LABELS[role].toLowerCase()}
                  </button>
                </MenuItem>
              ))}
            </MenuItems>
          </Menu>
        )}
        {allowed.freeze && !user.isDeleted && (
          <button
            type="button"
            disabled={busy}
            onClick={() => (user.isFrozen ? run("unfreeze") : setConfirm({ type: "freeze" }))}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold disabled:opacity-50",
              user.isFrozen ? "border-line text-fg hover:bg-surface-hover" : "border-line text-down hover:bg-down-soft",
            )}
          >
            {user.isFrozen ? <Sun size={14} /> : <Snowflake size={14} />}
            {user.isFrozen ? "Unfreeze" : "Freeze"}
          </button>
        )}
        {allowed.archive && (
          <button
            type="button"
            disabled={busy}
            onClick={() => (user.isDeleted ? run("restore") : setConfirm({ type: "archive" }))}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs font-semibold disabled:opacity-50",
              user.isDeleted ? "text-fg hover:bg-surface-hover" : "text-fg-muted hover:bg-surface-hover hover:text-fg",
            )}
          >
            {user.isDeleted ? <ArchiveRestore size={14} /> : <Archive size={14} />}
            {user.isDeleted ? "Restore" : "Archive"}
          </button>
        )}
        {allowed.reason && (
          <p className="flex basis-full items-center gap-1.5 text-xs text-fg-subtle">
            <Info size={13} /> {allowed.reason}
          </p>
        )}
      </div>

      <div role="tablist" aria-label="User details" className="flex shrink-0 gap-1 border-b border-line px-3">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={cn(
              "relative px-2.5 py-2.5 text-sm font-medium transition-colors",
              "after:absolute after:inset-x-2.5 after:bottom-0 after:h-0.5 after:rounded-full",
              tab === t ? "text-fg after:bg-brand" : "text-fg-muted hover:text-fg",
            )}
          >
            {TAB_LABELS[t]}
            {t === "identity" && user.kycStatus === "pending" && <span className="ml-1.5 inline-block size-1.5 rounded-full bg-warn align-middle" />}
          </button>
        ))}
      </div>

      <SheetBody>
        {tab === "overview" && (
          <dl className="grid grid-cols-2 gap-2.5">
            <Stat label="Cash balance">{formatUSD(user.virtualBalance ?? 0)}</Stat>
            <Stat label="Open positions">{isLoading ? <Skeleton className="h-4 w-8" /> : data?.holdings ? data.holdings.length : "–"}</Stat>
            <Stat label="Invested in positions">{isLoading ? <Skeleton className="h-4 w-16" /> : formatUSD(invested)}</Stat>
            <Stat label="Trades">{isLoading ? <Skeleton className="h-4 w-8" /> : trades ?? "–"}</Stat>
            <Stat label="Joined">{date(user.createdAt)}</Stat>
            <Stat label="Last sign-in">{user.lastLogin ? dateTime.format(new Date(user.lastLogin)) : "Never"}</Stat>
            <Stat label="Sign-in method">{user.provider === "google" ? "Google" : "Email & password"}</Stat>
            <Stat label="Two-factor auth">{user.twoFactorEnabled ? "On" : "Off"}</Stat>
          </dl>
        )}

        {tab === "holdings" &&
          (isLoading ? (
            <SkeletonRows rows={3} />
          ) : !data?.holdings?.length ? (
            <EmptyState title="No open positions" description="This user doesn't hold any coins." />
          ) : (
            <ul className="divide-y divide-line rounded-xl border border-line">
              {data.holdings.map((h) => (
                <li key={h._id} className="flex items-center gap-3 px-3 py-2.5">
                  <CoinAvatar src={h.image} symbol={h.coinSymbol} size={28} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-fg">{h.coinSymbol?.toUpperCase()}</p>
                    <p className="tabular text-xs text-fg-subtle">
                      {Number(h.totalQuantity || 0).toLocaleString(undefined, { maximumFractionDigits: 8 })} · avg {formatPrice(h.averagePrice)}
                    </p>
                  </div>
                  <span className="tabular text-sm font-medium text-fg">{formatUSD(h.totalInvested || 0)}</span>
                </li>
              ))}
            </ul>
          ))}

        {tab === "activity" &&
          (isLoading ? (
            <SkeletonRows rows={4} />
          ) : !data?.transactions?.length ? (
            <EmptyState title="No trades yet" description="Buys and sells will appear here." />
          ) : (
            <ul className="divide-y divide-line rounded-xl border border-line">
              {[...data.transactions]
                .sort((a, b) => new Date(b.transactionDate) - new Date(a.transactionDate))
                .slice(0, 25)
                .map((tx) => (
                  <li key={tx._id} className="flex items-center gap-3 px-3 py-2.5">
                    <Badge tone={tx.type === "buy" ? "up" : "down"} className="w-10 justify-center uppercase">
                      {tx.type}
                    </Badge>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-fg">{tx.coinSymbol?.toUpperCase()}</p>
                      <p className="text-xs text-fg-subtle">{dateTime.format(new Date(tx.transactionDate))}</p>
                    </div>
                    <span className="tabular text-sm font-medium text-fg">{formatUSD(tx.totalValue || 0)}</span>
                  </li>
                ))}
            </ul>
          ))}

        {tab === "identity" && <KycReviewPanel userId={id} onDecision={(kycStatus) => onAction("kyc", user, kycStatus)} />}
      </SheetBody>

      {/* Rendered inside the sheet so they stay interactive on top of it */}
      <ConfirmDialog
        show={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={() => run(confirm.type, confirm.role)}
        title={copy?.title}
        message={copy?.message}
        confirmText={copy?.confirmText}
        variant={copy?.variant}
        icon={copy?.icon}
      />
      <MessageUserModal isOpen={messaging} onClose={() => setMessaging(false)} user={user} />
    </Sheet>
  );
}
