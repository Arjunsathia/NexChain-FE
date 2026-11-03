import { useEffect, useState, useCallback } from "react";
import { FileText, CheckCircle2, XCircle, IdCard } from "lucide-react";
import toast from "react-hot-toast";
import api from "@/api/axiosConfig";
import { Badge } from "@/Components/ui/badge";
import { EmptyState } from "@/Components/ui/card";
import { Skeleton } from "@/Components/ui/skeleton";
import { KYC_TONES } from "./userMeta";

const Field = ({ label, value, wide }) => (
  <div className={wide ? "col-span-2" : undefined}>
    <dt className="text-xs text-fg-subtle">{label}</dt>
    <dd className="mt-0.5 break-words text-sm font-medium text-fg">{value || "–"}</dd>
  </div>
);

/**
 * Admin view of a user's KYC submission. The document is private, so it is
 * fetched with the admin's token and shown from a blob URL.
 */
const KycReviewPanel = ({ userId, onDecision }) => {
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [document, setDocument] = useState(null); // { url, type }
  const [rejectionReason, setRejectionReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/kyc/review/${userId}`);
      setReview(res.data);
    } catch {
      setReview(null);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!review?.kycData?.hasDocument) return undefined;
    let url;
    api
      .get(`/kyc/review/${userId}/document`, { responseType: "blob" })
      .then((res) => {
        url = URL.createObjectURL(res.data);
        setDocument({ url, type: res.data.type });
      })
      .catch(() => setDocument(null));
    return () => {
      if (url) URL.revokeObjectURL(url);
      setDocument(null);
    };
  }, [review, userId]);

  const decide = async (status) => {
    if (status === "rejected" && !rejectionReason.trim()) {
      toast.error("Add a reason so the user knows what to fix");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/kyc/verify", { user_id: userId, status, rejectionReason: rejectionReason.trim() });
      toast.success(status === "verified" ? "Identity approved" : "Identity rejected");
      setRejectionReason("");
      await load();
      onDecision?.(status);
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to update KYC");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Skeleton className="h-48 w-full rounded-xl" />;

  const kyc = review?.kycData;
  if (!kyc?.fullName) {
    return (
      <EmptyState
        icon={IdCard}
        title="No identity documents submitted"
        description="The user hasn't started identity verification."
        className="rounded-xl border border-dashed border-line"
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-line p-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-fg">Submitted details</h3>
          <Badge tone={KYC_TONES[review.kycStatus]} dot className="capitalize">
            {review.kycStatus}
          </Badge>
        </div>
        <dl className="grid grid-cols-2 gap-4">
          <Field label="Full name" value={kyc.fullName} />
          <Field label="Date of birth" value={kyc.dob && new Date(kyc.dob).toLocaleDateString()} />
          <Field label="ID type" value={kyc.idType} />
          <Field label="ID number" value={kyc.idNumber} />
          <Field label="Address" value={kyc.address} wide />
          {kyc.rejectionReason && <Field label="Rejection reason" value={kyc.rejectionReason} wide />}
        </dl>
      </div>

      <div className="overflow-hidden rounded-xl border border-line bg-surface-2">
        {!kyc.hasDocument ? (
          <p className="p-6 text-center text-xs text-fg-subtle">No document file on record</p>
        ) : !document ? (
          <Skeleton className="h-48 w-full rounded-none" />
        ) : document.type === "application/pdf" ? (
          <a href={document.url} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 p-6 text-sm font-semibold text-brand hover:underline">
            <FileText size={18} /> Open PDF document
          </a>
        ) : (
          <img src={document.url} alt="Identity document" className="max-h-[420px] w-full object-contain" />
        )}
      </div>

      {review.kycStatus === "pending" && (
        <div className="space-y-3 rounded-xl border border-line p-4">
          <label className="block text-xs font-medium text-fg-muted" htmlFor="kyc-rejection-reason">
            Rejection reason <span className="text-fg-subtle">(required to reject)</span>
          </label>
          <input
            id="kyc-rejection-reason"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            maxLength={500}
            placeholder="e.g. Photo is blurry, or the name doesn't match"
            className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-fg outline-none placeholder:text-fg-subtle focus:border-brand"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              disabled={submitting}
              onClick={() => decide("rejected")}
              className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3.5 py-2 text-sm font-semibold text-down hover:bg-down-soft disabled:opacity-50"
            >
              <XCircle size={16} /> Reject
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={() => decide("verified")}
              className="inline-flex items-center gap-1.5 rounded-lg bg-up px-3.5 py-2 text-sm font-semibold text-white hover:bg-up/90 disabled:opacity-50"
            >
              <CheckCircle2 size={16} /> Approve
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default KycReviewPanel;
