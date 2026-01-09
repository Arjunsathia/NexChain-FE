// Simple Event Bus for 2FA Challenges
export const TwoFactorEvent = {
  listeners: [],

  // Trigger the modal and return a promise
  request(data) {
    return new Promise((resolve, reject) => {
      this.notify({ ...data, resolve, reject });
    });
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
