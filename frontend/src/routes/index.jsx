// src/routes/index.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ForgotPassword from "../pages/auth/ForgotPassword";
import Dashboard from "../pages/dashboard/Dashboard";
import ProductList from "../pages/products/ProductList";
import ProductDetail from "../pages/products/ProductDetail";
import ProductForm from "../pages/products/ProductForm";
import Orders from "../pages/orders/Orders";
import OrderForm from "../pages/orders/OrderForm";
import OrderDetail from "../pages/orders/OrderDetail";
import Profile from "../pages/settings/Profile";
import Password from "../pages/settings/Password";
import Preferences from "../pages/settings/Preferences";
import ProtectedRoute from "../components/ProtectedRoute";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/auth/login" element={<Login />} />
      <Route path="/auth/register" element={<Register />} />
      <Route path="/auth/forgot" element={<ForgotPassword />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/products" element={<ProtectedRoute><ProductList /></ProtectedRoute>} />
      <Route path="/products/new" element={<ProtectedRoute><ProductForm /></ProtectedRoute>} />
      <Route path="/products/:id" element={<ProtectedRoute><ProductDetail /></ProtectedRoute>} />
      <Route path="/products/:id/edit" element={<ProtectedRoute><ProductForm /></ProtectedRoute>} />
      <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />

      // src/routes/index.jsx (add)
      {/* <Route path="/orders" element= {<ProtectedRoute><Order /></ProtectedRoute>}  /> */}
      <Route path="/orders/:id" element= {<ProtectedRoute><OrderDetail /></ProtectedRoute>}  />
      <Route path="/orders/:id/edit" element= {<ProtectedRoute><OrderForm /></ProtectedRoute>} />
      <Route path="/orders/new" element={<ProtectedRoute><OrderForm /></ProtectedRoute>} />
      <Route path="/settings/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/settings/password" element={<ProtectedRoute><Password /></ProtectedRoute>} />
      <Route path="/settings/preferences" element={<ProtectedRoute><Preferences /></ProtectedRoute>} />

      <Route path="*" element={<div className="p-6">Page not found</div>} />
    </Routes>
  );
}
