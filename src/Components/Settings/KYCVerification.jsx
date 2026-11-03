import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { BadgeCheck, Clock, FileText, Upload, XCircle } from "lucide-react";
import api from "@/api/axiosConfig";
import useUserContext from "@/hooks/useUserContext";
import DemoLockNotice from "./DemoLockNotice";
import { Badge } from "@/Components/ui/badge";
import { Skeleton } from "@/Components/ui/skeleton";
import SettingsSection, { Field } from "./SettingsSection";
import { inputClass, primaryButton } from "./settingsStyles";
import { cn } from "@/utils/utils";

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const ID_TYPES = [
  { value: "passport", label: "Passport" },
  { value: "national_id", label: "National ID card" },
  { value: "drivers_license", label: "Driver's licence" },
];
const STATUS = {
  verified: { label: "Verified", tone: "up" },
  pending: { label: "In review", tone: "warn" },
  rejected: { label: "Needs changes", tone: "down" },
  unverified: { label: "Not started", tone: "neutral" },
};

function Notice({ tone, icon: Icon, title, children }) {
  const tones = { up: "border-up/30 bg-up-soft text-up", warn: "border-warn/30 bg-warn/10 text-warn", down: "border-down/30 bg-down-soft text-down" };
  return (
    <div className={cn("flex gap-3 rounded-xl border p-4", tones[tone])}>
      <Icon size={20} className="mt-0.5 shrink-0" />
      <div>
        <p className="text-sm font-semibold text-fg">{title}</p>
        <div className="mt-0.5 text-sm text-fg-muted">{children}</div>
      </div>
    </div>
  );
}

/** Identity verification: current status, and the submission form when needed */
export default function KYCVerification() {
  const { user } = useUserContext();
  const [status, setStatus] = useState("loading");
  const [rejectionReason, setRejectionReason] = useState("");
  const [form, setForm] = useState({ fullName: "", dob: "", address: "", idType: "passport", idNumber: "" });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    if (!user?.id) return;
    api
      .get(`/kyc/status/${user.id}`)
      .then((res) => {
        setStatus(res.data.kycStatus || "unverified");
        setRejectionReason(res.data.kycData?.rejectionReason || "");
      })
      .catch(() => setStatus("unverified"));
  }, [user?.id]);

  // Image preview for the chosen file (PDFs show their name)
  useEffect(() => {
    if (!file?.type.startsWith("image/")) {
      setPreview(null);
      return undefined;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const set = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const pickFile = (e) => {
    const chosen = e.target.files?.[0];
    e.target.value = "";
    if (!chosen) return;
    if (chosen.size > MAX_FILE_BYTES) {
      toast.error("File is too large (max 5 MB)");
      return;
    }
    setFile(chosen);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error("Attach a photo or scan of your ID document");
      return;
    }
    setSubmitting(true);
    try {
      const body = new FormData();
      Object.entries(form).forEach(([key, value]) => body.append(key, value));
      body.append("document", file);
      const res = await api.post("/kyc/submit", body);
      if (res.data.success) {
        toast.success("Submitted for review");
        setStatus("pending");
        setFile(null);
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "Couldn't submit your documents");
    } finally {
      setSubmitting(false);
    }
  };

  if (user?.isDemo) {
    return (
      <DemoLockNotice title="Identity verification" description="Confirm who you are with a government-issued ID.">
        Demo accounts can&apos;t submit identity documents.
      </DemoLockNotice>
    );
  }

  const meta = STATUS[status];
  const showForm = status === "unverified" || status === "rejected";

  return (
    <SettingsSection
      as={showForm ? "form" : "section"}
      onSubmit={showForm ? submit : undefined}
      title="Identity verification"
      description="Confirm who you are with a government-issued ID. Your documents are stored privately and only reviewed by NexChain admins."
      action={meta && <Badge tone={meta.tone} dot>{meta.label}</Badge>}
      footerHint={showForm ? "You'll get a notification once an admin has reviewed it." : undefined}
      footer={
        showForm && (
          <button type="submit" disabled={submitting} className={primaryButton}>
            {submitting ? "Submitting…" : status === "rejected" ? "Resubmit for review" : "Submit for review"}
          </button>
        )
      }
    >
      {status === "loading" ? (
        <Skeleton className="h-24 w-full rounded-xl" />
      ) : status === "verified" ? (
        <Notice tone="up" icon={BadgeCheck} title="Your identity is verified">
          Nothing else to do. Thanks for confirming your details.
        </Notice>
      ) : status === "pending" ? (
        <Notice tone="warn" icon={Clock} title="Your documents are being reviewed">
          {"We'll notify you as soon as an admin has checked them. You can keep trading in the meantime."}
        </Notice>
      ) : (
        <div className="space-y-5">
          {status === "rejected" && (
            <Notice tone="down" icon={XCircle} title="Your last submission needs changes">
              {rejectionReason || "Please check your details and upload a clearer document."}
            </Notice>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="kyc-name" label="Full legal name" hint="Exactly as it appears on your ID.">
              <input id="kyc-name" name="fullName" value={form.fullName} onChange={set} required minLength={2} maxLength={100} autoComplete="name" className={inputClass} />
            </Field>
            <Field id="kyc-dob" label="Date of birth">
              <input id="kyc-dob" name="dob" type="date" value={form.dob} onChange={set} required max={new Date().toISOString().slice(0, 10)} className={inputClass} />
            </Field>
            <div className="sm:col-span-2">
              <Field id="kyc-address" label="Residential address">
                <input id="kyc-address" name="address" value={form.address} onChange={set} required maxLength={300} autoComplete="street-address" className={inputClass} />
              </Field>
            </div>
            <Field id="kyc-type" label="Document type">
              <select id="kyc-type" name="idType" value={form.idType} onChange={set} className={inputClass}>
                {ID_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field id="kyc-number" label="Document number">
              <input id="kyc-number" name="idNumber" value={form.idNumber} onChange={set} required maxLength={50} className={inputClass} />
            </Field>
          </div>

          <div>
            <p className="mb-1.5 text-sm font-medium text-fg">Photo or scan of the document</p>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex w-full items-center gap-4 rounded-xl border border-dashed border-line-strong p-4 text-left transition-colors hover:border-brand hover:bg-brand-soft/40"
            >
              {preview ? (
                <img src={preview} alt="" className="size-16 shrink-0 rounded-lg object-cover" />
              ) : (
                <span className="grid size-16 shrink-0 place-items-center rounded-lg bg-surface-2 text-fg-subtle">
                  {file ? <FileText size={22} /> : <Upload size={22} />}
                </span>
              )}
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-fg">{file ? file.name : "Choose a file"}</span>
                <span className="block text-xs text-fg-subtle">{file ? "Click to replace" : "JPG, PNG, WebP or PDF, up to 5 MB. Make sure every corner is visible."}</span>
              </span>
            </button>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={pickFile} className="hidden" />
          </div>
        </div>
      )}
    </SettingsSection>
  );
}
