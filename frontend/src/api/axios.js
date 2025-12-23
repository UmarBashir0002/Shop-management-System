// src/api/axios.js
import axios from "axios";
import store from "../store";
import { logout } from "../store/authSlice";
import toast from "react-hot-toast";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

const api = axios.create({
  baseURL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
  withCredentials: false,
});

api.interceptors.request.use((config) => {
  try {
    const token = store.getState().auth.token;
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch (e) {
    console.error("Auth header injection failed", e);
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    // 1. Handle Network/Connection Errors
    if (!error.response) {
      toast.error("Network error — please check your connection.");
      return Promise.reject(error);
    }

    const status = error.response.status;
    
    // 2. Flexible Message Extraction
    // Checks: 1. data.message (Object) OR 2. data[0].message (Array) OR 3. General error message
    const message = 
      error.response?.data?.errors?.[0]|| 
      error.message || 
      "An unexpected error occurred";

    // 3. Handle 401 Unauthorized (Session Expired)
    if (status === 401) {
      toast.dismiss(); // Clear pending toasts
      
      store.dispatch(logout());
      
      toast.error("Session expired. Please re-login.");

      // Delay redirect slightly so user can see the toast message
      setTimeout(() => {
        window.location.href = "/auth/login";
      }, 1000);
      
      return Promise.reject(error);
    }

    // 4. Handle other 4xx errors (Validation, Not Found, etc.)
    if (status >= 400 && status < 500) {
      toast.error(message);
    } 
    // 5. Handle 5xx errors (Server Crash)
    else if (status >= 500) {
      toast.error("Server error. Try again later.");
    }

    return Promise.reject(error);
  }
);

export default api;