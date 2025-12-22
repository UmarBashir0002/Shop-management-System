import React, { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Button from '../../components/common/Button'
import Loader from '../../components/common/Loader'
import Input from '../../components/common/Input'
import { useOrderQuery, useCreateOrder, useUpdateOrder } from '../../hooks/useOrders'
import { useItemsQuery } from '../../hooks/useProducts'
import { PlusIcon, TrashIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

const CATEGORIES = ['PRINTER', 'LAPTOP', 'ACCESSORY', 'SERVICE']

export default function OrderForm() {
  const { id } = useParams()
  const isEditMode = Boolean(id)
  const navigate = useNavigate()

  const { data: order, isLoading: orderLoading } = useOrderQuery(id)
  const { data: products, isLoading: productsLoading } = useItemsQuery()

  const createMutation = useCreateOrder()
  const updateMutation = useUpdateOrder()

  const [items, setItems] = useState([])
  const [lastId, setLastId] = useState(null)

  const allProducts = useMemo(() => products?.data || products || [], [products])

  // Sync state for Edit Mode
  if (isEditMode && order && allProducts.length > 0 && lastId !== id) {
    const backendItems = order.items ?? order.OrderItem ?? []

    const mappedItems = backendItems.map((it) => {
      // Find matching product in master list to get the correct Name and Category
      const matchedProduct = allProducts.find((p) => p.id === it.itemId)

      return {
        itemId: it.itemId ?? '',
        // Use master list values to ensure dropdown selection matches
        name: matchedProduct?.name ?? it.name ?? '',
        type: matchedProduct?.type ?? it.type ?? '',
        price: it.price ?? 0,
        quantity: it.quantity ?? 1,
      }
    })

    setItems(mappedItems)
    setLastId(id)
  }

  const addItemRow = () =>
    setItems((prev) => [...prev, { itemId: '', name: '', type: '', price: 0, quantity: 1 }])

  const removeItemRow = (idx) => setItems((prev) => prev.filter((_, i) => i !== idx))

  const updateItem = (idx, field, value) => {
    setItems((prev) => {
      const copy = [...prev]
      let updatedRow = { ...copy[idx], [field]: value }

      if (field === 'type') {
        updatedRow.itemId = ''
        updatedRow.name = ''
        updatedRow.price = 0
      }

      if (field === 'name') {
        const selectedProd = allProducts.find((p) => p.name === value)
        if (selectedProd) {
          updatedRow.itemId = selectedProd.id
          updatedRow.price = selectedProd.salePrice
        }
      }

      copy[idx] = updatedRow
      return copy
    })
  }

  const total = useMemo(
    () => items.reduce((s, it) => s + (Number(it.price) || 0) * (Number(it.quantity) || 0), 0),
    [items]
  )

  const onSubmit = async (e) => {
    e.preventDefault()
    const validItems = items.filter((i) => i.itemId && Number(i.quantity) > 0)
    if (!validItems.length) return toast.error('Add at least one valid item')

    const payload = {
      items: validItems.map((i) => ({ itemId: Number(i.itemId), quantity: Number(i.quantity) })),
    }

    try {
      if (isEditMode) await updateMutation.mutateAsync({ id, payload })
      else await createMutation.mutateAsync(payload)
      navigate('/orders')
      toast.success(isEditMode ? 'Order updated' : 'Order created')
    } catch (err) {
      return err
    }
  }

  if ((isEditMode && orderLoading) || productsLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center py-20">
          <Loader />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto mb-8 flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-slate-500 hover:text-indigo-600 mb-2 transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-1" /> Back
          </button>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            {isEditMode ? `Edit Order #${id}` : 'Create New Order'}
          </h2>
        </div>
      </div>

      <form onSubmit={onSubmit} className="max-w-6xl mx-auto space-y-6 pb-20">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 bg-slate-50 border-b border-slate-200">
            <span className="text-sm font-bold text-slate-600 uppercase tracking-widest">
              Billing Items
            </span>
          </div>

          <div className="p-6 space-y-4">
            {items.map((it, idx) => {
              const filteredProducts = allProducts.filter((p) => p.type === it.type)

              return (
                <div
                  key={idx}
                  className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end bg-white p-5 rounded-2xl border border-slate-100 hover:border-indigo-100 transition-all shadow-sm"
                >
                  {/* 1. Category Dropdown */}
                  <div className="md:col-span-3">
                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">
                      Category
                    </label>
                    <select
                      value={it.type}
                      onChange={(e) => updateItem(idx, 'type', e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    >
                      <option value="">Select Category</option>
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 2. Item Name Dropdown */}
                  <div className="md:col-span-4">
                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">
                      Item Name
                    </label>
                    <select
                      disabled={!it.type}
                      value={it.name}
                      onChange={(e) => updateItem(idx, 'name', e.target.value)}
                      className={`w-full p-2.5 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${!it.type ? 'bg-slate-100 cursor-not-allowed' : 'bg-slate-50'}`}
                    >
                      <option value="">
                        {it.type ? `Select ${it.type}` : 'Select category first'}
                      </option>
                      {filteredProducts.map((p) => (
                        <option key={p.id} value={p.name}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 3. Price (Auto-filled but editable) */}
                  {/* 3. Price (Disabled/Auto-filled) */}
                  <div className="md:col-span-2">
                    <Input
                      label="Unit Price"
                      type="number"
                      value={it.price}
                      // Remove onChange if you want it strictly auto-filled
                      disabled={true}
                      className="bg-slate-100 border-none font-bold text-slate-500 cursor-not-allowed"
                      placeholder="0.00"
                    />
                  </div>

                  {/* 4. Quantity */}
                  <div className="md:col-span-2">
                    <Input
                      label="Qty"
                      type="number"
                      min="1"
                      value={it.quantity}
                      onChange={(e) => updateItem(idx, 'quantity', e.target.value)}
                      className="bg-slate-50 border-none"
                    />
                  </div>

                  <div className="md:col-span-1 flex justify-end pb-2">
                    <button
                      type="button"
                      onClick={() => removeItemRow(idx)}
                      className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )
            })}

            <button
              type="button"
              onClick={addItemRow}
              className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-medium hover:border-indigo-400 hover:text-indigo-500 transition-all flex items-center justify-center gap-2"
            >
              <PlusIcon className="w-5 h-5" /> Add New Row
            </button>
          </div>
        </div>

        {/* Summary Bar */}
        <div className="bg-[#0F172A] rounded-3xl p-6 text-white flex flex-col md:flex-row justify-between items-center shadow-2xl">
          <div>
            <p className="text-slate-400 text-sm font-medium uppercase tracking-widest">
              Total Payable
            </p>
            <p className="text-4xl font-black text-indigo-400">Rs. {total.toLocaleString()}</p>
          </div>

          <div className="flex gap-4 mt-4 md:mt-0 w-full md:w-auto">
            <Button
              type="button"
              className="bg-slate-800 text-white flex-1 md:flex-none"
              onClick={() => navigate('/orders')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="bg-indigo-600 hover:bg-indigo-500 flex-1 md:flex-none px-10 shadow-lg shadow-indigo-500/30"
            >
              {isEditMode ? 'Update Order' : 'Complete Order'}
            </Button>
          </div>
        </div>
      </form>
    </DashboardLayout>
  )
}
