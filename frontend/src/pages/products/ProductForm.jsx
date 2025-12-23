import React, { useEffect, useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useNavigate, useParams } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import Loader from '../../components/common/Loader'
import { useCreateItem, useUpdateItem, useItemQuery } from '../../hooks/useProducts'
import { useCategoriesQuery } from '../../hooks/useCategories'
import { 
  PlusIcon, 
  CheckCircleIcon, 
  XMarkIcon, 
  ArrowLeftIcon,
  InformationCircleIcon 
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

// Validation Schema
const productSchema = z.object({
  name: z.string().min(4, 'Name must be at least 4 characters'),
  brand: z.string().min(1, 'Brand required'),
  categoryId: z.preprocess((val) => Number(val), z.number().min(1, 'Please select a category')),
  costPrice: z.number().min(0, 'Required'),
  salePrice: z.number().min(0, 'Required'),
  quantity: z.number().min(0, 'Required'),
  isActive: z.boolean().default(true),
}).refine((data) => data.salePrice > data.costPrice, {
  message: 'Average Sale price must be higher than average cost',
  path: ['salePrice'],
})

export default function ProductForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [showRestock, setShowRestock] = useState(false)
  const [restockInputs, setRestockInputs] = useState({ 
    count: '', 
    buyPrice: '', 
    newBatchSalePrice: '' 
  })

  const { data: categories, isLoading: catsLoading } = useCategoriesQuery()
  const { data: itemData, isLoading: itemLoading } = useItemQuery(id)
  
  const createMutation = useCreateItem()
  const updateMutation = useUpdateItem()

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: { isActive: true },
  })

  // Watch values for real-time calculations
  const watchedQty = watch('quantity')
  const watchedCost = watch('costPrice')
  const watchedSale = watch('salePrice')

  useEffect(() => {
    if (itemData) {
      reset({
        ...itemData,
        categoryId: itemData.categoryId ? itemData.categoryId.toString() : ""
      })
    }
  }, [itemData, reset])

  // --- UPDATED CALCULATION LOGIC ---
  const handleApplyRestock = () => {
    const addedQty = Number(restockInputs.count)
    const incomingPurchaseCost = Number(restockInputs.buyPrice)
    const incomingBatchSalePrice = Number(restockInputs.newBatchSalePrice)

    if (addedQty <= 0 || incomingPurchaseCost <= 0 || incomingBatchSalePrice <= 0) {
      return toast.error("Please enter valid quantity, purchase price, and selling price.")
    }

    const currentQty = Number(watchedQty) || 0
    const currentAvgCost = Number(watchedCost) || 0
    const currentAvgSale = Number(watchedSale) || 0
    
    const newTotalQty = currentQty + addedQty

    // 1. Calculate Weighted Average COST
    const totalCostInvestment = (currentQty * currentAvgCost) + (addedQty * incomingPurchaseCost)
    const finalAvgCost = totalCostInvestment / newTotalQty

    // 2. Calculate Weighted Average SALE PRICE (As requested)
    const totalSaleValue = (currentQty * currentAvgSale) + (addedQty * incomingBatchSalePrice)
    const finalAvgSale = totalSaleValue / newTotalQty

    // 3. Update Main Form State
    setValue('quantity', newTotalQty)
    setValue('costPrice', Number(finalAvgCost.toFixed(2)))
    setValue('salePrice', Number(finalAvgSale.toFixed(2)))

    // 4. Reset & Close
    setShowRestock(false)
    setRestockInputs({ count: '', buyPrice: '', newBatchSalePrice: '' })
    toast.success("Both Cost and Sale prices have been averaged.")
  }

  // Margin Preview for the Restock Overlay based on current inputs
  const liveBatchMargin = useMemo(() => {
    const sale = Number(restockInputs.newBatchSalePrice)
    const purchase = Number(restockInputs.buyPrice)
    if (!sale || !purchase) return 0
    return (((sale - purchase) / sale) * 100).toFixed(1)
  }, [restockInputs])

  const onSubmit = async (values) => {
    if (id) await updateMutation.mutateAsync({ id, payload: values })
    else await createMutation.mutateAsync(values)
    navigate('/products')
  }

  if (catsLoading || (id && itemLoading)) {
    return <DashboardLayout><div className="flex justify-center py-20"><Loader /></div></DashboardLayout>
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto pb-20">
        
        {/* Header Section */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate('/products')} className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-indigo-600 transition-all shadow-sm">
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              {id ? 'Inventory Intelligence' : 'New Product Entry'}
            </h2>
            <p className="text-slate-500 text-sm font-medium italic">Averaging enabled for both Cost and Sale prices.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-6">
            {/* General Info */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200/60">
              <h3 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-6">Product Identity</h3>
              <div className="space-y-5">
                <Input label="Product Name" {...register('name')} error={errors.name?.message} />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Brand" {...register('brand')} error={errors.brand?.message} />
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Category</label>
                    <select {...register('categoryId')} className="w-full p-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700">
                      <option value="">Select...</option>
                      {Array.isArray(categories) && categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Financials */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200/60 relative">
              <h3 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-6">Valuation & Stock</h3>
              
              <div className="grid grid-cols-2 gap-6 items-end">
                {/* Cost Price */}
                <div className="relative">
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Avg Cost</label>
                    {isEdit && (
                      <button 
                        type="button" 
                        onClick={() => setShowRestock(!showRestock)}
                        className="flex items-center gap-1.5 px-2 py-1 bg-indigo-600 text-[10px] font-black text-white rounded-lg hover:bg-indigo-700 shadow-md active:scale-95 transition-all"
                      >
                        <PlusIcon className="w-3 h-3 stroke-[3]" /> RESTOCK
                      </button>
                    )}
                  </div>
                  <Input 
                    type="number" 
                    {...register('costPrice', { valueAsNumber: true })} 
                    disabled={isEdit} 
                    className={isEdit ? "bg-slate-100/50 font-black text-slate-500 border-none" : ""}
                    error={errors.costPrice?.message} 
                  />

                  {/* RESTOCK OVERLAY */}
                  {showRestock && (
                    <div className="absolute bottom-full left-0 mb-4 w-[320px] bg-white border border-slate-200 shadow-2xl rounded-3xl z-50 p-6 animate-in fade-in zoom-in-95 slide-in-from-bottom-4">
                      <div className="flex justify-between items-center mb-4 border-b border-slate-50 pb-2">
                        <span className="text-xs font-black text-slate-800 uppercase tracking-tighter">New Batch Entry</span>
                        <button type="button" onClick={() => setShowRestock(false)}><XMarkIcon className="w-5 h-5 text-slate-300" /></button>
                      </div>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Qty Added</label>
                            <input type="number" value={restockInputs.count} onChange={(e) => setRestockInputs({...restockInputs, count: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Unit Cost</label>
                            <input type="number" value={restockInputs.buyPrice} onChange={(e) => setRestockInputs({...restockInputs, buyPrice: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between items-center">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Unit Sale Price</label>
                            <span className={`text-[10px] font-black ${liveBatchMargin > 0 ? 'text-green-500' : 'text-red-500'}`}>{liveBatchMargin}% Batch Margin</span>
                          </div>
                          <input type="number" value={restockInputs.newBatchSalePrice} onChange={(e) => setRestockInputs({...restockInputs, newBatchSalePrice: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 font-bold" />
                        </div>
                        <button type="button" onClick={handleApplyRestock} className="w-full py-3 bg-[#0F172A] text-white rounded-xl text-xs font-bold hover:bg-black transition-all">Apply Weighted Averages</button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Avg Sale Price */}
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 block mb-1">Avg Sale Price</label>
                  <Input 
                    type="number" 
                    {...register('salePrice', { valueAsNumber: true })} 
                    disabled={isEdit}
                    className={isEdit ? "bg-slate-100/50 font-black text-indigo-600 border-none" : ""}
                    error={errors.salePrice?.message} 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 mt-6 items-center">
                <Input label="Total Units" type="number" disabled={isEdit} {...register('quantity', { valueAsNumber: true })} className={isEdit ? "bg-slate-100/50 font-black text-slate-500 border-none" : ""} />
                <label className="flex items-center gap-3 cursor-pointer mt-5 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                  <input type="checkbox" {...register('isActive')} className="w-5 h-5 rounded-lg text-indigo-600 focus:ring-indigo-500 border-slate-300" />
                  <span className="text-sm font-bold text-slate-700">Active Listing</span>
                </label>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-[#0F172A] p-8 rounded-[2.5rem] text-white shadow-xl shadow-indigo-100">
              <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-6">Financial Analytics</h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <span className="text-xs text-slate-400 font-medium">Portfolio Value</span>
                  <span className="font-bold">Rs. {(watchedQty * watchedCost).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400 font-medium">Avg Profit/Unit</span>
                  <span className="font-bold text-green-400">Rs. {(watchedSale - watchedCost).toFixed(2)}</span>
                </div>
              </div>
              <div className="mt-8 p-4 bg-slate-800/50 rounded-2xl border border-slate-700">
                <div className="flex items-center gap-2 mb-1">
                  <InformationCircleIcon className="w-4 h-4 text-indigo-400" />
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-tighter">Current Portfolio Margin</span>
                </div>
                <p className="text-2xl font-black">{(((watchedSale - watchedCost) / watchedSale) * 100).toFixed(1)}%</p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Button type="submit" className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 rounded-2xl shadow-lg shadow-indigo-100" loading={createMutation.isPending || updateMutation.isPending}>
                <CheckCircleIcon className="w-5 h-5 mr-2" />
                {id ? 'Apply Updates' : 'Create Product'}
              </Button>
              <Button type="button" variant="ghost" className="w-full py-4 rounded-2xl" onClick={() => navigate('/products')}>Cancel</Button>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}