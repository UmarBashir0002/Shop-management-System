// src/pages/products/ProductTable.jsx
import { useQuery } from '@tanstack/react-query'
import { fetchProducts } from '../../api/products.api'
import Table from '../../components/common/Table'
import Button from '../../components/common/Button'
import EmptyState from '../../components/common/EmptyState'
import { Link } from 'react-router-dom'

export default function ProductTable() {
  const { data: products = [], isLoading, isError } = useQuery(['products'], fetchProducts)

  if (isLoading) return <div>Loading products...</div>
  if (isError) return <div>Error loading products</div>

  if (!products.length) return <EmptyState title="No products yet" subtitle={<Link to="/products/new" className="text-blue-600">Create your first product</Link>} />

  return (
    <Table>
      <thead>
        <tr className="bg-gray-50">
          <th className="p-3 text-left">Name</th>
          <th className="p-3 text-left">Price</th>
          <th className="p-3 text-left">Actions</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-100">
        {products.map(p => (
          <tr key={p.id}>
            <td className="p-3">{p.name}</td>
            <td className="p-3">{p.price}</td>
            <td className="p-3">
              <div className="flex gap-2">
                <Link to={`/products/${p.id}`}><Button className="border">View</Button></Link>
                <Link to={`/products/${p.id}/edit`}><Button className="border">Edit</Button></Link>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  )
}
