import React, { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Button from '../../components/common/Button'
import Loader from '../../components/common/Loader'
import Input from '../../components/common/Input'
import { useOrderQuery, useCreateOrder, useUpdateOrder } from '../../hooks/useOrders'
import { useItemsQuery } from '../../hooks/useProducts'
import { useCategoriesQuery } from '../../hooks/useCategories'
import { 
  PlusIcon, 
  TrashIcon, 
  ArrowLeftIcon, 
  BanknotesIcon,
  ExclamationCircleIcon 
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

export default function OrderForm() {
  const { id } = useParams()
  const isEditMode = Boolean(id)
  const navigate = useNavigate()

  const { data: order, isLoading: orderLoading } = useOrderQuery(id)
  const { data: products, isLoading: productsLoading } = useItemsQuery()
  const { data: categories, isLoading: categoriesLoading } = useCategoriesQuery()

  const createMutation = useCreateOrder()
  const updateMutation = useUpdateOrder()

  const [items, setItems] = useState([])
  const [paidAmount, setPaidAmount] = useState(0)
  const [lastSyncedId, setLastSyncedId] = useState(null)

  const allProducts = useMemo(() => products?.data || products || [], [products])
  const allCategories = useMemo(() => categories || [], [categories])

  // Get IDs of all currently selected items to exclude them from dropdowns
  const selectedItemIds = useMemo(() => {
    return items.map(it => Number(it.itemId)).filter(id => id > 0)
  }, [items])

  // DATA SYNCHRONIZATION
  if (isEditMode && order && allProducts.length > 0 && lastSyncedId !== id) {
    const backendItems = order.items ?? order.OrderItem ?? []
    const mappedItems = backendItems.map((it) => {
      const matchedProduct = allProducts.find((p) => p.id === it.itemId)
      return {
        itemId: it.itemId ?? '',
        categoryId: matchedProduct?.categoryId ?? it.item?.categoryId ?? '',
        name: (matchedProduct?.name || it.name || it.item?.name || '').toUpperCase(),
        price: it.price ?? 0,
        quantity: it.quantity ?? 1,
        stock: matchedProduct?.quantity ?? 0,
      }
    })
    setItems(mappedItems)
    setPaidAmount(order.paidAmount ?? 0)
    setLastSyncedId(id)
  }

  const addItemRow = () =>
    setItems((prev) => [...prev, { itemId: '', name: '', categoryId: '', price: 0, quantity: 1, stock: 0 }])

  const updateItem = (idx, field, value) => {
    setItems((prev) => {
      const copy = [...prev]
      let updatedRow = { ...copy[idx], [field]: value }

      if (field === 'categoryId') {
        updatedRow.itemId = ''; updatedRow.name = ''; updatedRow.price = 0; updatedRow.stock = 0;
      }

      if (field === 'name') {
        const selectedProd = allProducts.find((p) => p.name.toUpperCase() === value.toUpperCase())
        if (selectedProd) {
          updatedRow.itemId = selectedProd.id
          updatedRow.price = selectedProd.salePrice
          updatedRow.stock = selectedProd.quantity
          updatedRow.name = selectedProd.name.toUpperCase()
        }
      }
      copy[idx] = updatedRow
      return copy
    })
  }

  const total = useMemo(() => items.reduce((s, it) => s + (Number(it.price) || 0) * (Number(it.quantity) || 0), 0), [items])

  const isStockValid = useMemo(() => {
    return items.every(it => !it.itemId || Number(it.quantity) <= it.stock)
  }, [items])

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!isEditMode && !isStockValid) return toast.error('Insufficient stock. Please adjust quantities.')
    const validItems = items.filter((i) => i.itemId && Number(i.quantity) > 0)
    if (!validItems.length) return toast.error('Add at least one item')

    const payload = {
      items: validItems.map((i) => ({ itemId: Number(i.itemId), quantity: Number(i.quantity) })),
      paidAmount: parseFloat(paidAmount || 0)
    }

    try {
      if (isEditMode) await updateMutation.mutateAsync({ id, payload })
      else await createMutation.mutateAsync(payload)
      navigate('/orders')
      toast.success(isEditMode ? 'Order updated' : 'Order completed')
    } catch (err) { console.error(err) }
  }

  if ((isEditMode && orderLoading) || productsLoading || categoriesLoading) {
    return <DashboardLayout><div className="flex justify-center py-20"><Loader /></div></DashboardLayout>
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto mb-8 flex items-center justify-between">
        <div>
          <button onClick={() => navigate(-1)} className="flex items-center text-slate-500 hover:text-indigo-600 mb-2 font-medium transition-colors">
            <ArrowLeftIcon className="w-4 h-4 mr-1" /> Back to Orders
          </button>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            {isEditMode ? `Edit Order #${id}` : 'Create New Order'}
          </h2>
        </div>
      </div>

      <form onSubmit={onSubmit} className="max-w-7xl mx-auto space-y-6 pb-20">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Inventory Selection</span>
            {isEditMode && <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded font-black uppercase">Modifying Existing Record</span>}
          </div>
          
          <div className="p-6 space-y-4">
            {items.map((it, idx) => (
              <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:border-indigo-200 transition-all">
                <div className="md:col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Category</label>
                  <select value={it.categoryId} onChange={(e) => updateItem(idx, 'categoryId', e.target.value)} className="w-full p-2.5 bg-slate-50 border-none rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500 outline-none">
                    <option value="">Select</option>
                    {allCategories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                  </select>
                </div>

                <div className="md:col-span-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Item Name</label>
                  <select 
                    disabled={!it.categoryId} 
                    value={it.name} 
                    onChange={(e) => updateItem(idx, 'name', e.target.value)} 
                    className="w-full p-2.5 border-none rounded-xl text-sm font-semibold bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-50"
                  >
                    <option value="">{it.categoryId ? 'Choose Product' : 'Select Category First'}</option>
                    {allProducts
                      .filter(p => Number(p.categoryId) === Number(it.categoryId))
                      .filter(p => !selectedItemIds.includes(Number(p.id)) || Number(p.id) === Number(it.itemId))
                      .map((p) => (
                        <option key={p.id} value={p.name.toUpperCase()}>{p.name.toUpperCase()}</option>
                      ))
                    }
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Availability</label>
                  <div className={`p-2.5 rounded-xl text-sm font-bold text-center border ${it.stock < it.quantity && it.itemId ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-700 border-green-100'}`}>
                    {it.itemId ? `${it.stock} in stock` : '--'}
                  </div>
                </div>

                <div className="md:col-span-2"><Input label="Price" value={it.price} disabled className="bg-slate-100 font-bold" /></div>
                
                <div className="md:col-span-2">
                  <Input 
                    label="Quantity" 
                    type="number" 
                    min="1" 
                    value={it.quantity} 
                    onChange={(e) => updateItem(idx, 'quantity', e.target.value)} 
                    className={it.quantity > it.stock ? 'border-red-500 ring-red-500' : ''}
                  />
                </div>

                <div className="md:col-span-1 flex justify-end pb-2">
                  <button type="button" onClick={() => setItems(prev => prev.filter((_, i) => i !== idx))} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
            
            <button type="button" onClick={addItemRow} className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold hover:border-indigo-400 hover:text-indigo-600 transition-all flex items-center justify-center gap-2">
              <PlusIcon className="w-5 h-5" /> Add Item Row
            </button>
          </div>
        </div>

        <div className="bg-[#0F172A] rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Order Total</p>
              <p className="text-6xl font-black text-indigo-400 tracking-tighter">Rs. {total.toLocaleString()}</p>
              {!isStockValid && (
                <div className="mt-4 flex items-center gap-2 text-red-400 font-bold text-sm animate-pulse">
                  <ExclamationCircleIcon className="w-5 h-5" />
                  Stock limit exceeded
                </div>
              )}
            </div>

            <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700 backdrop-blur-sm">
              <label className="text-indigo-300 text-[10px] font-black uppercase block mb-3 flex items-center gap-2">
                <BanknotesIcon className="w-4 h-4" /> Received Amount (Cash/Bank)
              </label>
              <input 
                type="number"
                value={paidAmount}
                onChange={(e) => setPaidAmount(e.target.value)}
                className="w-full bg-slate-900/50 border-2 border-slate-700 rounded-xl px-4 py-4 text-3xl font-black text-green-400 focus:border-indigo-500 focus:ring-0 outline-none transition-all"
                placeholder="0.00"
              />
              <div className="mt-4 flex justify-between items-center bg-slate-900/30 p-3 rounded-lg">
                <span className="text-xs font-bold text-slate-500 uppercase">Remaining Balance:</span>
                <span className={`text-xl font-black ${total - paidAmount > 0 ? 'text-orange-400' : 'text-slate-400'}`}>
                  Rs. {(total - paidAmount).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-end gap-4 border-t border-slate-800 mt-8 pt-8 relative z-10">
            <Button type="button" className="bg-slate-800 px-10 hover:bg-slate-700" onClick={() => navigate('/orders')}>Discard</Button>
            <Button 
              type="submit" 
              disabled={createMutation.isPending || updateMutation.isPending || (!isEditMode && !isStockValid)} 
              className="px-14 bg-indigo-600 hover:bg-indigo-500 shadow-xl shadow-indigo-500/20 py-4 text-lg"
            >
              {isEditMode ? 'Update Transaction' : 'Confirm & Save'}
            </Button>
          </div>
        </div>
      </form>
    </DashboardLayout>
  )
}