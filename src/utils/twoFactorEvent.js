// Simple Event Bus for 2FA Challenges
export const TwoFactorEvent = {
  listeners: [],

  pending: null,

  // Trigger the modal and return a promise. Concurrent requests share one
  // prompt, so a second 2FA challenge can't orphan the first one's promise.
  request(data) {
    if (!this.pending) {
      this.pending = new Promise((resolve, reject) => {
        this.notify({ ...data, resolve, reject });
      }).finally(() => {
        this.pending = null;
      });
    }
    return this.pending;
  },

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  },

  notify(data) {
    this.listeners.forEach((l) => l(data));
  },
};
