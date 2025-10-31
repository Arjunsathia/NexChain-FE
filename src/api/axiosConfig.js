// src/api/axiosConfig.js
import axios from "axios";

export const coinGecko = axios.create({
  baseURL: "https://api.coingecko.com/api/v3",
});

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL || "http://localhost:5000",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor - FIXED TOKEN HANDLING
api.interceptors.request.use(
  (config) => {
    // Get token from NEXCHAIN_USER object
    try {
      const userData = localStorage.getItem("NEXCHAIN_USER");
      if (userData) {
        const user = JSON.parse(userData);
        const token = user.token || user.accessToken;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          // console.log("Token added to request:", token.substring(0, 20) + "...");
        }
      }
    } catch (error) {
      console.error("Error getting token from localStorage:", error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
api.interceptors.response.use(
  (response) => {
    // console.log("API Response:", response.config.url, response.status);
    return response;
  },
  (error) => {
    console.error("API Error:", error.response?.status, error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// GET request
export const getData = async (url, params) => {
  try {
    const response = await api.get(url, params && { params });
    // console.info("GET success:", url);
    return response.data;
  } catch (error) {
    console.error("GET Error for", url, error);
    throw error;
  }
};

// GET by ID
export const getById = async (url, id) => {
  try {
    // console.log("Making GET request to:", `${url}/${id}`);
    const response = await api.get(`${url}/${id}`);
    // console.info("GET by ID success:", `${url}/${id}`);
    return response.data;
  } catch (error) {
    console.error("GET by ID Error for", `${url}/${id}`, error);
    throw error;
  }
};

export const getDataP = async (url, params = {}) => {
  try {
    const response = await api.get(url, { params });
    return response.data;
  } catch (error) {
    console.error("GET Error for", url, error);
    throw error;
  }
};

// POST form data
export const postForm = async (url, formData) => {
  try {
    const response = await api.post(url, formData);
    // console.info("POST success:", url);
    return response.data;
  } catch (error) {
    console.error("POST Error for", url, error);
    throw error;
  }
};

// UPDATE by ID (PUT)
export const updateById = async (url, id, updateData) => {
  try {
    const response = await api.put(`${url}/${id}`, updateData);
    // console.info("Updated successfully:", `${url}/${id}`);
    return response.data;
  } catch (error) {
    console.error("Update Error for", `${url}/${id}`, error);
    throw error;
  }
};

// DELETE by ID
export const deleteById = async (url, id) => {
  try {
    const response = await api.delete(`${url}/${id}`);
    // console.info("Deleted successfully:", `${url}/${id}`);
    return response.data;
  } catch (error) {
    console.error("Delete Error for", `${url}/${id}`, error);
    throw error;
  }
};

// LOGIN (POST)
export const login = async (url, credentials) => {
  try {
    const response = await api.post(url, credentials);
    // console.info("Login successful");
    return response.data;
  } catch (error) {
    console.error("Login Error", error);
    throw error;
  }
};

export const logout = async () => {
  try {
    await api.post("/users/logout");
    // console.info("Logout successful");
  } catch (error) {
    console.error("Logout Error", error);
    throw error;
  }
};

export const deleteWatchList = async (url, params) => {
  try {
    const response = await api.delete(url, { params });
    // console.info("Deleted successfully");
    return response.data;
  } catch (error) {
    console.error("Delete Error", error);
    throw error;
  }
};

export default api;