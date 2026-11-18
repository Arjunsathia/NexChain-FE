import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import toast from "react-hot-toast";
import {
  requestStarted,
  requestFinished,
  trackRequest,
  resetServerWake,
  WAKE_NOTICE_MS,
  WAKE_TOAST_ID,
  AWAKE_WINDOW_MS,
} from "@/api/serverWake";

vi.mock("react-hot-toast", () => ({ default: { loading: vi.fn(), dismiss: vi.fn() } }));

beforeEach(() => {
  vi.useFakeTimers();
  vi.clearAllMocks();
  resetServerWake();
});
afterEach(() => vi.useRealTimers());

describe("waking-up notice", () => {
  it("appears when a request to a possibly sleeping server takes longer than 4 s", () => {
    requestStarted();
    vi.advanceTimersByTime(WAKE_NOTICE_MS - 1);
    expect(toast.loading).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(toast.loading).toHaveBeenCalledWith(expect.stringMatching(/Waking up the server/), { id: WAKE_TOAST_ID });

    requestFinished(true);
    expect(toast.dismiss).toHaveBeenCalledWith(WAKE_TOAST_ID);
  });

  it("never appears for quick requests", () => {
    requestStarted();
    vi.advanceTimersByTime(500);
    requestFinished(true);
    vi.advanceTimersByTime(WAKE_NOTICE_MS * 2);
    expect(toast.loading).not.toHaveBeenCalled();
  });

  it("shows once for many slow requests, and goes away when the server first answers", () => {
    requestStarted();
    requestStarted();
    requestStarted();
    vi.advanceTimersByTime(WAKE_NOTICE_MS);
    expect(toast.loading).toHaveBeenCalledTimes(1);

    requestFinished(true);
    expect(toast.dismiss).toHaveBeenCalledTimes(1);
  });

  it("stays quiet for slow requests while the server is clearly awake (e.g. AI chat)", () => {
    requestStarted();
    requestFinished(true); // the server just answered
    vi.advanceTimersByTime(60_000);

    requestStarted(); // a slow chat answer
    vi.advanceTimersByTime(WAKE_NOTICE_MS * 3);
    expect(toast.loading).not.toHaveBeenCalled();
    requestFinished(true);
  });

  it("can show again after the server has been idle long enough to sleep", () => {
    requestStarted();
    requestFinished(true);
    vi.advanceTimersByTime(AWAKE_WINDOW_MS + 1);

    requestStarted();
    vi.advanceTimersByTime(WAKE_NOTICE_MS);
    expect(toast.loading).toHaveBeenCalledTimes(1);
    requestFinished(true);
  });

  it("tracks requests made outside the api client (the session refresh)", async () => {
    let resolve;
    const pending = trackRequest(new Promise((r) => (resolve = r)));
    vi.advanceTimersByTime(WAKE_NOTICE_MS);
    expect(toast.loading).toHaveBeenCalledTimes(1);

    resolve("ok");
    await expect(pending).resolves.toBe("ok");
    expect(toast.dismiss).toHaveBeenCalledWith(WAKE_TOAST_ID);
  });

  it("passes failures through and clears the notice when nothing is pending", async () => {
    const failing = trackRequest(Promise.reject(new Error("Network Error")));
    await expect(failing).rejects.toThrow("Network Error");
    vi.advanceTimersByTime(WAKE_NOTICE_MS);
    expect(toast.loading).not.toHaveBeenCalled();
  });
});
