import toast from "react-hot-toast";

// The API host (Render) sleeps after ~15 idle minutes and takes up to a minute
// to wake. When an API request is still pending after WAKE_NOTICE_MS and the
// server hasn't answered anything recently (so it may be asleep), show one
// notice, so a slow first click doesn't look broken. Slow requests while the
// server is clearly awake (e.g. an AI chat answer) never show it.
export const WAKE_NOTICE_MS = 4000;
export const AWAKE_WINDOW_MS = 10 * 60 * 1000;
export const WAKE_TOAST_ID = "server-waking";

let pending = 0;
let timer = null;
let shown = false;
let lastAnswerAt = 0;

const mayBeAsleep = () => Date.now() - lastAnswerAt > AWAKE_WINDOW_MS;

export const requestStarted = () => {
  pending += 1;
  if (timer || !mayBeAsleep()) return;
  timer = setTimeout(() => {
    timer = null;
    if (pending > 0 && mayBeAsleep()) {
      shown = true;
      toast.loading("Waking up the server… this can take up to a minute.", { id: WAKE_TOAST_ID });
    }
  }, WAKE_NOTICE_MS);
};

/** @param {boolean} answered the server responded (any HTTP status), not a network failure */
export const requestFinished = (answered = true) => {
  if (answered) lastAnswerAt = Date.now();
  pending = Math.max(0, pending - 1);
  // Any answer means the server is up, so the rest will be quick
  if (shown && (answered || pending === 0)) {
    shown = false;
    toast.dismiss(WAKE_TOAST_ID);
  }
  if (pending === 0) {
    clearTimeout(timer);
    timer = null;
  }
};

/** Tracks a request made outside the api client (e.g. the session refresh) */
export const trackRequest = (promise) => {
  requestStarted();
  return promise.then(
    (value) => {
      requestFinished(true);
      return value;
    },
    (error) => {
      requestFinished(!!error?.response);
      throw error;
    },
  );
};

/** Test helper */
export const resetServerWake = () => {
  clearTimeout(timer);
  pending = 0;
  timer = null;
  shown = false;
  lastAnswerAt = 0;
};
