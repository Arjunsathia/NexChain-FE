import { BINANCE_WS_URL } from "@/api/axiosConfig";
import { CORE_COINS, getBinancePair } from "@/utils/coinRegistry";

// Live Binance prices shared by the whole app.
// - One socket, opened only while at least one component is subscribed.
// - Updates are batched once a second; listeners for a coin are only notified
//   when that coin changed, so a page showing one coin doesn't re-render for 30.

const FLUSH_MS = 1000;
const RECONNECT_MS = 3000;

let prices = {}; // coinId → ticker data (replaced per update, so snapshots are stable)
let buffer = {};
const pairToCoin = new Map(); // "btcusdt" → "bitcoin"
const coinListeners = new Map(); // coinId → Set<fn>
const allListeners = new Set();
let subscriberCount = 0;
let socket = null;
let flushTimer = null;
let reconnectTimer = null;

Object.entries(CORE_COINS).forEach(([coinId, base]) => pairToCoin.set(`${base}usdt`, coinId));

const parseTicker = (d) => {
  const price = parseFloat(d.c);
  const change = parseFloat(d.P);
  return {
    current_price: price,
    price_change_percentage_24h: change,
    price_change_24h: parseFloat(d.p),
    high_24h: parseFloat(d.h),
    low_24h: parseFloat(d.l),
    isPositive: change >= 0,
    price,
    change,
    volume: parseFloat(d.v),
    quoteVolume: parseFloat(d.q),
    total_volume: parseFloat(d.q),
  };
};

const flush = () => {
  const changed = Object.keys(buffer);
  if (changed.length === 0) return;
  prices = { ...prices, ...buffer };
  buffer = {};
  changed.forEach((coinId) => coinListeners.get(coinId)?.forEach((fn) => fn()));
  allListeners.forEach((fn) => fn());
};

const connect = () => {
  if (socket || subscriberCount === 0) return;
  const streams = [...pairToCoin.keys()].map((pair) => `${pair}@ticker`).join("/");
  const ws = new WebSocket(`${BINANCE_WS_URL}/stream?streams=${streams}`);
  socket = ws;

  ws.onmessage = (event) => {
    try {
      const message = JSON.parse(event.data);
      if (!message.stream || !message.data) return;
      const coinId = pairToCoin.get(message.stream.split("@")[0]);
      if (coinId) buffer[coinId] = parseTicker(message.data);
    } catch {
      // ignore malformed frames
    }
  };
  ws.onclose = () => {
    if (socket === ws) socket = null;
    if (subscriberCount > 0) reconnectTimer = setTimeout(connect, RECONNECT_MS);
  };
  ws.onerror = () => ws.close();

  if (!flushTimer) flushTimer = setInterval(flush, FLUSH_MS);
};

const disconnect = () => {
  clearTimeout(reconnectTimer);
  clearInterval(flushTimer);
  flushTimer = null;
  if (socket) {
    const ws = socket;
    socket = null;
    ws.onclose = null;
    // Closing while CONNECTING is allowed and prevents a leaked socket
    ws.close();
  }
};

const retain = () => {
  subscriberCount += 1;
  connect();
};

const release = () => {
  subscriberCount -= 1;
  if (subscriberCount <= 0) {
    subscriberCount = 0;
    disconnect();
  }
};

/**
 * Adds a coin outside the core list (e.g. a watchlist coin). Returns false if it
 * has no Binance pair.
 */
export const trackCoin = (coinId, symbol) => {
  if (!coinId) return false;
  if ([...pairToCoin.values()].includes(coinId)) return true;
  const pair = getBinancePair(coinId, symbol);
  if (!pair) return false;
  pairToCoin.set(pair, coinId);
  if (socket?.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ method: "SUBSCRIBE", params: [`${pair}@ticker`], id: Date.now() }));
  }
  return true;
};

/** For useSyncExternalStore: re-render when this coin updates */
export const subscribeCoin = (coinId, listener) => {
  retain();
  if (!coinListeners.has(coinId)) coinListeners.set(coinId, new Set());
  coinListeners.get(coinId).add(listener);
  return () => {
    coinListeners.get(coinId)?.delete(listener);
    release();
  };
};

/** For useSyncExternalStore: re-render on every batch */
export const subscribeAll = (listener) => {
  retain();
  allListeners.add(listener);
  return () => {
    allListeners.delete(listener);
    release();
  };
};

export const getCoinSnapshot = (coinId) => prices[coinId];
export const getAllSnapshot = () => prices;
