import { Routes, Route } from 'react-router-dom'
import Login from '../pages/auth/Login'
import Register from '../pages/auth/Register'
import ForgotPassword from '../pages/auth/ForgotPassword'
import Dashboard from '../pages/dashboard/Dashboard'
import ProductList from '../pages/products/ProductList'
import Orders from '../pages/orders/Orders'
import Profile from '../pages/settings/Profile'
import ProtectedRoute from '../components/ProtectedRoute'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

<Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/products" element={<ProductList />} />
      <Route path="/orders" element={<Orders />} />
      <Route path="/settings/profile" element={<Profile />} />
    </Routes>
  )
}
