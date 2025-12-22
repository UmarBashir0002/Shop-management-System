import { useMemo, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { useItemsQuery, useDeleteItem } from '../../hooks/useProducts'
import { useCategoriesQuery } from '../../hooks/useCategories'

import Table from '../../components/common/Table'
import Button from '../../components/common/Button'
import Loader from '../../components/common/Loader'
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  EyeIcon,
  ArchiveBoxIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline'

export default function ProductList() {
  const params = { limit: 50 }
  const [selectedCategory, setSelectedCategory] = useState('All')

  const { data, isLoading, refetch } = useItemsQuery(params)
  const deleteMutation = useDeleteItem()

  // Fetch categories from DB
  const { data: dbCategories } = useCategoriesQuery()

  useEffect(() => {
    refetch()
  }, [refetch])

  const filteredItems = useMemo(() => {
    let rawData = []
    if (Array.isArray(data)) rawData = data
    else if (data?.data) rawData = data.data

    if (selectedCategory === 'All') return rawData
    
    // UPDATED: Filter logic checks the new category relation name
    return rawData.filter((item) => {
      const catName = item.category?.name || item.type;
      return catName === selectedCategory;
    })
  }, [data, selectedCategory])

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <Loader />
          <p className="mt-4 text-slate-500 animate-pulse">Loading inventory...</p>
        </div>
      </DashboardLayout>
    )
  }

  const columns = [
    {
      title: 'Product',
      key: 'name',
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-800">{row.name}</span>
          <span className="text-xs text-slate-400 font-mono">#{row.id}</span>
        </div>
      ),
    },
    { title: 'Brand', key: 'brand' },
    {
      title: 'Category',
      key: 'category', 
      render: (row) => (
        <span className="px-2 py-1 rounded-md bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-wider border border-indigo-100">
          {/* UPDATED: Displays name from the related category table */}
          {row.category?.name || row.type || 'N/A'}
        </span>
      ),
    },
    {
      title: 'Pricing',
      key: 'salePrice',
      render: (row) => (
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-indigo-600">Rs. {row.salePrice}</span>
          <span className="text-[10px] text-slate-400">Cost: Rs. {row.costPrice}</span>
        </div>
      ),
    },
    {
      title: 'Stock',
      key: 'quantity',
      render: (row) => (
        <span
          className={`font-medium ${row.quantity < 5 ? 'text-red-600 font-bold' : 'text-slate-600'}`}
        >
          {row.quantity} in stock
        </span>
      ),
    },
    {
      title: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-3">
          <Link to={`/products/${row.id}`} title="View Details">
            <EyeIcon className="w-5 h-5 text-slate-400 hover:text-indigo-600 transition-colors" />
          </Link>
          <Link to={`/products/${row.id}/edit`} title="Edit">
            <PencilSquareIcon className="w-5 h-5 text-slate-400 hover:text-blue-600 transition-colors" />
          </Link>
          <button
            onClick={() => {
              if (confirm('Delete this item?')) deleteMutation.mutate(row.id)
            }}
            disabled={deleteMutation.isPending}
            className="disabled:opacity-30"
            title="Delete"
          >
            <TrashIcon className="w-5 h-5 text-slate-400 hover:text-red-600 transition-colors" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <DashboardLayout>
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Product Inventory</h1>
          <p className="text-slate-500 text-sm">
            Manage your stock, pricing, and product categories.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex items-center">
            <FunnelIcon className="w-4 h-4 absolute left-3 text-slate-400 pointer-events-none" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none appearance-none cursor-pointer shadow-sm hover:border-slate-300 transition-all"
            >
              <option value="All">All Categories</option>
              {Array.isArray(dbCategories) && dbCategories.length > 0 && 
                dbCategories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))
              }
            </select>
          </div>

          <Link to="/products/new">
            <Button className="flex items-center gap-2 px-5 shadow-lg shadow-indigo-200">
              <PlusIcon className="w-5 h-5" />
              Add New Item
            </Button>
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {filteredItems.length > 0 ? (
          <Table
            columns={columns}
            data={filteredItems}
            className="min-w-full divide-y divide-slate-200"
          />
        ) : (
          <div className="p-20 text-center">
            <ArchiveBoxIcon className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <h3 className="text-slate-900 font-semibold">No products found</h3>
            <p className="text-slate-500 text-sm">No items match the selected category.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}