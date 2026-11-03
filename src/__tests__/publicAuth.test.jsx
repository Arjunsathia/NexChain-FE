import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import AuthPage from "@/Pages/AuthPage";
import ResetPassword from "@/Pages/ResetPassword";
import { postForm, setMemoryToken } from "@/api/axiosConfig";

const { dispatch } = vi.hoisted(() => ({ dispatch: vi.fn() }));
vi.mock("react-redux", () => ({ useDispatch: () => dispatch }));
vi.mock("@react-oauth/google", () => ({ useGoogleLogin: () => vi.fn() }));
vi.mock("@/api/axiosConfig", () => ({ postForm: vi.fn(), setMemoryToken: vi.fn() }));
vi.mock("@/redux/slices/userSlice", () => ({ setSession: payload => ({ type: "session", payload }) }));
vi.mock("react-hot-toast", () => ({ default: Object.assign(vi.fn(), { error: vi.fn(), success: vi.fn(), loading: vi.fn(), dismiss: vi.fn() }) }));

const open = (url = "/auth") => render(<MemoryRouter initialEntries={[url]}><Routes><Route path="/auth" element={<AuthPage />} /><Route path="/reset-password" element={<ResetPassword />} /><Route path="/dashboard" element={<h1>Workspace</h1>} /></Routes></MemoryRouter>);
const fill = (label, value) => fireEvent.change(screen.getByLabelText(label, { exact: true }), { target: { value } });
const register = () => {
  fill("Full name", "Preview User"); fill("Email address", "preview@example.com");
  fireEvent.submit(screen.getByRole("form", { name: "Create account" }));
  fill("Phone number", "5550100100"); fill("Username", "preview-user");
  fill("Password", "test-password-123"); fill("Confirm password", "test-password-123");
};

beforeEach(() => { vi.clearAllMocks(); window.scrollTo = vi.fn(); });
afterEach(cleanup);

