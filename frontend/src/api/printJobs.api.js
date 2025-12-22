// src/api/printJobs.api.js
import api from "./axios";

export const createPrintJob = async (payload) => {
  const { data } = await api.post("/printJobs/", payload);
  return data;
};

export const fetchPrintJobs = async (params = {}) => {
  const { data } = await api.get("/printJobs/", { params });
  return data;
};

export const fetchPrintJob = async (id) => {
  const { data } = await api.get(`/printJobs/${id}`);
  return data;
};

export const updatePrintJob = async (id, payload) => {
  const { data } = await api.put(`/printJobs/${id}`, payload);
  return data;
};

export const deletePrintJob = async (id) => {
  const { data } = await api.delete(`/printJobs/${id}`);
  return data;
};
