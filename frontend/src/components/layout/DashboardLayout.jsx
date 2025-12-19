import { Link } from 'react-router-dom'

export default function DashboardLayout({ children }) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-slate-900 text-white p-4">
        <nav className="space-y-2">
          <Link to="/" className="block">Dashboard</Link>
          <Link to="/products" className="block">Products</Link>
          <Link to="/orders" className="block">Orders</Link>
          <Link to="/settings/profile" className="block">Settings</Link>
        </nav>
      </aside>

      <main className="flex-1 p-6 bg-slate-50">
        {children}
      </main>
    </div>
  )
}
