import { describe, it, expect, vi, afterEach } from "vitest";
import { formatUSD, formatCompact, formatTimeAgo } from "@/utils/format";
import { getAvatarUrl } from "@/utils/avatar";
import { safeUrl } from "@/utils/safeUrl";
import { getBinancePair } from "@/utils/coinRegistry";

afterEach(() => vi.useRealTimers());

describe("formatters", () => {
  it("formats USD with the same defaults the pages used", () => {
    expect(formatUSD(1234.5)).toBe("$1,234.50");
    expect(formatUSD(1234, { minimumFractionDigits: 0 })).toBe("$1,234");
  });

  it("formats compact numbers", () => {
    expect(formatCompact(1234567)).toBe("1.23M");
    expect(formatCompact(1234567, 1)).toBe("1.2M");
  });

  it("formats unix-second timestamps as relative time", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T12:00:00Z"));
    const now = Date.now() / 1000;
    expect(formatTimeAgo(now - 5 * 60)).toBe("5 min ago");
    expect(formatTimeAgo(now - 3 * 3600)).toBe("3h ago");
    expect(formatTimeAgo(now - 2 * 86400)).toBe("2d ago");
    expect(formatTimeAgo(null)).toBe("");
  });
});

describe("helpers", () => {
  it("builds avatar URLs for uploaded files but keeps full URLs", () => {
    expect(getAvatarUrl("https://cdn.example/a.png")).toBe("https://cdn.example/a.png");
    expect(getAvatarUrl("abc.png")).toMatch(/\/uploads\/abc\.png$/);
    expect(getAvatarUrl(null)).toBeNull();
  });

  it("only lets http(s) links through", () => {
    expect(safeUrl("https://news.example/a")).toBe("https://news.example/a");
    expect(safeUrl("javascript:alert(1)")).toBe("#");
    expect(safeUrl("not a url")).toBe("#");
  });

  it("maps coins to Binance pairs", () => {
    expect(getBinancePair("bitcoin")).toBe("btcusdt");
    expect(getBinancePair("some-new-coin", "NEW")).toBe("newusdt");
    expect(getBinancePair("tether", "usdt")).toBeNull();
  });
});
