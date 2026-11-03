import React, { useState } from "react";
import toast from "react-hot-toast";
import { LogOut, QrCode, ShieldOff } from "lucide-react";
import api, { setMemoryToken } from "@/api/axiosConfig";
import useUserContext from "@/hooks/useUserContext";
import DemoLockNotice from "./DemoLockNotice";
import useLogout from "@/hooks/useLogout";
import { Badge } from "@/Components/ui/badge";
import { Modal, ModalHeader } from "@/Components/ui/modal";
import ConfirmDialog from "@/Components/Common/ConfirmDialog";
import SettingsSection, { Field } from "./SettingsSection";
import { inputClass, primaryButton, secondaryButton } from "./settingsStyles";
import { cn } from "@/utils/utils";

// Same rule the API enforces for new passwords (validationSchemas.newPassword)
const passwordProblem = (p) =>
  p.length < 8 ? "Use at least 8 characters." : !/[A-Za-z]/.test(p) || !/\d/.test(p) ? "Include at least one letter and one number." : null;

const codeInput =
  "tabular h-10 w-40 rounded-lg border border-line bg-surface px-3 text-center font-mono text-base tracking-[0.3em] text-fg outline-none focus:border-brand";

const digits = (v) => v.replace(/\D/g, "").slice(0, 6);

function PasswordSection({ user }) {
  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
  const [saving, setSaving] = useState(false);
  const problem = form.next ? passwordProblem(form.next) : null;
  const mismatch = form.confirm && form.confirm !== form.next ? "Passwords don't match." : null;
  const ready = form.current && form.next && form.confirm && !problem && !mismatch;
  const set = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!ready) return;
    setSaving(true);
    try {
      const res = await api.put(`/users/${user.id}`, {
        currentPassword: form.current,
        newPassword: form.next,
        confirmPassword: form.confirm,
      });
      // The API revokes every session and hands this one fresh tokens
      if (res.data.accessToken) setMemoryToken(res.data.accessToken);
      setForm({ current: "", next: "", confirm: "" });
      toast.success("Password changed. Other devices were signed out.");
    } catch (error) {
      toast.error(error.response?.data?.message || error.response?.data?.error || "Couldn't change your password");
    } finally {
      setSaving(false);
    }
  };

  // Google sign-up accounts have no password (changing one needs the current one)
  if (user?.provider === "google") {
    return (
      <SettingsSection title="Password" description="You sign in with Google, so there's no NexChain password to change.">
        <p className="text-sm text-fg-muted">Manage your password and sign-in security from your Google account.</p>
      </SettingsSection>
    );
  }

  return (
    <SettingsSection
      as="form"
      onSubmit={submit}
      title="Password"
      description="Changing it signs you out on every other device."
      footerHint="At least 8 characters, with a letter and a number."
      footer={
        <button type="submit" disabled={!ready || saving} className={primaryButton}>
          {saving ? "Updating…" : "Update password"}
        </button>
      }
    >
      <div className="grid gap-4 sm:max-w-md">
        <Field id="pw-current" label="Current password">
          <input id="pw-current" name="current" type="password" value={form.current} onChange={set} autoComplete="current-password" className={inputClass} />
        </Field>
        <Field id="pw-new" label="New password" error={problem}>
          <input id="pw-new" name="next" type="password" value={form.next} onChange={set} autoComplete="new-password" className={inputClass} />
        </Field>
        <Field id="pw-confirm" label="Confirm new password" error={mismatch}>
          <input id="pw-confirm" name="confirm" type="password" value={form.confirm} onChange={set} autoComplete="new-password" className={inputClass} />
        </Field>
      </div>
    </SettingsSection>
  );
}

