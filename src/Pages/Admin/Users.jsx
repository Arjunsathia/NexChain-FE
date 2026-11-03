import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { ChevronRight, SearchX, Users as UsersIcon } from "lucide-react";
import { getData, updateById } from "@/api/axiosConfig";
import useUserContext from "@/hooks/useUserContext";
import useSortedRows from "@/hooks/useSortedRows";
import useMediaQuery from "@/hooks/useMediaQuery";
import { getAvatarUrl } from "@/utils/avatar";
import { formatTimeAgo, formatUSD } from "@/utils/format";
import { Card, EmptyState } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { Segmented } from "@/Components/ui/segmented";
import { Skeleton, SkeletonRows } from "@/Components/ui/skeleton";
import { Pagination, SearchInput, SortHeader } from "@/Components/ui/table";
import UserDetailSheet from "@/Components/Admin/Users/UserDetailSheet";
import {
  KYC_LABELS,
  KYC_TONES,
  ROLE_LABELS,
  ROLE_TONES,
  STATUS_META,
  userId,
  userStatus,
} from "@/Components/Admin/Users/userMeta";

const PAGE_SIZE = 20;
const isAdminRole = (u) => u.role === "admin" || u.role === "superadmin";
const time = (v) => (v ? new Date(v).getTime() : null);
const lastSeen = (v) => (v ? formatTimeAgo(new Date(v).getTime() / 1000) : "Never");
const joined = (v) => (v ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(v)) : "–");

const SORT_COLUMNS = {
  name: (u) => u.name?.toLowerCase(),
  role: (u) => ({ superadmin: 0, admin: 1, user: 2 })[u.role],
  balance: (u) => u.virtualBalance,
  joined: (u) => time(u.createdAt),
  lastLogin: (u) => time(u.lastLogin),
};

const FILTERS = {
  all: (u) => !u.isDeleted,
  admins: (u) => !u.isDeleted && isAdminRole(u),
  frozen: (u) => !u.isDeleted && u.isFrozen,
  kyc: (u) => !u.isDeleted && u.kycStatus === "pending",
  archived: (u) => u.isDeleted,
};

const ACTION_TOASTS = {
  freeze: "Account frozen",
  unfreeze: "Account unfrozen",
  archive: "Account archived",
  restore: "Account restored",
  role: "Role updated",
};

function UserAvatar({ user }) {
  const [failed, setFailed] = useState(false);
  const src = getAvatarUrl(user.image);
  return src && !failed ? (
    <img src={src} alt="" loading="lazy" onError={() => setFailed(true)} className="size-8 shrink-0 rounded-full object-cover" />
  ) : (
    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-surface-2 text-xs font-semibold text-fg-muted">
      {(user.name || "?")[0].toUpperCase()}
    </span>
  );
}

const Stat = ({ label, value, loading, onClick, active }) => (
  <button
    type="button"
    onClick={onClick}
    className={`min-w-0 px-4 py-3.5 text-left transition-colors hover:bg-surface-hover ${active ? "bg-surface-2" : ""}`}
  >
    <p className="text-xs text-fg-subtle">{label}</p>
    {loading ? <Skeleton className="mt-1.5 h-5 w-10" /> : <p className="tabular mt-1 text-lg font-semibold text-fg">{value}</p>}
  </button>
);

