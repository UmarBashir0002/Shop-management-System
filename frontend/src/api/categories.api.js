// src/api/categories.api.js
import api from "./axios";

/** GET /category */
export const fetchCategories = async () => {
  const res = await api.get("/category");
  return res.data;
};

/** POST /category */
export const createCategory = async (payload) => {
  const res = await api.post("/category", payload);
  return res.data;
};

/** DELETE /category/:id */
export const deleteCategory = async (id) => {
  const res = await api.delete(`/category/${id}`);
  return res.data;
};