function TwoFactorSection({ user, updateUser }) {
  const enabled = !!user?.twoFactorEnabled;
  const [setup, setSetup] = useState(null); // { qrCode, secret }
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [disableOpen, setDisableOpen] = useState(false);
  const [disableCode, setDisableCode] = useState("");

  const start = async () => {
    setLoading(true);
    try {
      const res = await api.post("/2fa/setup");
      setSetup({ qrCode: res.data.qrCode, secret: res.data.secret });
      setCode("");
    } catch (error) {
      toast.error(error.response?.data?.error || error.response?.data?.message || "Couldn't start 2FA setup");
    } finally {
      setLoading(false);
    }
  };

  const verify = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/2fa/verify", { token: code });
      updateUser({ twoFactorEnabled: true });
      setSetup(null);
      toast.success("Two-factor authentication is on");
    } catch (error) {
      toast.error(error.response?.data?.error || "That code didn't match. Try the newest one.");
    } finally {
      setLoading(false);
    }
  };

  const disable = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/2fa/disable", { token: disableCode });
      updateUser({ twoFactorEnabled: false });
      setDisableOpen(false);
      setDisableCode("");
      toast.success("Two-factor authentication is off");
    } catch (error) {
      toast.error(error.response?.data?.error || "That code didn't match");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SettingsSection
      title="Two-factor authentication"
      description="Ask for a code from your authenticator app whenever you sign in."
      action={
        <Badge tone={enabled ? "up" : "warn"} dot>
          {enabled ? "On" : "Off"}
        </Badge>
      }
    >
      {enabled ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-fg-muted">Your account is protected. Keep your authenticator app backed up.</p>
          <button type="button" onClick={() => setDisableOpen(true)} className={cn(secondaryButton, "shrink-0 text-down")}>
            <ShieldOff size={16} /> Turn off
          </button>
        </div>
      ) : !setup ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-fg-muted">Works with Google Authenticator, 1Password, Authy and similar apps.</p>
          <button type="button" onClick={start} disabled={loading} className={`${primaryButton} shrink-0`}>
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
              {setup.secret && (
                <>
                  <p className="mt-1 text-xs text-fg-subtle">{"Can't scan it? Enter this key instead:"}</p>
                  <code className="mt-1 block select-all break-all rounded-md bg-surface-2 px-2 py-1.5 font-mono text-sm text-fg">{setup.secret}</code>
                </>
              )}
            </div>
            <div>
              <label htmlFor="twofa-code" className="text-sm font-semibold text-fg">
                2. Enter the 6-digit code
              </label>
              <div className="mt-2 flex flex-wrap gap-2">
                <input
                  id="twofa-code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={code}
                  onChange={(e) => setCode(digits(e.target.value))}
                  placeholder="000000"
                  className={codeInput}
                />
                <button type="submit" disabled={code.length !== 6 || loading} className={primaryButton}>
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

      <Modal open={disableOpen} onClose={() => setDisableOpen(false)} size="sm" label="Turn off two-factor authentication">
        <form onSubmit={disable}>
          <ModalHeader title="Turn off 2FA?" subtitle="Enter a current code from your authenticator app to confirm." onClose={() => setDisableOpen(false)} />
          <div className="space-y-4 px-5 pb-5">
            <input
              autoFocus
              inputMode="numeric"
              autoComplete="one-time-code"
              value={disableCode}
              onChange={(e) => setDisableCode(digits(e.target.value))}
              placeholder="000000"
              aria-label="6-digit code"
              className={`${codeInput} w-full`}
            />
            <div className="flex gap-2">
              <button type="button" onClick={() => setDisableOpen(false)} className={`${secondaryButton} flex-1`}>
                Keep 2FA on
              </button>
              <button type="submit" disabled={disableCode.length !== 6 || loading} className={cn(primaryButton, "flex-1 bg-down text-white hover:bg-down/90")}>
                Turn off
              </button>
            </div>
          </div>
        </form>
      </Modal>
    </SettingsSection>
  );
}

function SessionsSection() {
  const signOut = useLogout();
  const [confirm, setConfirm] = useState(false);
  return (
    <SettingsSection title="Sessions" description="Lost a device, or signed in somewhere you don't trust?">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-fg-muted">Sign out of NexChain on every device, including this one.</p>
        <button type="button" onClick={() => setConfirm(true)} className={`${secondaryButton} shrink-0`}>
          <LogOut size={16} /> Sign out everywhere
        </button>
      </div>
      <ConfirmDialog
        show={confirm}
        onClose={() => setConfirm(false)}
        onConfirm={() => {
          setConfirm(false);
          signOut();
        }}
        title="Sign out everywhere?"
        message="Every active session ends, including this one. You'll need your password (and 2FA code, if it's on) to sign back in."
        confirmText="Sign out everywhere"
        variant="danger"
      />
    </SettingsSection>
  );
}

/** Password, two-factor authentication and active sessions */
export default function SecuritySettings() {
  const { user, updateUser } = useUserContext();
  return (
    <div className="space-y-5">
      {user?.isDemo ? (
        <DemoLockNotice title="Password and two-factor authentication" description="Demo accounts sign in with one click, so they have no password or 2FA.">
          Your demo session is tied to this browser.
        </DemoLockNotice>
      ) : (
        <>
          <PasswordSection user={user} />
          <TwoFactorSection user={user} updateUser={updateUser} />
        </>
      )}
      <SessionsSection />
    </div>
  );
}
