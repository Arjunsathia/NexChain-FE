import axios from "axios";
import { TwoFactorEvent } from "../utils/twoFactorEvent";
import toast from "react-hot-toast";

const getBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) return import.meta.env.VITE_API_BASE_URL;

  // Dynamic fallback for local development (supports mobile testing via IP)
  if (typeof window !== 'undefined') {
    return `${window.location.protocol}//${window.location.hostname}:4001/api`;
  }

  return "http://localhost:4001/api";
};

const API_BASE_URL = getBaseUrl();

const COINGECKO_BASE_URL = import.meta.env.DEV
  ? "/api/coingecko"
  : "https://api.coingecko.com/api/v3";

// Strip only the trailing /api so hosts like api.example.com stay intact
export const SERVER_URL = API_BASE_URL.replace(/\/api\/?$/, "");

export const BACKEND_WS_URL =
  import.meta.env.VITE_WS_URL || SERVER_URL.replace(/^http/, "ws");

export const BINANCE_WS_URL =
  import.meta.env.VITE_BINANCE_WS_URL || "wss://stream.binance.com:9443";

export const coinGecko = axios.create({
  baseURL: COINGECKO_BASE_URL,
});

coinGecko.interceptors.response.use(
  (response) => {
    const contentType = response.headers["content-type"];
    if (contentType && !contentType.includes("application/json")) {
      // console.warn(
      //   "⚠️ API Warning: Received non-JSON response from CoinGecko proxy (likely HTML fallback). Blocking.",
      // );
      return Promise.reject(
        new Error("Invalid API response format (expected JSON)"),
      );
    }
    return response;
  },
  (error) => {
    return Promise.reject(error);
  },
);

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// The access token lives only in memory (never localStorage, where any script
// could read it). The httpOnly refresh cookie restores it after a reload.
let memoryToken = null;

export const setMemoryToken = (token) => {
  memoryToken = token;
};

export const getAccessToken = () => memoryToken;

export const SESSION_EXPIRED_EVENT = "nexchain:session-expired";

// One refresh at a time: concurrent 401s all wait for the same request
let refreshPromise = null;

/** @returns {Promise<{ accessToken: string, user: object }>} */
export const refreshSession = () => {
  if (!refreshPromise) {
    refreshPromise = axios
      .post(`${API_BASE_URL}/auth/refresh`, {}, { withCredentials: true })
      .then((res) => {
        setMemoryToken(res.data.accessToken);
        return res.data;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
};

api.interceptors.request.use(
  (config) => {
    if (memoryToken) {
      config.headers.Authorization = `Bearer ${memoryToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// A wrong password also returns 401; those must not trigger a refresh
const isAuthEndpoint = (url = "") => /\/auth\/(login|register|refresh|google|logout)/.test(url);

api.interceptors.response.use(
  (response) => {
    const contentType = response?.headers?.["content-type"];
    if (contentType && !contentType.includes("application/json") && !contentType.includes("multipart/form-data")) {
      // Check if response is string and looks like HTML
      if (typeof response.data === 'string' && response.data.trim().startsWith('<')) {
        // console.warn("API Error: Received HTML instead of JSON. Check your API_BASE_URL.");
        return Promise.reject(new Error("Invalid API response: Received HTML (Check API URL)"));
      }
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Check for 2FA requirement
    if (
      error.response?.status === 403 &&
      error.response?.data?.require2FA &&
      !originalRequest._isRetry
    ) {
      originalRequest._isRetry = true;

      try {
        // Request code from user via Modal
        const code = await TwoFactorEvent.request({});

        // Add code to headers and retry
        originalRequest.headers["X-Admin-2FA-Code"] = code;
        return api(originalRequest);
      } catch {
        return Promise.reject(
          new Error("2FA Authentication Cancelled or Failed"),
        );
      }
    }

    // Expired access token: refresh once, then replay the request
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthEndpoint(originalRequest.url)
    ) {
      originalRequest._retry = true;

      try {
        const { accessToken } = await refreshSession();
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch {
        // The session is over: let the app sign out and send the user to /auth
        setMemoryToken(null);
        window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
      }
    }

    // Customize 429 handling
    if (error.response?.status === 429) {
      toast.error("Too many requests. Please slow down.");
    }

    return Promise.reject(error);
  },
);

export const getData = async (url, params) => {
  const response = await api.get(url, params && { params });
  return response.data;
};

export const getById = async (url, id) => {
  const response = await api.get(`${url}/${id}`);
  return response.data;
};

export const postForm = async (url, formData) => {
  const response = await api.post(url, formData);
  return response.data;
};

export const updateById = async (url, id, updateData) => {
  const response = await api.put(`${url}/${id}`, updateData);
  return response.data;
};

export const deleteById = async (url, id) => {
  const response = await api.delete(`${url}/${id}`);
  return response.data;
};

export const logout = async () => {
  try {
    await api.post("/auth/logout");
  } finally {
    setMemoryToken(null);
  }
};

export const deleteWatchList = async (url, params) => {
  const response = await api.delete(url, { params });
  return response.data;
};

export default api;
