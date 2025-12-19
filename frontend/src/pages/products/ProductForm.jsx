// src/pages/products/ProductForm.jsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Input from '../../components/common/Input'
import Textarea from '../../components/common/Textarea'
import Button from '../../components/common/Button'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

const schema = z.object({
  name: z.string().min(1, 'Name required'),
  price: z.number().min(0),
  description: z.string().optional(),
})

export default function ProductForm({ initialValues = null }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: initialValues ?? { name: '', price: 0, description: '' },
  })

  const qc = useQueryClient()
  const navigate = useNavigate()

  const mutation = useMutation(
    (payload) => (initialValues ? api.put(`/products/${initialValues.id}`, payload) : api.post('/products', payload)),
    {
      onSuccess: () => {
        qc.invalidateQueries(['products'])
      },
    }
  )

  async function onSubmit(values) {
    try {
      const payload = { ...values, price: Number(values.price) }
      await mutation.mutateAsync(payload)
      toast.success('Saved product')
      navigate('/products')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save product')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input label="Name" {...register('name')} error={errors.name?.message} />
      <Input label="Price" type="number" {...register('price', { valueAsNumber: true })} error={errors.price?.message} />
      <Textarea label="Description" {...register('description')} error={errors.description?.message} />
      <div className="flex gap-3">
        <Button type="submit" className="bg-blue-600 text-white" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save'}</Button>
        <Button type="button" onClick={() => navigate('/products')}>Cancel</Button>
      </div>
    </form>
  )
}
