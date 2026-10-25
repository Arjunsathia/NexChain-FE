import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";
import api, {
  refreshSession,
  setMemoryToken,
  getAccessToken,
  SESSION_EXPIRED_EVENT,
} from "@/api/axiosConfig";
import { TwoFactorEvent } from "@/utils/twoFactorEvent";

// Fake transport for the shared api instance: respond(config) → { status, data }
const useAdapter = (respond) => {
  api.defaults.adapter = async (config) => {
    const { status, data } = await respond(config);
    const response = { status, data, headers: { "content-type": "application/json" }, config };
    if (status >= 400) {
      const error = new Error(`Request failed with status ${status}`);
      error.config = config;
      error.response = response;
      throw error;
    }
    return response;
  };
};

beforeEach(() => setMemoryToken(null));

describe("refreshSession", () => {
  it("shares one refresh request between concurrent callers", async () => {
    const post = vi
      .spyOn(axios, "post")
      .mockResolvedValue({ data: { accessToken: "fresh", user: { id: "u1" } } });

    const results = await Promise.all([refreshSession(), refreshSession(), refreshSession()]);

    expect(post).toHaveBeenCalledTimes(1);
    expect(results.every((r) => r.accessToken === "fresh")).toBe(true);
    expect(getAccessToken()).toBe("fresh");
  });
});

describe("401 handling", () => {
  it("refreshes once and replays the request with the new token", async () => {
    vi.spyOn(axios, "post").mockResolvedValue({ data: { accessToken: "fresh" } });
    setMemoryToken("stale");
    useAdapter(async (config) =>
      config.headers.Authorization === "Bearer fresh"
        ? { status: 200, data: { ok: true } }
        : { status: 401, data: {} },
    );

    const res = await api.get("/users/u1");
    expect(res.data).toEqual({ ok: true });
  });

  it("signals session expiry when the refresh fails", async () => {
    vi.spyOn(axios, "post").mockRejectedValue(new Error("401"));
    const onExpired = vi.fn();
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired);
    setMemoryToken("stale");
    useAdapter(async () => ({ status: 401, data: {} }));

    await expect(api.get("/users/u1")).rejects.toBeTruthy();
    expect(onExpired).toHaveBeenCalledTimes(1);
    expect(getAccessToken()).toBeNull();
    window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired);
  });

  it("does not try to refresh after a failed login", async () => {
    const post = vi.spyOn(axios, "post");
    useAdapter(async () => ({ status: 401, data: { message: "Invalid email or password" } }));

    await expect(api.post("/auth/login", {})).rejects.toBeTruthy();
    expect(post).not.toHaveBeenCalled();
  });
});

describe("TwoFactorEvent", () => {
  it("concurrent 2FA challenges share one prompt", async () => {
    const prompts = [];
    const unsubscribe = TwoFactorEvent.subscribe((req) => prompts.push(req));

    const first = TwoFactorEvent.request({});
    const second = TwoFactorEvent.request({});
    prompts[0].resolve("123456");

    expect(prompts).toHaveLength(1);
    await expect(first).resolves.toBe("123456");
    await expect(second).resolves.toBe("123456");
    unsubscribe();
  });
});
