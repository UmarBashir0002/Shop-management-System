// src/api/orders.api.js
import api from "./axios";

/**
 * GET /orders
 */
export const fetchOrders = async (params = {}) => {
  const res = await api.get("/orders", { params });
  return res.data;
};

/**
 * GET /orders/:id
 */
export const fetchOrder = async (id) => {
  const res = await api.get(`/orders/${id}`);
  return res.data;
};

/**
 * POST /orders
 * body: { items: [{ itemId, quantity }] }
 */
export const createOrder = async (payload) => {
  const res = await api.post("/orders", payload);
  return res.data;
};

/**
 * Optional: PUT /orders/:id  <-- only if backend supports it
 * If your backend doesn't support update, this will return 404/405 -> handled by UI
 */
export const updateOrder = async (id, payload) => {
      console.log('payload',payload);
  const res = await api.put(`/orders/${id}`, payload);
  return res.data;
};

/**
 * Optional: DELETE /orders/:id  <-- only if backend supports it
 */
export const deleteOrder = async (id) => {
  const res = await api.delete(`/orders/${id}`);
  return res.data;
};
