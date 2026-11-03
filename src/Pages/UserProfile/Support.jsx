import React, { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  FileText,
  HelpCircle,
  MessageSquareText,
  Paperclip,
  SearchX,
  Settings,
  X,
} from "lucide-react";
import api from "@/api/axiosConfig";
import useUserContext from "@/hooks/useUserContext";
import { Card, CardHeader, EmptyState } from "@/Components/ui/card";
import { Segmented } from "@/Components/ui/segmented";
import { SearchInput } from "@/Components/ui/table";
import { Field } from "@/Components/Settings/SettingsSection";
import { inputClass, primaryButton, secondaryButton } from "@/Components/Settings/settingsStyles";
import { FAQS, FAQ_TOPICS } from "@/content/supportFaqs";
import { cn } from "@/utils/utils";

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const MAX_MESSAGE = 2000;
const SUPPORT_TOPICS = ["Account", "Trading", "Identity", "Security", "Something's broken", "Other"];
const FEEDBACK_TYPES = [
  { value: "suggestion", label: "Idea" },
  { value: "bug", label: "Bug" },
  { value: "praise", label: "Praise" },
  { value: "general", label: "Other" },
];

/** One question that opens in place */
function FaqItem({ item, open, onToggle }) {
  return (
    <li>
      <h3>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          className="flex w-full items-center justify-between gap-4 px-4 py-3.5 text-left text-sm font-medium text-fg transition-colors hover:bg-surface-hover"
        >
          {item.q}
          <ChevronDown size={16} className={cn("shrink-0 text-fg-subtle transition-transform", open && "rotate-180")} />
        </button>
      </h3>
      {open && (
        <div className="px-4 pb-4 text-sm leading-relaxed text-fg-muted">
          <p>{item.a}</p>
          {item.link && (
            <Link to={item.link.to} className="mt-2 inline-flex items-center gap-1 font-medium text-brand hover:underline">
              {item.link.label} <ArrowRight size={13} />
            </Link>
          )}
        </div>
      )}
    </li>
  );
}

/** Sent confirmation shared by both forms */
function Sent({ title, children, onReset }) {
  return (
    <div className="flex flex-col items-center px-6 py-10 text-center">
      <span className="grid size-12 place-items-center rounded-full bg-up-soft text-up">
        <CheckCircle2 size={22} />
      </span>
      <p className="mt-3 text-sm font-semibold text-fg">{title}</p>
      <p className="mt-1 max-w-xs text-sm text-fg-muted">{children}</p>
      <button type="button" onClick={onReset} className={cn(secondaryButton, "mt-5")}>
        Send another
      </button>
    </div>
  );
}