describe("Public authentication flows", () => {
  it("does not create an account on the first signup step and preserves entered details when going back", () => {
    open("/auth?mode=register");
    fill("Full name", "Preview User"); fill("Email address", "preview@example.com");
    fireEvent.submit(screen.getByRole("form", { name: "Create account" }));
    expect(screen.getByLabelText("Username", { exact: true })).toBeTruthy();
    expect(postForm).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Previous step" }));
    expect(screen.getByLabelText("Full name", { exact: true }).value).toBe("Preview User");
    expect(screen.getByLabelText("Email address", { exact: true }).value).toBe("preview@example.com");
    expect(postForm).not.toHaveBeenCalled();
  });
  it("opens registration from the landing CTA query and rejects a password mismatch", () => {
    open("/auth?mode=register"); register(); fill("Confirm password", "different-password");
    fireEvent.submit(screen.getByRole("form", { name: "Create account" }));
    expect(screen.getByRole("alert").textContent).toContain("Passwords do not match");
    expect(postForm).not.toHaveBeenCalled();
  });

  it("keeps registration behind email verification and only accepts six numeric code digits", async () => {
    postForm.mockResolvedValueOnce({ email: "preview@example.com" });
    open("/auth?mode=register"); register();
    fireEvent.submit(screen.getByRole("form", { name: "Create account" }));
    await screen.findByLabelText("Verification code");
    expect(postForm).toHaveBeenCalledWith("/auth/register", { name: "Preview User", email: "preview@example.com", phone: "5550100100", user_name: "preview-user", password: "test-password-123", confirm_password: "test-password-123" });
    expect(dispatch).not.toHaveBeenCalled();
    fill("Verification code", "a12b34567");
    expect(screen.getByLabelText("Verification code").value).toBe("123456");
    expect(screen.getByRole("button", { name: /Resend code in/ }).disabled).toBe(true);
  });

  it("preserves the credentials through an authenticator challenge before establishing a session", async () => {
    postForm.mockResolvedValueOnce({ require2FA: true }).mockResolvedValueOnce({ accessToken: "test-token", user: { name: "Preview User" } });
    open(); fill("Email or username", "preview@example.com"); fill("Password", "test-password-123");
    fireEvent.submit(screen.getByRole("form", { name: "Sign in" }));
    await screen.findByLabelText("Authenticator code");
    expect(setMemoryToken).not.toHaveBeenCalled();
    fill("Authenticator code", "123456");
    fireEvent.submit(screen.getByRole("form", { name: "Sign in" }));
    await screen.findByRole("heading", { name: "Workspace" });
    expect(postForm).toHaveBeenLastCalledWith("/auth/login", { email: "preview@example.com", password: "test-password-123", totp: "123456" });
    expect(setMemoryToken).toHaveBeenCalledWith("test-token");
    expect(dispatch).toHaveBeenCalledTimes(1);
  });

  it("returns to sign in after a successful password recovery request", async () => {
    postForm.mockResolvedValueOnce({ message: "Reset link sent" }); open();
    fireEvent.click(screen.getByRole("button", { name: "Forgot password?" }));
    fill("Email address", "preview@example.com");
    fireEvent.submit(screen.getByRole("form", { name: "Password recovery" }));
    await screen.findByLabelText("Email or username");
    expect(postForm).toHaveBeenCalledWith("/auth/forgot-password", { email: "preview@example.com" });
    expect(screen.queryByRole("form", { name: "Password recovery" })).toBeNull();
  });

  it("does not submit a login when returning from recovery with credentials already filled", () => {
    open(); fill("Email or username", "preview@example.com"); fill("Password", "test-password-123");
    fireEvent.click(screen.getByRole("button", { name: "Forgot password?" }));
    fireEvent.click(screen.getByRole("button", { name: "Back to sign in" }));
    expect(screen.getByRole("heading", { name: "Good to see you again." })).toBeTruthy();
    expect(postForm).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Sign in", exact: true }).disabled).toBe(false);
  });

  it("shows an inline service error without losing the entered login fields", async () => {
    postForm.mockRejectedValueOnce(new Error("Network unavailable")); open();
    fill("Email or username", "preview@example.com"); fill("Password", "test-password-123");
    fireEvent.submit(screen.getByRole("form", { name: "Sign in" }));
    await waitFor(() => expect(screen.getByRole("alert").textContent).toContain("couldn't connect"));
    expect(screen.getByLabelText("Email or username").value).toBe("preview@example.com");
    expect(dispatch).not.toHaveBeenCalled();
  });

  it("starts a one-click demo session and opens the workspace", async () => {
    postForm.mockResolvedValueOnce({ accessToken: "demo-token", user: { name: "Demo Trader", isDemo: true } });
    open();
    fireEvent.click(screen.getByRole("button", { name: /Try the demo/ }));
    await screen.findByRole("heading", { name: "Workspace" });
    expect(postForm).toHaveBeenCalledWith("/auth/demo");
    expect(setMemoryToken).toHaveBeenCalledWith("demo-token");
    expect(dispatch).toHaveBeenCalledWith({ type: "session", payload: { user: { name: "Demo Trader", isDemo: true }, accessToken: "demo-token" } });
  });

  it("stays on sign in when the demo can't start", async () => {
    postForm.mockRejectedValueOnce({ response: { status: 429, data: { message: "Too many demo accounts" } } });
    open();
    fireEvent.click(screen.getByRole("button", { name: /Try the demo/ }));
    await waitFor(() => expect(postForm).toHaveBeenCalledWith("/auth/demo"));
    expect(screen.getByRole("heading", { name: "Good to see you again." })).toBeTruthy();
    expect(dispatch).not.toHaveBeenCalled();
  });

  it("disables password reset when the recovery link is incomplete", () => {
    open("/reset-password");
    expect(screen.getByRole("button", { name: "Update password" }).disabled).toBe(true);
    expect(screen.getByRole("alert").textContent).toContain("reset link is incomplete");
    expect(postForm).not.toHaveBeenCalled();
  });
});
