// src/hooks/useOrders.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "../api/orders.api";
import toast from "react-hot-toast";

/** GET /orders */
export function useOrdersQuery(params = {}) {
  return useQuery({
    queryKey: ["orders", params],
    queryFn: () => api.fetchOrders(params),
    keepPreviousData: true,
    staleTime: 1000 * 60 * 1,
  });
}

/** GET /orders/:id */
export function useOrderQuery(id) {
  return useQuery({
    queryKey: ["order", id],
    queryFn: () => api.fetchOrder(id),
    enabled: !!id,
  });
}

/** POST /orders */
export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => api.createOrder(payload),
    onSuccess() {
      qc.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Order created");
    },
    onError(err) {
      toast.error(err?.response?.data?.message || "Create order failed");
    },
  });
}

/** PUT /orders/:id  (optional — depends on BE) */
export function useUpdateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => api.updateOrder(id, payload),
    onSuccess() {
      qc.invalidateQueries({ queryKey: ["orders"] });
      qc.invalidateQueries({ queryKey: ["order"] });
      toast.success("Order updated");
    },
    onError(err) {
      toast.error(err?.response?.data?.message || "Update failed (backend may not support update)");
    },
  });
}

/** DELETE /orders/:id (optional — depends on BE) */
export function useDeleteOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.deleteOrder(id),
    onSuccess() {
      qc.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Order deleted");
    },
    onError(err) {
      toast.error(err?.response?.data?.message || "Delete failed (backend may not support delete)");
    },
  });
}
