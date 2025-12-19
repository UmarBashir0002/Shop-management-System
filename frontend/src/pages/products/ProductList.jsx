import DashboardLayout from '../../components/layout/DashboardLayout'

export default function ProductList() {
  return (
    <DashboardLayout>
      <h1 className="text-xl font-semibold mb-4">Products</h1>

      <table className="w-full bg-white rounded shadow">
        <thead>
          <tr className="text-left border-b">
            <th className="p-3">Name</th>
            <th className="p-3">Price</th>
            <th className="p-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="p-3">Sample Product</td>
            <td className="p-3">$100</td>
            <td className="p-3">Edit</td>
          </tr>
        </tbody>
      </table>
    </DashboardLayout>
  )
}
