import React, { useState, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
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
  PencilSquareIcon 
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
  const [lastSyncedId, setLastSyncedId] = useState(null)

  const allProducts = useMemo(() => products?.data || products || [], [products])
  const allCategories = useMemo(() => categories || [], [categories])

  /**
   * DATA SYNCHRONIZATION
   * Ensures 'name' is Uppercase to match dropdown values and selects the correct category
   */
  if (isEditMode && order && allProducts.length > 0 && lastSyncedId !== id) {
    const backendItems = order.items ?? order.OrderItem ?? []
    const mappedItems = backendItems.map((it) => {
      const matchedProduct = allProducts.find((p) => p.id === it.itemId)
      
      return {
        itemId: it.itemId ?? '',
        // Use the categoryId from the product master list to ensure filtering works
        categoryId: matchedProduct?.categoryId ?? it.item?.categoryId ?? '',
        // Force Uppercase to ensure the <select> matches the <option value="...">
        name: (matchedProduct?.name || it.name || '').toUpperCase(),
        price: it.price ?? 0,
        quantity: it.quantity ?? 1,
        stock: matchedProduct?.quantity ?? 0,
      }
    })
    
    setItems(mappedItems)
    setLastSyncedId(id)
  }

  const addItemRow = () =>
    setItems((prev) => [...prev, { itemId: '', name: '', categoryId: '', price: 0, quantity: 1, stock: 0 }])

  const removeItemRow = (idx) => setItems((prev) => prev.filter((_, i) => i !== idx))

  const updateItem = (idx, field, value) => {
    setItems((prev) => {
      const copy = [...prev]
      let updatedRow = { ...copy[idx], [field]: value }

      if (field === 'categoryId') {
        updatedRow.itemId = ''; updatedRow.name = ''; updatedRow.price = 0; updatedRow.stock = 0;
      }

      if (field === 'name') {
        // Find product by comparing Uppercase names
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

  const total = useMemo(
    () => items.reduce((s, it) => s + (Number(it.price) || 0) * (Number(it.quantity) || 0), 0),
    [items]
  )

  const isStockAvailable = useMemo(() => {
    if (items.length === 0) return true
    return items.every(it => {
      if (!it.itemId) return true 
      return it.stock > 0 && Number(it.quantity) <= it.stock
    })
  }, [items])

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!isStockAvailable) return toast.error('Check item availability')
    
    const validItems = items.filter((i) => i.itemId && Number(i.quantity) > 0)
    if (!validItems.length) return toast.error('Add at least one item')

    const payload = {
      items: validItems.map((i) => ({ itemId: Number(i.itemId), quantity: Number(i.quantity) })),
    }

    try {
      if (isEditMode) await updateMutation.mutateAsync({ id, payload })
      else await createMutation.mutateAsync(payload)
      navigate('/orders')
      toast.success(isEditMode ? 'Order updated' : 'Order completed')
    } catch (err) {
      return err
    }
  }

  if ((isEditMode && orderLoading) || productsLoading || categoriesLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center py-20"><Loader /></div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto mb-8 flex items-center justify-between">
        <div>
          <button onClick={() => navigate(-1)} className="flex items-center text-slate-500 hover:text-indigo-600 mb-2 transition-colors font-medium">
            <ArrowLeftIcon className="w-4 h-4 mr-1" /> Back
          </button>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            {isEditMode ? `Edit Order #${id}` : 'Create New Order'}
          </h2>
        </div>
      </div>

      <form onSubmit={onSubmit} className="max-w-7xl mx-auto space-y-6 pb-20">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 bg-slate-50 border-b border-slate-200">
            <span className="text-sm font-bold text-slate-600 uppercase tracking-widest">Billing Items</span>
          </div>
          
          <div className="p-6 space-y-4">
            {items.map((it, idx) => {
              const filteredProducts = allProducts.filter((p) => Number(p.categoryId) === Number(it.categoryId))

              return (
                <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end bg-white p-5 rounded-2xl border border-slate-100 shadow-sm transition-all hover:border-indigo-100">
                  {/* Category Selection */}
                  <div className="md:col-span-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block tracking-wider">Category</label>
                    <select value={it.categoryId} onChange={(e) => updateItem(idx, 'categoryId', e.target.value)} className="w-full p-2.5 bg-slate-50 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500">
                      <option value="">Select</option>
                      {allCategories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                    </select>
                  </div>

                  {/* Item Selection (FIXED: Value matches UpperCase state) */}
                  <div className="md:col-span-3">
                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block tracking-wider">Item Name</label>
                    <select 
                      disabled={!it.categoryId} 
                      value={it.name} 
                      onChange={(e) => updateItem(idx, 'name', e.target.value)} 
                      className={`w-full p-2.5 border-none rounded-xl text-sm outline-none transition-all ${!it.categoryId ? 'bg-slate-100 cursor-not-allowed' : 'bg-slate-50 focus:ring-2 focus:ring-indigo-500'}`}
                    >
                      <option value="">{it.categoryId ? `Select Item` : 'Pick Category'}</option>
                      {filteredProducts.map((p) => (
                        <option key={p.id} value={p.name.toUpperCase()}>
                          {p.name.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Stock Display */}
                  <div className="md:col-span-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block tracking-wider">Available Stock</label>
                    <div className="space-y-2">
                      <div className={`p-2.5 rounded-xl text-sm font-bold text-center border ${it.stock <= 0 && it.itemId ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-700 border-green-100'}`}>
                        {it.itemId ? `${it.stock} Units` : '--'}
                      </div>
                      
                      {it.stock <= 0 && it.itemId && (
                        <Link 
                          target="_blank"
                          rel="noopener noreferrer"
                          to={`/products/${it.itemId}/edit`}
                          className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors uppercase bg-indigo-50 py-1 rounded-lg border border-indigo-100"
                        >
                          <PencilSquareIcon className="w-3 h-3" />
                          Update Stock
                        </Link>
                      )}
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <Input label="Price" type="number" value={it.price} disabled={true} className="bg-slate-100 border-none font-bold text-slate-500 cursor-not-allowed" />
                  </div>

                  <div className="md:col-span-2">
                    <Input label="Qty" type="number" min="1" value={it.quantity} onChange={(e) => updateItem(idx, 'quantity', e.target.value)} className="bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500" />
                  </div>

                  <div className="md:col-span-1 flex justify-end pb-2">
                    <button type="button" onClick={() => removeItemRow(idx)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"><TrashIcon className="w-5 h-5" /></button>
                  </div>
                </div>
              )
            })}
            <button type="button" onClick={addItemRow} className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-medium hover:border-indigo-400 hover:text-indigo-500 transition-all flex items-center justify-center gap-2">
              <PlusIcon className="w-5 h-5" /> Add New Billing Row
            </button>
          </div>
        </div>

        {/* Total & Submit */}
        <div className="bg-[#0F172A] rounded-3xl p-6 text-white flex flex-col md:flex-row justify-between items-center shadow-2xl">
          <div>
            <p className="text-slate-400 text-sm font-medium uppercase tracking-widest">Total Amount</p>
            <p className="text-4xl font-black text-indigo-400">Rs. {total.toLocaleString()}</p>
          </div>

          <div className="flex gap-4 mt-4 md:mt-0">
            {!isStockAvailable && (
              <p className="text-red-400 text-xs font-bold self-center mr-4 animate-pulse uppercase">Out of Stock</p>
            )}
            <Button type="button" className="bg-slate-800 text-white" onClick={() => navigate('/orders')}>Cancel</Button>
            <Button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending || !isStockAvailable}
              className={`px-10 shadow-lg ${!isStockAvailable ? 'bg-slate-600 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/30'}`}
            >
              {isEditMode ? 'Update Order' : 'Complete Order'}
            </Button>
          </div>
        </div>
      </form>
    </DashboardLayout>
  )
}