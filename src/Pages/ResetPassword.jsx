import { useState } from "react";
import { ArrowLeft, ArrowRight, LockKeyhole, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { postForm } from "@/api/axiosConfig";
import PublicBrand from "@/Components/Landing/PublicBrand";
import AuthStory from "@/Components/Landing/AuthStory";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token"), id = params.get("id");
  const [formData, setFormData] = useState({ password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const handleSubmit = async event => {
    event.preventDefault(); setError("");
    if (formData.password !== formData.confirmPassword) { setError("Passwords do not match."); return; }
    if (!token || !id) { setError("This reset link is incomplete. Request a new link from the sign-in page."); return; }
    setLoading(true);
    try {
      const response = await postForm("/auth/reset-password", { ...formData, token, id });
      toast.success(response.message || "Password updated. You can now sign in.");
      navigate("/auth", { replace: true });
    } catch (err) { setError(err.response?.data?.message || "Unable to reset your password. Please try again."); }
    finally { setLoading(false); }
  };
  return <div className="auth-page">
    <header className="auth-header public-container"><PublicBrand /><Link to="/auth" className="auth-back"><ArrowLeft size={14} />Back to sign in</Link></header>
    <main className="auth-layout public-container"><AuthStory /><section className="auth-form-column" aria-labelledby="reset-title"><div className="auth-card">
      <span className="auth-form-heading-icon"><LockKeyhole size={18} /></span><h1 id="reset-title">A fresh start.</h1><p className="auth-form-description">Choose a new password to get back to your workspace.</p>
      {(!token || !id) && <p role="alert" className="auth-error">This reset link is incomplete. Return to sign in and request a new password reset link.</p>}
      {error && <p role="alert" className="auth-error">{error}</p>}
      <form onSubmit={handleSubmit} className="auth-form" aria-label="Reset password">
        <div className="auth-field auth-password-field"><label className="auth-field-label" htmlFor="reset-password">New password</label><span className="auth-input-wrap"><input id="reset-password" type={showPassword ? "text" : "password"} value={formData.password} onChange={e => setFormData({...formData,password:e.target.value})} autoComplete="new-password" placeholder="Create a new password" required minLength={6} disabled={!token || !id} /><button type="button" className="auth-password-toggle" aria-label={showPassword ? "Hide passwords" : "Show passwords"} aria-pressed={showPassword} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></span></div>
        <div className="auth-field"><label className="auth-field-label" htmlFor="reset-confirm">Confirm new password</label><input id="reset-confirm" type={showPassword ? "text" : "password"} value={formData.confirmPassword} onChange={e => setFormData({...formData,confirmPassword:e.target.value})} autoComplete="new-password" placeholder="Repeat your new password" required disabled={!token || !id} /></div>
        <button type="submit" disabled={loading || !token || !id} className="public-button auth-submit">{loading ? "Updating password…" : "Update password"}<ArrowRight size={16} /></button>
        <Link to="/auth" className="auth-text-button auth-flow-back"><ArrowLeft size={13} />Back to sign in</Link>
      </form>
    </div><p className="auth-security-note"><ShieldCheck size={12} /> A practice workspace. No deposits or real-money trades.</p></section></main>
    <footer className="auth-footer public-container"><span>© {new Date().getFullYear()} NexChain</span><p>Practice with virtual funds. Learn from real markets. Nothing on this platform is financial advice.</p></footer>
  </div>;
}
