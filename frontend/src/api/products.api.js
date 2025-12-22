// src/api/products.api.js
import api from "./axios";

/**
 * Items endpoints (items = product)
 */

export const fetchItems = async (params = {}) => {
  const { data } = await api.get("/items/", { params });
  return data;
};

export const fetchItem = async (id) => {
  const { data } = await api.get(`/items/${id}`);
  return data;
};

export const createItem = async (payload) => {
  const { data } = await api.post("/items/", payload);
  return data;
};

export const updateItem = async (id, payload) => {
  const { data } = await api.patch(`/items/${id}`, payload);
  return data;
};

export const deleteItem = async (id) => {
  const { data } = await api.delete(`/items/${id}`);
  return data;
};

/**
 * Stock endpoints
 */
export const fetchStock = async (params = {}) => {
  const { data } = await api.get("/stock/", { params });
  return data;
};

export const restockItem = async (id, { quantity }) => {
  const { data } = await api.post(`/stock/${id}/restock`, { quantity });
  return data;
};

export const decrementStock = async (id, { quantity }) => {
  const { data } = await api.post(`/stock/${id}/decrement`, { quantity });
  return data;
};

export const fetchLowStock = async (params = {}) => {
  const { data } = await api.get("/stock/low-stock", { params });
  return data;
};
