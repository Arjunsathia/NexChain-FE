import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Trash2 } from "lucide-react";
import { Modal, ModalHeader, ModalTitle } from "@/Components/ui/modal";
import { Badge } from "@/Components/ui/badge";
import { categoryLabel, followUpOf, typeOf } from "@/utils/notifications";

const fmtWhen = new Intl.DateTimeFormat(undefined, { weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });

/** One notification in full, with a link to follow it up and a delete button */
const NotificationDetailsModal = ({ isOpen, onClose, notification, onDelete }) => {
  const meta = typeOf(notification);
  const follow = followUpOf(notification);
  const category = categoryLabel(notification?.category);

  return (
    <Modal open={isOpen && !!notification} onClose={onClose} label="Notification" className="details-modal-content">
      {notification && (
        <>
          <ModalHeader onClose={onClose}>
            <div className="flex items-start gap-3">
              <span className={`grid size-10 shrink-0 place-items-center rounded-full ${meta.tone}`}>
                <meta.Icon size={19} />
              </span>
              <div className="min-w-0">
                <ModalTitle className="text-base font-semibold text-fg">{notification.title}</ModalTitle>
                <p className="mt-0.5 text-xs text-fg-subtle">{fmtWhen.format(new Date(notification.createdAt))}</p>
              </div>
            </div>
          </ModalHeader>

          <div className="space-y-4 px-5 pb-5">
            <div className="flex flex-wrap gap-1.5">
              <Badge tone={meta.badge}>{meta.label}</Badge>
              {category && <Badge>{category}</Badge>}
            </div>
            <p className="rounded-lg bg-surface-2/60 px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap text-fg">{notification.message}</p>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              {onDelete ? (
                <button
                  type="button"
                  onClick={() => onDelete(notification._id)}
                  className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium text-down transition-colors hover:bg-down-soft"
                >
                  <Trash2 size={15} /> Delete
                </button>
              ) : (
                <span />
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg border border-line px-3.5 py-2 text-sm font-semibold text-fg transition-colors hover:bg-surface-hover"
                >
                  Close
                </button>
                {follow && (
                  <Link
                    to={follow.to}
                    onClick={onClose}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3.5 py-2 text-sm font-semibold text-brand-fg transition-opacity hover:opacity-90"
                  >
                    {follow.label} <ArrowRight size={15} />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </Modal>
  );
};

export default NotificationDetailsModal;
