import React, { useEffect, useState } from "react";
import { Trash2, Mail, Link2, Monitor, Calendar } from "lucide-react";
import { Sheet, SheetBody, SheetHeader } from "@/Components/ui/sheet";
import { Badge } from "@/Components/ui/badge";
import { Segmented } from "@/Components/ui/segmented";
import ConfirmDialog from "@/Components/Common/ConfirmDialog";
import { safeUrl } from "@/utils/safeUrl";

const STATUSES = [
  { value: "new", label: "New" },
  { value: "in-progress", label: "In progress" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];
const TYPE_LABELS = { bug: "Bug report", suggestion: "Suggestion", praise: "Praise", general: "General" };
const PRIORITY_TONES = { critical: "down", high: "warn", medium: "neutral", low: "neutral" };

const Meta = ({ icon: Icon, label, children }) => (
  <div className="flex gap-3 py-2.5">
    <Icon size={15} className="mt-0.5 shrink-0 text-fg-subtle" />
    <div className="min-w-0">
      <dt className="text-xs text-fg-subtle">{label}</dt>
      <dd className="mt-0.5 break-words text-sm text-fg">{children}</dd>
    </div>
  </div>
);

/** One feedback item: full message, context, status, internal notes and delete */
export default function FeedbackSheet({ item, open, onClose, onStatus, onSaveNotes, onDelete, saving }) {
  const [notes, setNotes] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Reset the notes field to the saved value when another item opens
  useEffect(() => setNotes(item?.adminNotes || ""), [item?._id, item?.adminNotes]);

  if (!item) return null;
  const dirty = notes !== (item.adminNotes || "");

  return (
    <Sheet open={open} onClose={onClose} label="Feedback details">
      <SheetHeader title={TYPE_LABELS[item.type] || "Feedback"} subtitle={`From ${item.userEmail || "an anonymous visitor"}`} onClose={onClose} />
      <SheetBody className="space-y-5">
        <div className="flex flex-wrap gap-1.5">
          <Badge tone={PRIORITY_TONES[item.priority]} className="capitalize">
            {item.priority} priority
          </Badge>
          <Badge tone="brand">{TYPE_LABELS[item.type] || item.type}</Badge>
        </div>

        <blockquote className="whitespace-pre-wrap rounded-xl border border-line bg-surface-2 p-4 text-sm leading-relaxed text-fg">
          {item.message}
        </blockquote>

        <div>
          <p className="mb-2 text-xs font-medium text-fg-muted">Status</p>
          <Segmented
            label="Status"
            options={STATUSES}
            value={item.status}
            onChange={(status) => onStatus(item, status)}
            className="w-full [&>button]:flex-1 [&>button]:whitespace-nowrap"
          />
        </div>

        <dl className="divide-y divide-line rounded-xl border border-line px-4">
          <Meta icon={Calendar} label="Submitted">
            {new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(item.createdAt))}
          </Meta>
          <Meta icon={Mail} label="Email">
            {item.userEmail ? (
              <a href={`mailto:${item.userEmail}`} className="text-brand hover:underline">
                {item.userEmail}
              </a>
            ) : (
              "Not provided"
            )}
          </Meta>
          {item.pageUrl && (
            <Meta icon={Link2} label="Page">
              <a href={safeUrl(item.pageUrl)} target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">
                {item.pageUrl}
              </a>
            </Meta>
          )}
          {item.userAgent && (
            <Meta icon={Monitor} label="Browser">
              <span className="text-xs text-fg-muted">{item.userAgent}</span>
            </Meta>
          )}
        </dl>

        <div>
          <label htmlFor="feedback-notes" className="mb-1.5 block text-xs font-medium text-fg-muted">
            Internal notes <span className="text-fg-subtle">(only admins see these)</span>
          </label>
          <textarea
            id="feedback-notes"
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="What was done, who's handling it…"
            className="w-full resize-none rounded-lg border border-line bg-surface px-3 py-2.5 text-sm text-fg outline-none placeholder:text-fg-subtle focus:border-brand"
          />
          <div className="mt-2 flex justify-end">
            <button
              type="button"
              disabled={!dirty || saving}
              onClick={() => onSaveNotes(item, notes)}
              className="rounded-lg bg-brand px-3.5 py-2 text-sm font-semibold text-brand-fg hover:bg-brand-hover disabled:opacity-40"
            >
              {saving ? "Saving…" : "Save notes"}
            </button>
          </div>
        </div>

        <div className="border-t border-line pt-4">
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-down hover:underline"
          >
            <Trash2 size={15} /> Delete this feedback
          </button>
        </div>
      </SheetBody>

      <ConfirmDialog
        show={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => {
          setConfirmDelete(false);
          onDelete(item);
        }}
        title="Delete this feedback?"
        message="It's removed permanently, including your internal notes. This can't be undone."
        confirmText="Delete"
        variant="danger"
        icon={Trash2}
      />
    </Sheet>
  );
}
