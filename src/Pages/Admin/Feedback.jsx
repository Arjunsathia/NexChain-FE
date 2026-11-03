import React, { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { ChevronRight, Inbox, MessageSquare, SearchX } from "lucide-react";
import { getData, updateById, deleteById } from "@/api/axiosConfig";
import useSortedRows from "@/hooks/useSortedRows";
import useMediaQuery from "@/hooks/useMediaQuery";
import { formatTimeAgo } from "@/utils/format";
import { Card, EmptyState } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { Segmented } from "@/Components/ui/segmented";
import { Skeleton, SkeletonRows } from "@/Components/ui/skeleton";
import { Pagination, SearchInput, SortHeader } from "@/Components/ui/table";
import FeedbackSheet from "@/Components/Admin/Feedback/FeedbackSheet";

const PAGE_SIZE = 20;
const STATUS_META = {
  new: { label: "New", tone: "brand" },
  "in-progress": { label: "In progress", tone: "warn" },
  resolved: { label: "Resolved", tone: "up" },
  closed: { label: "Closed", tone: "neutral" },
};
const TYPE_LABELS = { bug: "Bug", suggestion: "Suggestion", praise: "Praise", general: "General" };
const PRIORITY_TONES = { critical: "down", high: "warn", medium: "neutral", low: "neutral" };
const PRIORITY_RANK = { critical: 0, high: 1, medium: 2, low: 3 };

const SORT_COLUMNS = {
  date: (f) => new Date(f.createdAt).getTime(),
  priority: (f) => PRIORITY_RANK[f.priority],
  type: (f) => f.type,
};

const STATUS_FILTERS = [
  { value: "open", label: "Open" },
  { value: "new", label: "New" },
  { value: "in-progress", label: "In progress" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
  { value: "all", label: "All" },
];
const TYPE_FILTERS = [
  { value: "all", label: "All types" },
  { value: "bug", label: "Bugs" },
  { value: "suggestion", label: "Suggestions" },
  { value: "praise", label: "Praise" },
  { value: "general", label: "General" },
];

const ago = (v) => formatTimeAgo(new Date(v).getTime() / 1000);

/** Admin: user feedback and bug reports, triaged by status */
export default function AdminFeedback() {
  const queryClient = useQueryClient();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [status, setStatus] = useState("open");
  const [type, setType] = useState("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState(null);
  const [saving, setSaving] = useState(false);

  const { data: items = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["adminFeedback"],
    queryFn: async () => {
      const res = await getData("/feedback");
      if (!res?.success) throw new Error("Unable to load feedback");
      return res.data || [];
    },
    staleTime: 30_000,
  });

  // Counts from the loaded list, so they always match what the filters show
  const counts = useMemo(() => {
    const c = { open: 0, new: 0, "in-progress": 0, resolved: 0, closed: 0, today: 0 };
    const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
    items.forEach((f) => {
      c[f.status] = (c[f.status] || 0) + 1;
      if (f.status === "new" || f.status === "in-progress") c.open += 1;
      if (new Date(f.createdAt).getTime() > dayAgo) c.today += 1;
    });
    return c;
  }, [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter(
      (f) =>
        (status === "all" || (status === "open" ? f.status === "new" || f.status === "in-progress" : f.status === status)) &&
        (type === "all" || f.type === type) &&
        (!q || f.message?.toLowerCase().includes(q) || f.userEmail?.toLowerCase().includes(q)),
    );
  }, [items, status, type, query]);

  const { sorted, sort, toggleSort } = useSortedRows(filtered, SORT_COLUMNS, { key: "date", dir: "desc" }, ["priority", "type"]);
  useEffect(() => setPage(1), [status, type, query, sort]);
  const visible = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const selected = items.find((f) => f._id === selectedId);
  const lastSelected = useRef(null);
  if (selected) lastSelected.current = selected;

  const patch = (id, changes) =>
    queryClient.setQueryData(["adminFeedback"], (old = []) => old.map((f) => (f._id === id ? { ...f, ...changes } : f)));

  const changeStatus = async (item, next) => {
    if (item.status === next) return;
    const previous = item.status;
    patch(item._id, { status: next });
    try {
      await updateById("/feedback", item._id, { status: next });
      toast.success(`Marked as ${STATUS_META[next].label.toLowerCase()}`);
      queryClient.invalidateQueries({ queryKey: ["adminReports"] });
    } catch {
      patch(item._id, { status: previous });
      toast.error("Couldn't update the status");
    }
  };

  const saveNotes = async (item, adminNotes) => {
    setSaving(true);
    try {
      await updateById("/feedback", item._id, { adminNotes });
      patch(item._id, { adminNotes });
      toast.success("Notes saved");
    } catch {
      toast.error("Couldn't save the notes");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (item) => {
    try {
      await deleteById("/feedback", item._id);
      setSelectedId(null);
      queryClient.setQueryData(["adminFeedback"], (old = []) => old.filter((f) => f._id !== item._id));
      queryClient.invalidateQueries({ queryKey: ["adminReports"] });
      toast.success("Feedback deleted");
    } catch {
      toast.error("Couldn't delete the feedback");
    }
  };

  const statusOptions = STATUS_FILTERS.map((s) => ({
    ...s,
    label: s.value === "all" ? `All ${items.length || ""}` : `${s.label} ${counts[s.value] || ""}`,
  }));
  const header = (label, key, extra) => <SortHeader label={label} sortKey={key} sort={sort} onSort={toggleSort} align="left" {...extra} />;

  return (
    <div className="space-y-4 lg:space-y-5">
      <header>
        <h1 className="text-xl font-semibold tracking-tight text-fg sm:text-2xl">Feedback</h1>
        <p className="mt-0.5 text-sm text-fg-subtle">Bug reports and suggestions from users. Open items are new or in progress.</p>
      </header>

      <Card className="grid grid-cols-2 divide-line md:grid-cols-4 md:divide-x [&>*:nth-child(n+3)]:border-t [&>*:nth-child(n+3)]:border-line md:[&>*:nth-child(n+3)]:border-t-0">
        {[
          ["Open", counts.open, "open"],
          ["New", counts.new, "new"],
          ["Received in 24h", counts.today, null],
          ["Resolved", counts.resolved, "resolved"],
        ].map(([label, value, target]) => (
          <button
            key={label}
            type="button"
            disabled={!target}
            onClick={() => target && setStatus(target)}
            className="px-4 py-3.5 text-left transition-colors enabled:hover:bg-surface-hover"
          >
            <p className="text-xs text-fg-subtle">{label}</p>
            {isLoading ? <Skeleton className="mt-1.5 h-5 w-10" /> : <p className="tabular mt-1 text-lg font-semibold text-fg">{value}</p>}
          </button>
        ))}
      </Card>

      <Card>
        <div className="flex flex-col gap-3 border-b border-line p-3 sm:p-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <Segmented label="Status" options={statusOptions} value={status} onChange={setStatus} className="max-w-full overflow-x-auto no-scrollbar [&>button]:whitespace-nowrap" />
            <label className="sr-only" htmlFor="feedback-type">
              Type
            </label>
            <select
              id="feedback-type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="h-9 rounded-lg border border-line bg-surface-2 px-3 text-sm text-fg outline-none focus:border-brand"
            >
              {TYPE_FILTERS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <SearchInput value={query} onChange={setQuery} placeholder="Search message or email" className="xl:w-64" />
        </div>

        {isLoading ? (
          <SkeletonRows rows={5} />
        ) : isError ? (
          <EmptyState
            icon={MessageSquare}
            title="Couldn't load feedback"
            description="Check the API connection and try again."
            className="py-14"
            action={
              <button type="button" onClick={() => refetch()} className="mt-2 text-sm font-semibold text-brand hover:underline">
                Retry
              </button>
            }
          />
        ) : items.length === 0 ? (
          <EmptyState icon={Inbox} title="No feedback yet" description="When users send feedback or report a bug, it appears here." className="py-16" />
        ) : visible.length === 0 ? (
          <EmptyState icon={SearchX} title={status === "open" ? "Nothing open" : "No feedback matches"} description={status === "open" ? "Every item has been resolved or closed." : "Try another filter or search."} className="py-14" />
        ) : isDesktop ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse">
              <thead className="border-b border-line bg-surface-2/60">
                <tr>
                  <th className="py-2.5 pl-4 pr-3 text-left text-xs font-medium text-fg-subtle">Message</th>
                  {header("Type", "type")}
                  {header("Priority", "priority")}
                  <th className="px-3 py-2.5 text-left text-xs font-medium text-fg-subtle">Status</th>
                  {header("Received", "date")}
                  <th className="w-px" />
                </tr>
              </thead>
              <tbody>
                {visible.map((f) => (
                  <tr key={f._id} onClick={() => setSelectedId(f._id)} className="cursor-pointer border-b border-line last:border-0 hover:bg-surface-hover">
                    <td className="max-w-0 py-3 pl-4 pr-3">
                      <p className="line-clamp-2 text-sm text-fg">{f.message}</p>
                      <p className="mt-0.5 truncate text-xs text-fg-subtle">{f.userEmail || "Anonymous"}</p>
                    </td>
                    <td className="px-3 py-3 text-sm text-fg-muted">{TYPE_LABELS[f.type] || f.type}</td>
                    <td className="px-3 py-3">
                      <Badge tone={PRIORITY_TONES[f.priority]} className="capitalize">
                        {f.priority}
                      </Badge>
                    </td>
                    <td className="px-3 py-3">
                      <Badge tone={STATUS_META[f.status]?.tone} dot>
                        {STATUS_META[f.status]?.label || f.status}
                      </Badge>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-sm text-fg-muted">{ago(f.createdAt)}</td>
                    <td className="py-3 pl-2 pr-4 text-fg-subtle">
                      <ChevronRight size={16} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <ul className="divide-y divide-line">
            {visible.map((f) => (
              <li key={f._id}>
                <button type="button" onClick={() => setSelectedId(f._id)} className="w-full px-4 py-3 text-left">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge tone={STATUS_META[f.status]?.tone} dot>
                      {STATUS_META[f.status]?.label}
                    </Badge>
                    <Badge tone={PRIORITY_TONES[f.priority]} className="capitalize">
                      {f.priority}
                    </Badge>
                    <span className="ml-auto text-xs text-fg-subtle">{ago(f.createdAt)}</span>
                  </div>
                  <p className="mt-1.5 line-clamp-2 text-sm text-fg">{f.message}</p>
                  <p className="mt-0.5 text-xs text-fg-subtle">
                    {TYPE_LABELS[f.type]} · {f.userEmail || "Anonymous"}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        )}
        <Pagination page={page} pageSize={PAGE_SIZE} total={sorted.length} onPage={setPage} />
      </Card>

      <FeedbackSheet
        item={selected || lastSelected.current}
        open={!!selected}
        onClose={() => setSelectedId(null)}
        onStatus={changeStatus}
        onSaveNotes={saveNotes}
        onDelete={remove}
        saving={saving}
      />
    </div>
  );
}
