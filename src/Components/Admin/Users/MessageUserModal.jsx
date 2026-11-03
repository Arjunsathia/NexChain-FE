import React, { useState } from "react";
import { Send, Mail, MessageSquare } from "lucide-react";
import toast from "react-hot-toast";
import { postForm } from "@/api/axiosConfig";
import { Modal, ModalHeader } from "@/Components/ui/modal";
import { Segmented } from "@/Components/ui/segmented";

const CHANNELS = [
  { value: "email", label: "Email" },
  { value: "internal", label: "In-app notification" },
];

const field =
  "w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm text-fg outline-none placeholder:text-fg-subtle focus:border-brand";

/** Email a user, or send them an in-app notification */
const MessageUserModal = ({ isOpen, onClose, user }) => {
  const [channel, setChannel] = useState("email");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const send = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error("Write a message first");
      return;
    }
    setSending(true);
    try {
      await postForm("/users/contact-user", {
        userId: user.id || user._id,
        type: channel,
        subject: channel === "email" ? subject : undefined,
        message,
      });
      toast.success(`${channel === "email" ? "Email" : "Notification"} sent to ${user.name}`);
      setSubject("");
      setMessage("");
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to send the message");
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal open={!!isOpen && !!user} onClose={onClose} label="Contact user">
      {user && (
        <form onSubmit={send}>
          <ModalHeader title={`Message ${user.name}`} subtitle={user.email} onClose={onClose} />
          <div className="space-y-4 px-5 pb-5">
            <Segmented label="Channel" options={CHANNELS} value={channel} onChange={setChannel} className="w-full [&>button]:flex-1" />
            <p className="-mt-1 flex items-center gap-1.5 text-xs text-fg-subtle">
              {channel === "email" ? <Mail size={13} /> : <MessageSquare size={13} />}
              {channel === "email" ? "Sent to the user's email address." : "Appears in the user's notifications inside NexChain."}
            </p>
            {channel === "email" && (
              <div>
                <label htmlFor="msg-subject" className="mb-1.5 block text-xs font-medium text-fg-muted">
                  Subject
                </label>
                <input id="msg-subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" className={field} />
              </div>
            )}
            <div>
              <label htmlFor="msg-body" className="mb-1.5 block text-xs font-medium text-fg-muted">
                Message
              </label>
              <textarea
                id="msg-body"
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your message"
                className={`${field} resize-none`}
              />
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-line py-2.5 text-sm font-semibold text-fg hover:bg-surface-hover">
                Cancel
              </button>
              <button
                type="submit"
                disabled={sending}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-brand py-2.5 text-sm font-semibold text-brand-fg hover:bg-brand-hover disabled:opacity-50"
              >
                <Send size={15} /> {sending ? "Sending…" : "Send"}
              </button>
            </div>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default MessageUserModal;