/** Emails the support inbox; an admin replies to the account's address */
function SupportForm({ email }) {
  const [topic, setTopic] = useState(SUPPORT_TOPICS[0]);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [file, setFile] = useState(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const fileRef = useRef(null);

  const pickFile = (e) => {
    const chosen = e.target.files?.[0];
    e.target.value = "";
    if (!chosen) return;
    if (chosen.size > MAX_FILE_BYTES) return toast.error("Attachments can be up to 5 MB");
    setFile(chosen);
  };

  const submit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      const data = new FormData();
      data.append("subject", `[${topic}] ${subject.trim()}`);
      data.append("message", message.trim());
      if (file) data.append("attachment", file);
      await api.post("/users/contact-support", data);
      setSent(true);
      setSubject("");
      setMessage("");
      setFile(null);
    } catch (error) {
      toast.error(error.response?.data?.error || "Couldn't send your message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <Sent title="Message sent" onReset={() => setSent(false)}>
        An admin will reply to <span className="font-medium text-fg">{email}</span>.
      </Sent>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4 px-4 pb-4">
      <Field id="support-topic" label="Topic">
        <select id="support-topic" value={topic} onChange={(e) => setTopic(e.target.value)} className={inputClass}>
          {SUPPORT_TOPICS.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </Field>
      <Field id="support-subject" label="Subject">
        <input
          id="support-subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          maxLength={120}
          required
          placeholder="A short summary"
          className={inputClass}
        />
      </Field>
      <Field id="support-message" label="Message" hint={`${message.length} / ${MAX_MESSAGE}`}>
        <textarea
          id="support-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={MAX_MESSAGE}
          required
          rows={6}
          placeholder="What happened, and what did you expect? Include the coin or page if it's relevant."
          className={cn(inputClass, "h-auto resize-y py-2.5 leading-relaxed")}
        />
      </Field>

      <div>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={pickFile} className="sr-only" tabIndex={-1} />
        {file ? (
          <div className="flex items-center gap-2 rounded-lg border border-line bg-surface-2/60 px-3 py-2 text-sm">
            <FileText size={16} className="shrink-0 text-fg-subtle" />
            <span className="min-w-0 flex-1 truncate text-fg">{file.name}</span>
            <span className="tabular shrink-0 text-xs text-fg-subtle">{(file.size / 1024 / 1024).toFixed(1)} MB</span>
            <button type="button" onClick={() => setFile(null)} aria-label="Remove attachment" className="grid size-6 place-items-center rounded text-fg-subtle hover:text-down">
              <X size={14} />
            </button>
          </div>
        ) : (
          <button type="button" onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-1.5 text-sm font-medium text-fg-muted hover:text-brand">
            <Paperclip size={15} /> Attach a screenshot or PDF
            <span className="font-normal text-fg-subtle">(up to 5 MB)</span>
          </button>
        )}
      </div>

      <button type="submit" disabled={sending || !subject.trim() || !message.trim()} className={cn(primaryButton, "w-full")}>
        {sending ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}

/** Product feedback; lands in the admin Feedback inbox */
function FeedbackForm({ email }) {
  const [type, setType] = useState("suggestion");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await api.post("/feedback", { type, message: message.trim(), userEmail: email });
      setSent(true);
      setMessage("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Couldn't send your feedback. Please try again.");
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <Sent title="Thanks for the feedback" onReset={() => setSent(false)}>
        The team reads every note. We&apos;ll be in touch if we need more detail.
      </Sent>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4 px-4 pb-4">
      <div>
        <p id="feedback-type" className="mb-1.5 text-sm font-medium text-fg">
          Type
        </p>
        <Segmented label="Feedback type" options={FEEDBACK_TYPES} value={type} onChange={setType} className="w-full [&>button]:flex-1" />
      </div>
      <Field id="feedback-message" label="Your feedback" hint={`${message.length} / ${MAX_MESSAGE}`}>
        <textarea
          id="feedback-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={MAX_MESSAGE}
          required
          rows={7}
          placeholder={type === "bug" ? "What went wrong, and on which page?" : "Tell us what you think."}
          className={cn(inputClass, "h-auto resize-y py-2.5 leading-relaxed")}
        />
      </Field>
      <button type="submit" disabled={sending || !message.trim()} className={cn(primaryButton, "w-full")}>
        {sending ? "Sending…" : "Send feedback"}
      </button>
    </form>
  );
}

const CONTACT_MODES = [
  { value: "support", label: "Get help" },
  { value: "feedback", label: "Send feedback" },
];

/** Help centre: searchable answers, then a way to reach a person */
export default function Support() {
  const { user } = useUserContext();
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState("all");
  const [openQ, setOpenQ] = useState(null);
  const [mode, setMode] = useState("support");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return FAQS.filter((f) => (topic === "all" || f.topic === topic) && (!q || `${f.q} ${f.a}`.toLowerCase().includes(q)));
  }, [query, topic]);

  return (
    <div className="space-y-4 lg:space-y-5">
      <header>
        <h1 className="text-xl font-semibold tracking-tight text-fg sm:text-2xl">Help &amp; support</h1>
        <p className="mt-0.5 text-sm text-fg-subtle">Find a quick answer, or send a message and an admin will reply by email.</p>
      </header>

      <div className="grid grid-cols-1 items-start gap-4 lg:gap-5 xl:grid-cols-12">
        <Card className="min-w-0 xl:col-span-7">
          <CardHeader icon={HelpCircle} title="Common questions" subtitle={`${results.length} of ${FAQS.length} answers`} />
          <div className="space-y-3 px-4 pb-3">
            <SearchInput value={query} onChange={setQuery} placeholder="Search answers" className="w-full" />
            <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 no-scrollbar" role="group" aria-label="Filter by topic">
              {FAQ_TOPICS.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setTopic(t.value)}
                  aria-pressed={topic === t.value}
                  className={cn(
                    "shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                    topic === t.value ? "border-brand bg-brand-soft text-brand" : "border-line text-fg-muted hover:bg-surface-hover hover:text-fg",
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          {results.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title="No answers match"
              description="Try different words, or send us a message and we'll help directly."
              className="border-t border-line"
            />
          ) : (
            <ul className="divide-y divide-line border-t border-line">
              {results.map((item) => (
                <FaqItem key={item.q} item={item} open={openQ === item.q} onToggle={() => setOpenQ(openQ === item.q ? null : item.q)} />
              ))}
            </ul>
          )}
        </Card>

        <div className="min-w-0 space-y-4 lg:space-y-5 xl:sticky xl:top-[calc(var(--topbar-h)+24px)] xl:col-span-5">
          <Card>
            <CardHeader icon={MessageSquareText} title="Contact us" subtitle={mode === "support" ? "Replies go to your account email" : "Ideas, bugs and praise go to the team"} />
            <div className="px-4 pb-4">
              <Segmented label="Contact type" options={CONTACT_MODES} value={mode} onChange={setMode} size="md" className="w-full [&>button]:flex-1" />
            </div>
            {mode === "support" ? <SupportForm email={user?.email} /> : <FeedbackForm email={user?.email} />}
          </Card>

          <Card as="nav" aria-label="More help" className="divide-y divide-line">
            {[
              { to: "/learning", icon: BookOpen, title: "Learning hub", text: "Guides on trading, charts and staying safe" },
              { to: "/user/settings?tab=security", icon: Settings, title: "Account security", text: "Password, two-factor and active sessions" },
            ].map(({ to, icon: Icon, title, text }) => (
              <Link key={to} to={to} className="flex items-center gap-3 px-4 py-3 transition-colors first:rounded-t-xl last:rounded-b-xl hover:bg-surface-hover">
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-surface-2 text-fg-muted">
                  <Icon size={16} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-fg">{title}</span>
                  <span className="block truncate text-xs text-fg-subtle">{text}</span>
                </span>
                <ArrowRight size={15} className="shrink-0 text-fg-subtle" />
              </Link>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}
