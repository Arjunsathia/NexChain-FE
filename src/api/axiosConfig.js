import axios from "axios";
import { TwoFactorEvent } from "../utils/twoFactorEvent";

const getBaseUrl = () => {
  if (import.meta.env.VITE_BASE_URL) return import.meta.env.VITE_BASE_URL;
  if (import.meta.env.DEV) return `http://${window.location.hostname}:5050/api`;
  return "/api"; // Production fallback to relative path
};

const API_BASE_URL = getBaseUrl();

const COINGECKO_BASE_URL = import.meta.env.DEV 
  ? "/api/coingecko" 
  : "https://api.coingecko.com/api/v3";
  
export const SERVER_URL = API_BASE_URL.replace('/api', '');

export const coinGecko = axios.create({
  baseURL: COINGECKO_BASE_URL,
});


coinGecko.interceptors.response.use(
  (response) => {
    const contentType = response.headers["content-type"];
    if (contentType && !contentType.includes("application/json")) {
      console.warn("⚠️ API Warning: Received non-JSON response from CoinGecko proxy (likely HTML fallback). Blocking.");
      return Promise.reject(new Error("Invalid API response format (expected JSON)"));
    }
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);


const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  
  
});


let memoryToken = null;

export const setMemoryToken = (token) => {
  memoryToken = token;
};



api.interceptors.request.use(
  (config) => {
    try {
      const token = memoryToken || localStorage.getItem("NEXCHAIN_USER_TOKEN");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Error getting token from localStorage:", error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);


api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Check for 2FA requirement
    if (error.response?.status === 403 && error.response?.data?.require2FA && !originalRequest._isRetry) {
        originalRequest._isRetry = true;
        
        try {
            // Request code from user via Modal
            const code = await TwoFactorEvent.request({});
            
            // Add code to headers and retry
            originalRequest.headers['X-Admin-2FA-Code'] = code;
            return api(originalRequest);
        } catch {
             return Promise.reject(new Error("2FA Authentication Cancelled or Failed"));
        }
    }

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, { withCredentials: true });
        const { accessToken } = response.data;

        if (accessToken) {
          setMemoryToken(accessToken);
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, user should be logged out
        console.error("Token refresh failed", refreshError);
        // We might want to dispatch logout here, but we don't have store access
        // For now, let the error propagate
      }
    }

    console.error("API Error:", error.response?.status, error.response?.data || error.message);
    return Promise.reject(error);
  }
);


export const getData = async (url, params) => {
  try {
    const response = await api.get(url, params && { params });
    return response.data;
  } catch (error) {
    console.error("GET Error for", url, error);
    throw error;
  }
};

export const getById = async (url, id) => {
  try {
    const response = await api.get(`${url}/${id}`);
    return response.data;
  } catch (error) {
    console.error("GET by ID Error for", `${url}/${id}`, error);
    throw error;
  }
};

export const postForm = async (url, formData) => {
  try {
    const response = await api.post(url, formData);
    return response.data;
  } catch (error) {
    console.error("POST Error for", url, error);
    throw error;
  }
};

export const updateById = async (url, id, updateData) => {
  try {
    const response = await api.put(`${url}/${id}`, updateData);
    return response.data;
  } catch (error) {
    console.error("Update Error for", `${url}/${id}`, error);
    throw error;
  }
};

export const deleteById = async (url, id) => {
  try {
    const response = await api.delete(`${url}/${id}`);
    return response.data;
  } catch (error) {
    console.error("Delete Error for", `${url}/${id}`, error);
    throw error;
  }
};

export const login = async (url, credentials) => {
  try {
    const response = await api.post(url, credentials);
    return response.data;
  } catch (error) {
    console.error("Login Error", error);
    throw error;
  }
};

export const logout = async () => {
  try {
    await api.post("/auth/logout");
  } catch (error) {
    console.error("Logout Error", error);
    throw error;
  }
};

export const deleteWatchList = async (url, params) => {
  try {
    const response = await api.delete(url, { params });
    return response.data;
  } catch (error) {
    console.error("Delete Error", error);
    throw error;
  }
};

export default api;