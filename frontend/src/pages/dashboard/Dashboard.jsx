import DashboardLayout from '../../components/layout/DashboardLayout'

export default function Dashboard() {
  return (
    <DashboardLayout>
      <h1 className="text-2xl font-semibold mb-6">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow">Users</div>
        <div className="bg-white p-4 rounded shadow">Orders</div>
        <div className="bg-white p-4 rounded shadow">Revenue</div>
      </div>

      {/* Recent activity */}
      <div className="bg-white p-4 rounded shadow">
        Recent Activity
      </div>
    </DashboardLayout>
  )
}
