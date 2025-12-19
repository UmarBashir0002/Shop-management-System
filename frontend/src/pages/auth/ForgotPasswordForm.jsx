// src/pages/auth/ForgotPasswordForm.jsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import api from '../../api/axios'
import toast from 'react-hot-toast'

const schema = z.object({
  email: z.string().email({ message: 'Enter a valid email' }),
})

export default function ForgotPasswordForm() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) })

  async function onSubmit(values) {
    try {
      const toastId = toast.loading('Sending reset link...')
      await api.post('/auth/forgot-password', values)
      toast.success('Reset link sent (check your email)', { id: toastId })
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to send reset link')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input label="Email" placeholder="you@example.com" {...register('email')} error={errors.email?.message} />
      <Button type="submit" className="bg-blue-600 text-white" disabled={isSubmitting}>
        {isSubmitting ? 'Sending...' : 'Send reset link'}
      </Button>
    </form>
  )
}
