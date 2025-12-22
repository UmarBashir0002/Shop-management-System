// src/hooks/useCategories.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "../api/categories.api";
import toast from "react-hot-toast";

/** GET /category */
export function useCategoriesQuery() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => api.fetchCategories(),
    staleTime: 1000 * 60 * 5, // Categories change less often, cache for 5 mins
  });
}

/** POST /category */
export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => api.createCategory(payload),
    onSuccess() {
      qc.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category created successfully");
    },
    onError(err) {
      toast.error(err?.response?.data?.message || "Failed to create category");
    },
  });
}

/** DELETE /category/:id */
export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.deleteCategory(id),
    onSuccess() {
      qc.invalidateQueries({ queryKey: ["categories"] });
      qc.invalidateQueries({ queryKey: ["items"] }); // Refresh items if names changed
      toast.success("Category deleted");
    },
    onError(err) {
      toast.error(err?.response?.data?.message || "Failed to delete category");
    },
  });
}