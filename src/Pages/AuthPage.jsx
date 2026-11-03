import { useState, useEffect, useId, useRef } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { ArrowLeft, ArrowRight, ArrowUpRight, ShieldCheck, LockKeyhole, MailCheck, Eye, EyeOff, FlaskConical } from "lucide-react";
import PublicBrand from "@/Components/Landing/PublicBrand";
import AuthStory from "@/Components/Landing/AuthStory";
import { postForm } from "@/api/axiosConfig";
import { Link, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import useDemoLogin, { useCompleteLogin } from "@/hooks/useDemoLogin";

const initialRegisterKeys = {
  name: "",
  email: "",
  phone: "",
  user_name: "",
  password: "",
  confirm_password: "",
};

// No response at all means the API is down or unreachable, not a wrong password
const errorMessage = (err, fallback) =>
  err.response?.data?.message ||
  (!err.response ? "We couldn't connect to the server. Please try again shortly." : fallback);

function AuthField({ label, className = "", passwordToggle, ...props }) {
  const id = useId();
  return <div className={"auth-field " + className}>
    <label className="auth-field-label" htmlFor={id}>{label}</label>
    <span className="auth-input-wrap"><input id={id} {...props} />{passwordToggle}</span>
  </div>;
}

const AuthPage = () => {
  const [params, setParams] = useSearchParams();
  const finishLogin = useCompleteLogin();
  const { startDemo, loading: demoLoading } = useDemoLogin();
  const headingRef = useRef(null);

  // Auth State
  const [activeTab, setActiveTab] = useState(params.get("mode") === "register" ? "register" : "login");
  const [loginData, setLoginData] = useState({ user_name: "", password: "" });
  const [registerData, setRegisterData] = useState(initialRegisterKeys);
  const [registerStep, setRegisterStep] = useState(0);
  const [otpCode, setOtpCode] = useState("");
  // Set when the server asks for an authenticator code: { method, googleAccessToken? }
  const [twoFactor, setTwoFactor] = useState(null);
  const [totpCode, setTotpCode] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [emailForOtp, setEmailForOtp] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // UI State
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const reportError = (message, options) => { setFormError(message); toast.error(message, options); };
  const busy = loading || demoLoading;

  const completeLogin = (res) => {
    setTwoFactor(null);
    setTotpCode("");
    finishLogin(res);
  };

  const askForCode = (challenge, message) => {
    setTwoFactor(challenge);
    setTotpCode("");
    setActiveTab("login");
    toast(message || "Enter the code from your authenticator app", { icon: "🔐" });
  };

  const submitGoogle = async (googleAccessToken, totp) => {
    const res = await postForm("/auth/google", { googleAccessToken, totp });
    if (res.require2FA) {
      askForCode({ method: "google", googleAccessToken }, res.message);
    } else if (res.accessToken) {
      completeLogin(res);
    }
  };

  // Google Login Hook
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      toast.loading("Authenticating with Google...", { id: "google-auth" });
      try {
        await submitGoogle(tokenResponse.access_token);
        toast.dismiss("google-auth");
      } catch (err) {
        console.error("Google Login Error", err);
        reportError(errorMessage(err, "Google Login failed"), {
          id: "google-auth",
        });
      } finally {
        setLoading(false);
      }
    },
    onError: () => reportError("Google Login Failed"),
  });

  // Handlers
  const handleLogin = async (e) => {
    e.preventDefault();
    setFormError("");
    setLoading(true);
    try {
      if (twoFactor?.method === "google") {
        await submitGoogle(twoFactor.googleAccessToken, totpCode);
        return;
      }
      const res = await postForm("/auth/login", {
        email: loginData.user_name,
        password: loginData.password,
        ...(twoFactor ? { totp: totpCode } : {}),
      });
      if (res.require2FA) {
        askForCode({ method: "password" }, res.message);
      } else if (res.accessToken) {
        completeLogin(res);
      }
    } catch (err) {
      reportError(errorMessage(err, "Invalid credentials"));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setFormError("");
    if (registerStep === 0) { setRegisterStep(1); return; }
    if (registerData.password !== registerData.confirm_password)
      return reportError("Passwords do not match");

    setLoading(true);
    try {
      const res = await postForm("/auth/register", registerData);
      setEmailForOtp(res.email);
      setShowOtpInput(true);
      setResendCooldown(60);
      toast.success("Check your email for OTP.");
    } catch (err) {
      reportError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setFormError("");
    setLoading(true);
    try {
      await postForm("/auth/verify-email-otp", {
        email: emailForOtp,
        otp: otpCode,
      });
      toast.success("Verified! Please login.");
      setShowOtpInput(false);
      setOtpCode("");
      setActiveTab("login");
      setParams({}, { replace: true });
    } catch (err) {
      reportError(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!emailForOtp) return reportError("Please enter your email");

    setLoading(true);
    try {
      const res = await postForm("/auth/forgot-password", { email: emailForOtp });
      toast.success(res.message);
      setShowForgotPassword(false);
      setActiveTab("login");
      setShowOtpInput(false); // reusing state logic or add new state
    } catch (err) {
      reportError(err.response?.data?.message || "Request failed");
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP cooldown
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleResendOTP = async () => {
    if (resendCooldown > 0 || !emailForOtp) return;

    try {
      setLoading(true);
      const res = await postForm("/auth/resend-otp", { email: emailForOtp });
      toast.success(res.message);
      setResendCooldown(60); // 60 seconds cooldown
    } catch (err) {
      reportError(err.response?.data?.message || "Resend failed");
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    const next = activeTab === "login" ? "register" : "login";
    setActiveTab(next);
    setRegisterStep(0);
    setParams(next === "register" ? { mode: "register" } : {}, { replace: true });
    setTwoFactor(null); setTotpCode(""); setFormError(""); setShowPassword(false);
  };
  const backToLogin = () => { setShowForgotPassword(false); setShowOtpInput(false); setTwoFactor(null); setTotpCode(""); setFormError(""); setActiveTab("login"); setRegisterStep(0); setParams({}, { replace: true }); };
  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [activeTab, showForgotPassword, showOtpInput, twoFactor, registerStep]);
  const title = showOtpInput ? "Check your inbox." : showForgotPassword ? "Forgot your password?" : twoFactor ? "One more step." : activeTab === "login" ? "Good to see you again." : registerStep === 0 ? "Create your account." : "Secure your account.";
  const subtitle = showOtpInput ? "Enter the six-digit verification code sent to " + emailForOtp : showForgotPassword ? "Enter your account email and we'll send you a password reset link." : twoFactor ? "Enter the six-digit code from your authenticator app to finish signing in." : activeTab === "login" ? "Sign in to your workspace. Your next move is waiting." : registerStep === 0 ? "A new perspective starts with a few details." : "Choose your login details.";
  return <div className="auth-page">
    <header className="auth-header public-container"><PublicBrand /><Link to="/" className="auth-back"><ArrowLeft size={14} />Back to the platform</Link></header>
    <main className="auth-layout public-container">
      <AuthStory />
      <section className="auth-form-column" aria-labelledby="auth-title"><div className="auth-card" data-auth-mode={showOtpInput ? "verify" : showForgotPassword ? "recovery" : twoFactor ? "challenge" : activeTab}>
        <span className="auth-form-heading-icon">{showOtpInput ? <MailCheck size={19} /> : twoFactor ? <ShieldCheck size={19} /> : <LockKeyhole size={18} />}</span>
        <h1 id="auth-title" ref={headingRef} tabIndex={-1}>{title}</h1><p className="auth-form-description">{subtitle}</p>
        {formError && <div className="auth-error" role="alert">{formError}</div>}
        {!showOtpInput && !showForgotPassword && !twoFactor && (activeTab === "login" || registerStep === 0) && <><button type="button" className="auth-social auth-demo" onClick={() => { setFormError(""); startDemo(); }} disabled={busy}><FlaskConical size={17} aria-hidden="true" />{demoLoading ? "Preparing your demo…" : "Try the demo — no signup"}</button><button type="button" className="auth-social" onClick={() => { setFormError(""); googleLogin(); }} disabled={busy}><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09A6.98 6.98 0 0 1 5.49 12c0-.73.13-1.43.35-2.09V7.07H2.18A11 11 0 0 0 1 12c0 1.78.43 3.47 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/></svg>Continue with Google</button><div className="auth-divider">or continue with email</div></>}
        {showOtpInput ? <form key="otp" onSubmit={handleVerifyOTP} className="auth-form" aria-label="Email verification">
          <AuthField label="Verification code" className="auth-otp-field" value={otpCode} onChange={e => setOtpCode(e.target.value.replace(/\D/g, "").slice(0,6))} inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} placeholder="000000" required />
          <button type="submit" disabled={loading || otpCode.length !== 6} className="public-button auth-submit">{loading ? "Verifying…" : "Verify email"}<ArrowRight size={16} /></button>
          <button type="button" className="auth-text-button" onClick={handleResendOTP} disabled={resendCooldown > 0 || loading}>{resendCooldown > 0 ? "Resend code in " + resendCooldown + "s" : "Resend verification code"}</button><button type="button" className="auth-text-button auth-flow-back" onClick={backToLogin}><ArrowLeft size={13} />Back to sign in</button>
        </form> : showForgotPassword ? <form key="forgot" onSubmit={handleForgotPassword} className="auth-form" aria-label="Password recovery">
          <AuthField label="Email address" type="email" value={emailForOtp} onChange={e => setEmailForOtp(e.target.value)} autoComplete="email" placeholder="you@example.com" required />
          <button type="submit" disabled={loading} className="public-button auth-submit">{loading ? "Sending link…" : "Send reset link"}<ArrowRight size={16} /></button><button type="button" className="auth-text-button auth-flow-back" onClick={backToLogin}><ArrowLeft size={13} />Back to sign in</button>
        </form> : activeTab === "login" ? <form key="login" onSubmit={handleLogin} className="auth-form" aria-label="Sign in">
          {!twoFactor && <><AuthField label="Email or username" value={loginData.user_name} onChange={e => setLoginData({...loginData,user_name:e.target.value})} autoComplete="username" autoCapitalize="none" spellCheck={false} placeholder="Enter your email or username" required />
          <AuthField label="Password" type={showPassword ? "text" : "password"} className="auth-password-field" inputMode="text" value={loginData.password} onChange={e => setLoginData({...loginData,password:e.target.value})} autoComplete="current-password" placeholder="Enter your password" required passwordToggle={<button type="button" className="auth-password-toggle" aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>} />
          <div className="auth-forgot-row"><button type="button" className="auth-text-button" onClick={() => { setShowForgotPassword(true); setFormError(""); }}>Forgot password?</button></div></>}
          {twoFactor && <AuthField label="Authenticator code" className="auth-otp-field" value={totpCode} onChange={e => setTotpCode(e.target.value.replace(/\D/g, "").slice(0,6))} inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} placeholder="000000" required />}
          <button type="submit" disabled={loading || !!twoFactor && totpCode.length !== 6} className="public-button auth-submit">{loading ? "Signing in…" : twoFactor ? "Verify and sign in" : "Sign in"}<ArrowRight size={16} /></button>
          {twoFactor && <button type="button" onClick={backToLogin} className="auth-text-button auth-flow-back"><ArrowLeft size={13} />Use a different account</button>}
        </form> : <form key={"register-" + registerStep} onSubmit={handleRegister} className="auth-form" aria-label="Create account">
          <div className="auth-stepper" aria-label={"Account setup, step " + (registerStep + 1) + " of 2"}><span className={registerStep === 0 ? "is-current" : "is-complete"}><b>1</b>About you</span><i /><span className={registerStep === 1 ? "is-current" : ""}><b>2</b>Account security</span></div>
          {registerStep === 0 ? <div className="auth-form-grid">
            <AuthField label="Full name" className="auth-field-wide" value={registerData.name} onChange={e => setRegisterData({...registerData,name:e.target.value})} autoComplete="name" placeholder="Your full name" required />
            <AuthField label="Email address" className="auth-field-wide" value={registerData.email} onChange={e => setRegisterData({...registerData,email:e.target.value})} type="email" autoComplete="email" placeholder="you@example.com" required />
          </div> : <div className="auth-form-grid auth-register-grid">
            <AuthField label="Phone number" value={registerData.phone} onChange={e => setRegisterData({...registerData,phone:e.target.value})} type="tel" autoComplete="tel" placeholder="Phone" required />
            <AuthField label="Username" value={registerData.user_name} onChange={e => setRegisterData({...registerData,user_name:e.target.value})} autoComplete="username" autoCapitalize="none" spellCheck={false} placeholder="Username" required />
            <AuthField label="Password" className="auth-field-wide" type="password" value={registerData.password} onChange={e => setRegisterData({...registerData,password:e.target.value})} autoComplete="new-password" placeholder="Create a password" required />
            <AuthField label="Confirm password" className="auth-field-wide" type="password" value={registerData.confirm_password} onChange={e => setRegisterData({...registerData,confirm_password:e.target.value})} autoComplete="new-password" placeholder="Repeat your password" required />
          </div>}
          <button type="submit" disabled={loading} className="public-button auth-submit">{loading ? "Creating account…" : registerStep === 0 ? "Continue" : "Create account"}<ArrowUpRight size={16} /></button>
          {registerStep === 1 && <button type="button" className="auth-text-button auth-flow-back" onClick={() => { setRegisterStep(0); setFormError(""); }}><ArrowLeft size={13} />Previous step</button>}
        </form>}
        {!showOtpInput && !showForgotPassword && !twoFactor && <div className="auth-card-footer">{activeTab === "login" ? "New to NexChain?" : "Already have an account?"}<button type="button" className="auth-text-button" onClick={switchMode}>{activeTab === "login" ? "Create an account" : "Sign in"}</button></div>}
      </div><p className="auth-security-note"><ShieldCheck size={12} /> A practice workspace. No deposits or real-money trades.</p></section>
    </main>
    <footer className="auth-footer public-container"><span>© {new Date().getFullYear()} NexChain</span><p>Practice with virtual funds. Learn from real markets. Nothing on this platform is financial advice.</p></footer>
  </div>;
};
export default AuthPage;
