// src/hooks/useProducts.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "../api/products.api";
import toast from "react-hot-toast";
import {getErrorMessage}  from "../utils/utils"

/**
 * ============================
 * ITEMS LIST
 * ============================
 */
export function useItemsQuery(params = {}) {
  return useQuery({
    // 🔁 CHANGED: object syntax (v5 required)
    queryKey: ["items", params],
    queryFn: () => api.fetchItems(params),

    // 🔁 CHANGED: moved into object
    keepPreviousData: true,
  });
}

/**
 * ============================
 * SINGLE ITEM
 * ============================
 */
export function useItemQuery(id) {
  return useQuery({
    // 🔁 CHANGED: object syntax
    queryKey: ["item", id],
    queryFn: () => api.fetchItem(id),

    // 🔁 SAME behavior
    enabled: !!id,
  });
}

/**
 * ============================
 * CREATE ITEM
 * ============================
 */
export function useCreateItem() {
  const qc = useQueryClient();

  return useMutation({
    // 🔁 CHANGED: mutationFn instead of inline fn
    mutationFn: (payload) => api.createItem(payload),

    onSuccess() {
      // 🔁 CHANGED: v5 invalidate syntax
      qc.invalidateQueries({ queryKey: ["items"] });
      toast.success("Item created");
    },

    onError(error) {
      const message = getErrorMessage(error);
      toast.error(message);
    },
  });
}

/**
 * ============================
 * UPDATE ITEM
 * ============================
 */
export function useUpdateItem() {
  const qc = useQueryClient();
  return useMutation({
    // 🔁 CHANGED: mutationFn object syntax
    mutationFn: ({ id, payload }) => api.updateItem(id, payload),

    onSuccess() {
      qc.invalidateQueries({ queryKey: ["items"] });
      toast.success("Item updated");
    },

    onError() {
      toast.error("Update failed");
    },
  });
}

/**
 * ============================
 * DELETE ITEM
 * ============================
 */
export function useDeleteItem() {
  const qc = useQueryClient();

  return useMutation({
    // 🔁 CHANGED: mutationFn object syntax
    mutationFn: (id) => api.deleteItem(id),

    onSuccess() {
      qc.invalidateQueries({ queryKey: ["items"] });
      toast.success("Item deleted");
    },

    onError() {
      // toast.error("Delete failed");
    },
  });
}
