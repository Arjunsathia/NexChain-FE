// src/api/axiosConfig.js
import axios from "axios";

const COINGECKO_BASE_URL = "https://api.coingecko.com/api/v3";
const API_BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:5050/api";

export const coinGecko = axios.create({
  baseURL: COINGECKO_BASE_URL,
});

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor - FIXED TOKEN HANDLING
api.interceptors.request.use(
  (config) => {
    // Get token from NEXCHAIN_USER_TOKEN directly
    try {
      const token = localStorage.getItem("NEXCHAIN_USER_TOKEN");
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

// Response Interceptor
api.interceptors.response.use(
  (response) => {
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
    return response.data;
  } catch (error) {
    console.error("GET Error for", url, error);
    throw error;
  }
};

// GET by ID
export const getById = async (url, id) => {
  try {
    const response = await api.get(`${url}/${id}`);
    return response.data;
  } catch (error) {
    console.error("GET by ID Error for", `${url}/${id}`, error);
    throw error;
  }
};

// POST form data
export const postForm = async (url, formData) => {
  try {
    const response = await api.post(url, formData);
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
    return response.data;
  } catch (error) {
    console.error("Login Error", error);
    throw error;
  }
};

export const logout = async () => {
  try {
    await api.post("/users/logout");
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