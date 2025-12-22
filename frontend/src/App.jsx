// src/App.jsx
import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import queryClient from "./queryClient";
import AppRoutes from "./routes";
import { Toaster } from "react-hot-toast";

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppRoutes />
      <Toaster position="top-right" />
    </QueryClientProvider>
  );
}
