// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function ProtectedRoute({ children }) {
  const auth = useSelector((s) => s.auth);
  if (!auth?.isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }
  return children;
}
