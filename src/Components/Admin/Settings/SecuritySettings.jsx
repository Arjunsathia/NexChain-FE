import React, { useState } from "react";
import { ShieldCheck, QrCode } from "lucide-react";
import { toast } from "react-hot-toast";
import useUserContext from "@/hooks/useUserContext";
import api from "@/api/axiosConfig";
import { Card, CardHeader } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";

/** Authenticator-app 2FA for the signed-in admin (required for destructive admin actions) */
export default function SecuritySettings() {
  const { user, updateUser } = useUserContext();
  const enabled = !!user?.twoFactorEnabled;
  const [setup, setSetup] = useState(null); // { qrCode, secret }
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const start = async () => {
    setLoading(true);
    try {
      const res = await api.get("/auth/setup-totp");
      setSetup(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't start 2FA setup");
    } finally {
      setLoading(false);
    }
  };

  const verify = async (e) => {
    e.preventDefault();
    if (code.length !== 6) {
      toast.error("Enter the 6-digit code from your app");
      return;
    }
    setLoading(true);
    try {
      await api.post("/auth/verify-totp", { token: code, secret: setup.secret });
      toast.success("Two-factor authentication is on");
      updateUser({ twoFactorEnabled: true });
      setSetup(null);
      setCode("");
    } catch (err) {
      toast.error(err.response?.data?.message || "That code didn't match. Try the newest one.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader
        icon={ShieldCheck}
        title="Two-factor authentication"
        subtitle="Required before destructive admin actions, such as deleting an account."
        action={
          enabled ? (
            <Badge tone="up" dot>
              On
            </Badge>
          ) : (
            <Badge tone="warn" dot>
              Off
            </Badge>
          )
        }
      />
      <div className="px-4 pb-4">
        {enabled ? (
          <p className="text-sm text-fg-muted">
            Your account asks for a code from your authenticator app when you sign in and before sensitive admin actions.
          </p>
        ) : !setup ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-fg-muted">
              Use an authenticator app such as Google Authenticator, 1Password or Authy to protect admin access.
            </p>
            <button
              type="button"
              onClick={start}
              disabled={loading}
              className="shrink-0 rounded-lg bg-brand px-3.5 py-2 text-sm font-semibold text-brand-fg hover:bg-brand-hover disabled:opacity-50"
            >
              {loading ? "Starting…" : "Set up 2FA"}
            </button>
          </div>
        ) : (
          <form onSubmit={verify} className="flex flex-col gap-5 rounded-xl border border-line p-4 sm:flex-row">
            <div className="shrink-0 self-start rounded-lg bg-white p-2">
              <img src={setup.qrCode} alt="QR code for your authenticator app" className="size-36" />
            </div>
            <div className="min-w-0 flex-1 space-y-4">
              <div>
                <p className="flex items-center gap-1.5 text-sm font-semibold text-fg">
                  <QrCode size={15} /> 1. Scan the QR code
                </p>
                <p className="mt-1 text-xs text-fg-subtle">Or enter this key manually:</p>
                <code className="mt-1 block select-all break-all rounded-md bg-surface-2 px-2 py-1.5 font-mono text-sm text-fg">{setup.secret}</code>
              </div>
              <div>
                <label htmlFor="admin-2fa-code" className="text-sm font-semibold text-fg">
                  2. Enter the 6-digit code
                </label>
                <div className="mt-2 flex gap-2">
                  <input
                    id="admin-2fa-code"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="000000"
                    className="tabular h-10 w-36 rounded-lg border border-line bg-surface px-3 text-center font-mono text-base tracking-[0.3em] text-fg outline-none focus:border-brand"
                  />
                  <button
                    type="submit"
                    disabled={code.length !== 6 || loading}
                    className="rounded-lg bg-brand px-4 text-sm font-semibold text-brand-fg hover:bg-brand-hover disabled:opacity-50"
                  >
                    {loading ? "Checking…" : "Turn on"}
                  </button>
                  <button type="button" onClick={() => setSetup(null)} className="px-2 text-sm text-fg-muted hover:text-fg">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </Card>
  );
}