/** Admin: every account, with filters, sorting and a detail panel for actions */
export default function AdminUsers() {
  const { user: actor } = useUserContext();
  const queryClient = useQueryClient();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState(null);
  const [busy, setBusy] = useState(false);

  // One request including archived accounts; filters run on the client
  const { data: users = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["adminUsersAll"],
    queryFn: async () => {
      const res = await getData("/users?includeDeleted=true");
      const rows = res?.users ?? res?.data ?? res;
      if (!Array.isArray(rows)) throw new Error("Unable to load users");
      return rows;
    },
    staleTime: 30_000,
  });

  const counts = useMemo(
    () => Object.fromEntries(Object.entries(FILTERS).map(([key, fn]) => [key, users.filter(fn).length])),
    [users],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter(
      (u) =>
        FILTERS[filter](u) &&
        (!q || u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.user_name?.toLowerCase().includes(q)),
    );
  }, [users, filter, query]);

  const { sorted, sort, toggleSort } = useSortedRows(filtered, SORT_COLUMNS, { key: "joined", dir: "desc" });
  useEffect(() => setPage(1), [filter, query, sort]);
  const visible = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // The panel reads from the list, so updates show immediately; the last user
  // is kept while the panel animates closed
  const selected = users.find((u) => userId(u) === selectedId);
  const lastSelected = useRef(null);
  if (selected) lastSelected.current = selected;

  const patchUser = useCallback(
    (id, patch) =>
      queryClient.setQueryData(["adminUsersAll"], (old = []) => old.map((u) => (userId(u) === id ? { ...u, ...patch } : u))),
    [queryClient],
  );

  const handleAction = useCallback(
    async (type, target, value) => {
      const id = userId(target);
      if (type === "kyc") {
        patchUser(id, { kycStatus: value });
        return;
      }
      const patch = {
        freeze: { isFrozen: true },
        unfreeze: { isFrozen: false },
        archive: { isDeleted: true },
        restore: { isDeleted: false },
        role: { role: value },
      }[type];
      setBusy(true);
      try {
        await updateById("/users", id, patch);
        patchUser(id, patch);
        toast.success(ACTION_TOASTS[type]);
        // Overview counts and lists use their own queries
        queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
        queryClient.invalidateQueries({ queryKey: ["adminUsersAll"] });
      } catch (error) {
        toast.error(error.response?.data?.error || error.response?.data?.message || "The change couldn't be saved");
      } finally {
        setBusy(false);
      }
    },
    [patchUser, queryClient],
  );

  const filterOptions = [
    { value: "all", label: `All ${counts.all ?? ""}` },
    { value: "admins", label: `Admins ${counts.admins ?? ""}` },
    { value: "frozen", label: `Frozen ${counts.frozen ?? ""}` },
    { value: "kyc", label: `KYC pending ${counts.kyc ?? ""}` },
    { value: "archived", label: `Archived ${counts.archived ?? ""}` },
  ];
  const header = (label, key, extra) => <SortHeader label={label} sortKey={key} sort={sort} onSort={toggleSort} align="left" {...extra} />;

  return (
    <div className="space-y-4 lg:space-y-5">
      <header>
        <h1 className="text-xl font-semibold tracking-tight text-fg sm:text-2xl">Users</h1>
        <p className="mt-0.5 text-sm text-fg-subtle">Accounts, roles, identity checks and account status.</p>
      </header>

      <Card className="grid grid-cols-2 divide-line overflow-hidden md:grid-cols-4 md:divide-x [&>*:nth-child(n+3)]:border-t [&>*:nth-child(n+3)]:border-line md:[&>*:nth-child(n+3)]:border-t-0">
        <Stat label="Active accounts" value={counts.all} loading={isLoading} onClick={() => setFilter("all")} active={filter === "all"} />
        <Stat label="Admins" value={counts.admins} loading={isLoading} onClick={() => setFilter("admins")} active={filter === "admins"} />
        <Stat label="Frozen" value={counts.frozen} loading={isLoading} onClick={() => setFilter("frozen")} active={filter === "frozen"} />
        <Stat label="Identity checks to review" value={counts.kyc} loading={isLoading} onClick={() => setFilter("kyc")} active={filter === "kyc"} />
      </Card>

      <Card>
        <div className="flex flex-col gap-3 border-b border-line p-3 sm:p-4 lg:flex-row lg:items-center lg:justify-between">
          <Segmented label="Filter users" options={filterOptions} value={filter} onChange={setFilter} className="max-w-full overflow-x-auto no-scrollbar [&>button]:whitespace-nowrap" />
          <SearchInput value={query} onChange={setQuery} placeholder="Search name, email or username" className="lg:w-72" />
        </div>

        {isLoading ? (
          <SkeletonRows rows={6} />
        ) : isError ? (
          <EmptyState
            icon={UsersIcon}
            title="Couldn't load users"
            description="Check the API connection and try again."
            className="py-14"
            action={
              <button type="button" onClick={() => refetch()} className="mt-2 text-sm font-semibold text-brand hover:underline">
                Retry
              </button>
            }
          />
        ) : visible.length === 0 ? (
          <EmptyState icon={SearchX} title="No users match" description="Try another filter or search term." className="py-14" />
        ) : isDesktop ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] border-collapse">
              <thead className="border-b border-line bg-surface-2/60">
                <tr>
                  {header("User", "name", { className: "pl-4" })}
                  {header("Role", "role")}
                  <th className="px-3 py-2.5 text-left text-xs font-medium text-fg-subtle">Status</th>
                  <th className="px-3 py-2.5 text-left text-xs font-medium text-fg-subtle">KYC</th>
                  <SortHeader label="Cash" sortKey="balance" sort={sort} onSort={toggleSort} />
                  {header("Joined", "joined")}
                  {header("Last sign-in", "lastLogin")}
                  <th className="w-px" />
                </tr>
              </thead>
              <tbody>
                {visible.map((u) => {
                  const status = userStatus(u);
                  const kyc = u.kycStatus || "unverified";
                  return (
                    <tr
                      key={userId(u)}
                      onClick={() => setSelectedId(userId(u))}
                      className="cursor-pointer border-b border-line transition-colors last:border-0 hover:bg-surface-hover"
                    >
                      <td className="py-2.5 pl-4 pr-3">
                        <div className="flex items-center gap-3">
                          <UserAvatar user={u} />
                          <div className="min-w-0">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedId(userId(u));
                              }}
                              className="block max-w-[240px] truncate text-left text-sm font-semibold text-fg hover:text-brand"
                            >
                              {u.name}
                              {userId(u) === userId(actor) && <span className="ml-1.5 text-xs font-normal text-brand">You</span>}
                            </button>
                            <p className="max-w-[240px] truncate text-xs text-fg-subtle">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        <Badge tone={ROLE_TONES[u.role]}>{ROLE_LABELS[u.role] || u.role}</Badge>
                      </td>
                      <td className="px-3 py-2.5">
                        <Badge tone={STATUS_META[status].tone} dot>
                          {STATUS_META[status].label}
                        </Badge>
                      </td>
                      <td className="px-3 py-2.5">
                        <Badge tone={KYC_TONES[kyc]}>{KYC_LABELS[kyc]}</Badge>
                      </td>
                      <td className="tabular px-3 py-2.5 text-right text-sm text-fg">{formatUSD(u.virtualBalance ?? 0)}</td>
                      <td className="tabular px-3 py-2.5 text-sm text-fg-muted">{joined(u.createdAt)}</td>
                      <td className="tabular px-3 py-2.5 text-sm text-fg-muted">{lastSeen(u.lastLogin)}</td>
                      <td className="py-2.5 pl-2 pr-4 text-fg-subtle">
                        <ChevronRight size={16} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <ul className="divide-y divide-line">
            {visible.map((u) => {
              const status = userStatus(u);
              return (
                <li key={userId(u)}>
                  <button type="button" onClick={() => setSelectedId(userId(u))} className="flex w-full items-center gap-3 px-4 py-3 text-left">
                    <UserAvatar user={u} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-fg">{u.name}</span>
                      <span className="block truncate text-xs text-fg-subtle">{u.email}</span>
                      <span className="mt-1.5 flex flex-wrap gap-1.5">
                        <Badge tone={ROLE_TONES[u.role]}>{ROLE_LABELS[u.role] || u.role}</Badge>
                        <Badge tone={STATUS_META[status].tone} dot>
                          {STATUS_META[status].label}
                        </Badge>
                        {u.kycStatus === "pending" && <Badge tone="warn">KYC pending</Badge>}
                      </span>
                    </span>
                    <ChevronRight size={16} className="shrink-0 text-fg-subtle" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
        <Pagination page={page} pageSize={PAGE_SIZE} total={sorted.length} onPage={setPage} />
      </Card>

      <UserDetailSheet
        user={selected || lastSelected.current}
        actor={actor}
        open={!!selected}
        onClose={() => setSelectedId(null)}
        onAction={handleAction}
        busy={busy}
      />
    </div>
  );
}
