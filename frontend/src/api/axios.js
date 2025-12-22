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
    console.log(e)
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (!error.response) {
      toast.error("Network error — please check your connection.");
      return Promise.reject(error);
    }
    const status = error.response.status;
    const message = error.response?.data?.message || error.message;

    if (status === 401) {
      // logout on 401
      store.dispatch(logout());
      toast.error("Invalid Credentials Or Session Expired");
      return Promise.reject(error);
    }

    if (status >= 400 && status < 500) {
      toast.error(message);
    } else if (status >= 500) {
      toast.error("Server error. Try again later.");
    }

    return Promise.reject(error);
  }
);

export default api;
