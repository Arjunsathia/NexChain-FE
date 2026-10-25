import { useEffect, useState, useCallback } from "react";
import { FileText, CheckCircle2, XCircle } from "lucide-react";
import toast from "react-hot-toast";
import api from "@/api/axiosConfig";

const STATUS_COLORS = {
  verified: "text-green-500",
  pending: "text-yellow-500",
  rejected: "text-red-500",
  unverified: "text-gray-400",
};

const Field = ({ label, value, TC }) => (
  <div>
    <p className={`text-xs ${TC.textSecondary}`}>{label}</p>
    <p className={`text-sm font-medium break-words ${TC.textPrimary}`}>{value || "-"}</p>
  </div>
);

/**
 * Admin view of a user's KYC submission. The document is private, so it is
 * fetched with the admin's token and shown from a blob URL.
 */
const KycReviewPanel = ({ userId, TC, isLight, onDecision }) => {
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
    if (!review?.kycData?.hasDocument) return;
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
      toast.success(status === "verified" ? "KYC approved" : "KYC rejected");
      setRejectionReason("");
      await load();
      onDecision?.(status);
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to update KYC");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className={`h-40 rounded-xl animate-pulse ${isLight ? "bg-gray-100" : "bg-gray-800/50"}`} />;
  }

  const kyc = review?.kycData;
  if (!kyc || !kyc.fullName) {
    return (
      <div
        className={`h-40 rounded-xl border-2 border-dashed flex items-center justify-center ${isLight ? "border-gray-200" : "border-gray-800"}`}
      >
        <div className="text-center">
          <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className={`text-xs font-bold ${TC.textSecondary}`}>No KYC Documents Submitted</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className={`p-4 rounded-xl border ${TC.bgCard} ${TC.border}`}>
        <h3 className={`font-bold mb-3 ${TC.textPrimary}`}>
          KYC Status:{" "}
          <span className={`${STATUS_COLORS[review.kycStatus] || ""} uppercase`}>{review.kycStatus}</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Full Name" value={kyc.fullName} TC={TC} />
          <Field label="Date of Birth" value={kyc.dob && new Date(kyc.dob).toLocaleDateString()} TC={TC} />
          <Field label="ID Type" value={kyc.idType} TC={TC} />
          <Field label="ID Number" value={kyc.idNumber} TC={TC} />
          <div className="md:col-span-2">
            <Field label="Address" value={kyc.address} TC={TC} />
          </div>
          {kyc.rejectionReason && (
            <div className="md:col-span-2">
              <Field label="Rejection Reason" value={kyc.rejectionReason} TC={TC} />
            </div>
          )}
        </div>
      </div>

      <div
        className={`rounded-xl border border-dashed overflow-hidden ${isLight ? "border-gray-200" : "border-gray-800"}`}
      >
        {!kyc.hasDocument ? (
          <p className={`p-6 text-center text-xs font-bold ${TC.textSecondary}`}>No document file on record</p>
        ) : !document ? (
          <div className={`h-48 animate-pulse ${isLight ? "bg-gray-100" : "bg-gray-800/50"}`} />
        ) : document.type === "application/pdf" ? (
          <a
            href={document.url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 p-6 text-sm font-bold text-cyan-500 hover:underline"
          >
            <FileText className="w-5 h-5" /> Open PDF document
          </a>
        ) : (
          <img src={document.url} alt="KYC document" className="w-full h-auto object-contain max-h-[500px]" />
        )}
      </div>

      {review.kycStatus === "pending" && (
        <div className={`p-4 rounded-xl border space-y-3 ${TC.bgCard} ${TC.border}`}>
          <label className={`block text-xs font-bold ${TC.textSecondary}`} htmlFor="kyc-rejection-reason">
            Rejection reason (required to reject)
          </label>
          <input
            id="kyc-rejection-reason"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            maxLength={500}
            placeholder="e.g. Photo is blurry, name doesn't match"
            className={`w-full px-3 py-2 rounded-lg border text-sm outline-none ${TC.border} ${TC.textPrimary} bg-transparent`}
          />
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              disabled={submitting}
              onClick={() => decide("rejected")}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50"
            >
              <XCircle className="w-4 h-4" /> Reject
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={() => decide("verified")}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold bg-green-500 text-white hover:bg-green-600 transition-colors disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" /> Approve
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default KycReviewPanel;
