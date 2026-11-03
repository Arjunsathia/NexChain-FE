import { describe, expect, it } from "vitest";
import { validateTrade, fillsImmediately } from "@/Components/TradeModal/validateTrade";

const market = { orderType: "market", currentPrice: 50000, symbol: "btc" };
const buy = (o) => validateTrade({ side: "buy", usdAmount: "100", coinAmount: "0.002", maxAvailable: 0.2, ...market, ...o });
const sell = (o) => validateTrade({ side: "sell", usdAmount: "100", coinAmount: "0.002", available: 0.01, ...market, ...o });

describe("validateTrade: amounts", () => {
  it("accepts a normal market buy and sell", () => {
    expect(buy()).toBeNull();
    expect(sell()).toBeNull();
  });

  it("rejects empty or non-positive amounts", () => {
    expect(buy({ usdAmount: "" })).toMatch(/valid amount/);
    expect(buy({ usdAmount: "0" })).toMatch(/valid amount/);
    expect(buy({ usdAmount: "-5" })).toMatch(/valid amount/);
  });

  it("rejects buys larger than the balance allows", () => {
    expect(buy({ coinAmount: "0.3" })).toBe("Insufficient balance for this purchase");
  });

  it("rejects selling without holdings, more than held, or dust", () => {
    expect(sell({ available: 0 })).toMatch(/No holdings/);
    expect(sell({ coinAmount: "0.02" })).toBe("You only have 0.01000000 BTC available");
    expect(sell({ coinAmount: "0.0000001" })).toMatch(/Minimum sell amount/);
    expect(sell({ coinAmount: "0" })).toMatch(/valid amount to sell/);
  });

  it("allows selling the whole position despite float rounding", () => {
    expect(sell({ coinAmount: "0.0100000000001" })).toBeNull();
  });
});

describe("validateTrade: stop and OCO prices", () => {
  it("requires the prices each order type needs", () => {
    expect(buy({ orderType: "stop_market" })).toBe("Please enter a stop price");
    expect(buy({ orderType: "stop_limit", stopPrice: "51000" })).toMatch(/both stop and limit/);
    expect(buy({ orderType: "oco", limitPrice: "49000" })).toMatch(/take-profit/);
  });

  it("puts buy stops above and sell stops below the market", () => {
    expect(buy({ orderType: "stop_limit", stopPrice: "51000", limitPrice: "51500" })).toBeNull();
    expect(buy({ orderType: "stop_limit", stopPrice: "49000", limitPrice: "49500" })).toMatch(/buy stop must be above/);
    expect(sell({ orderType: "stop_limit", stopPrice: "49000", limitPrice: "48500" })).toBeNull();
    expect(sell({ orderType: "stop_limit", stopPrice: "51000", limitPrice: "51500" })).toMatch(/sell stop must be below/);
  });

  it("applies the same rule to stop-market orders, which would otherwise fill at once", () => {
    expect(buy({ orderType: "stop_market", stopPrice: "51000" })).toBeNull();
    expect(buy({ orderType: "stop_market", stopPrice: "49000" })).toMatch(/buy stop must be above/);
    expect(sell({ orderType: "stop_market", stopPrice: "49000" })).toBeNull();
    expect(sell({ orderType: "stop_market", stopPrice: "50000" })).toMatch(/sell stop must be below/);
  });

  it("checks both OCO legs against the market", () => {
    expect(buy({ orderType: "oco", limitPrice: "48000", stopPrice: "52000" })).toBeNull();
    expect(buy({ orderType: "oco", limitPrice: "51000", stopPrice: "52000" })).toMatch(/buy limit must be below/);
    expect(buy({ orderType: "oco", limitPrice: "48000", stopPrice: "49000" })).toMatch(/buy stop must be above/);
    expect(sell({ orderType: "oco", limitPrice: "52000", stopPrice: "48000" })).toBeNull();
    expect(sell({ orderType: "oco", limitPrice: "49000", stopPrice: "48000" })).toMatch(/take profit must be above/);
    expect(sell({ orderType: "oco", limitPrice: "52000", stopPrice: "51000" })).toMatch(/stop loss must be below/);
  });
});

describe("fillsImmediately", () => {
  it("flags limit prices already past the market", () => {
    expect(fillsImmediately({ side: "buy", orderType: "limit", limitPrice: "51000", currentPrice: 50000 })).toBe(true);
    expect(fillsImmediately({ side: "buy", orderType: "limit", limitPrice: "49000", currentPrice: 50000 })).toBe(false);
    expect(fillsImmediately({ side: "sell", orderType: "limit", limitPrice: "49000", currentPrice: 50000 })).toBe(true);
    expect(fillsImmediately({ side: "sell", orderType: "stop_limit", limitPrice: "51000", currentPrice: 50000 })).toBe(false);
  });

  it("ignores market and OCO orders", () => {
    expect(fillsImmediately({ side: "buy", orderType: "market", limitPrice: "99999", currentPrice: 50000 })).toBe(false);
    expect(fillsImmediately({ side: "buy", orderType: "oco", limitPrice: "99999", currentPrice: 50000 })).toBe(false);
  });
});
