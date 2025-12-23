// src/api/auth.api.js
import api from "./axios";

/**
 * POST /auth/login
 * body: { username, password }
 * expected: { user, token }
 */
export const login = async ({ username, password }) => {
  const { data } = await api.post("/auth/login", { username, password });
  return data;
};

export const fetchProfile = async () => {
  const { data } = await api.get("/user");
  return data;
};
