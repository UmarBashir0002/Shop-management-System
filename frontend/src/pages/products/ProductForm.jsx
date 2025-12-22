import React, { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useNavigate, useParams } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import { useCreateItem, useUpdateItem, useItemQuery } from '../../hooks/useProducts'

// 1. Validation Schema
const productSchema = z
  .object({
    name: z.string().min(4, 'Name must be at least 4 characters'),
    brand: z.string().min(1, 'Brand required'),
    type: z.string().min(1, 'Please select a type'),
    costPrice: z.number().min(0, 'Required'),
    salePrice: z.number().min(0, 'Required'),
    quantity: z.number().min(0, 'Required'),
    isActive: z.boolean().default(true),
  })
  .refine((data) => data.salePrice > data.costPrice, {
    message: 'Sale price must be > Cost price',
    path: ['salePrice'],
  })

const CATEGORIES = ['PRINTER', 'LAPTOP', 'ACCESSORY', 'SERVICE']

export default function ProductForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: itemData } = useItemQuery(id)
  const createMutation = useCreateItem()
  const updateMutation = useUpdateItem()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: { isActive: true },
  })

  useEffect(() => {
    if (itemData) reset(itemData)
  }, [itemData, reset])

  const onSubmit = async (values) => {
    if (id) await updateMutation.mutateAsync({ id, payload: values })
    else await createMutation.mutateAsync(values)
    navigate('/products')
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-2xl font-bold text-slate-800 mb-6">
          {id ? 'Edit Product' : 'New Product'}
        </h3>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input label="Product Name" {...register('name')} error={errors.name?.message} />

          <div className="grid grid-cols-2 gap-4">
            <Input label="Brand" {...register('brand')} error={errors.brand?.message} />

            {/* Simplified Styled Dropdown */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-slate-700">Category Type</label>
              <select
                {...register('type')}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              >
                <option value="">Select Type</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {errors.type && <span className="text-red-500 text-xs">{errors.type.message}</span>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Cost Price"
              type="number"
              step="0.01"
              {...register('costPrice', { valueAsNumber: true })}
              error={errors.costPrice?.message}
            />
            <Input
              label="Sale Price"
              type="number"
              step="0.01"
              {...register('salePrice', { valueAsNumber: true })}
              error={errors.salePrice?.message}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 items-center pt-2">
            <Input
              label="Stock Quantity"
              type="number"
              {...register('quantity', { valueAsNumber: true })}
              error={errors.quantity?.message}
            />
            <label className="flex items-center gap-3 cursor-pointer mt-6">
              <input
                type="checkbox"
                {...register('isActive')}
                className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
              />
              <span className="text-sm font-medium text-slate-700">Mark as Active</span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
            <Button type="button" variant="ghost" onClick={() => navigate('/products')}>
              Cancel
            </Button>
            <Button type="submit" loading={createMutation.isPending || updateMutation.isPending}>
              {id ? 'Update Product' : 'Save Product'}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
