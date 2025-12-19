// src/pages/auth/RegisterForm.jsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import api from '../../api/axios'
import { useDispatch } from 'react-redux'
import { setCredentials } from '../../store/authSlice'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

const schema = z.object({
  name: z.string().min(2, { message: 'Enter your name' }),
  email: z.string().email({ message: 'Enter a valid email' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
})

export default function RegisterForm() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) })
  const dispatch = useDispatch()
  const navigate = useNavigate()

  async function onSubmit(values) {
    try {
      const toastId = toast.loading('Creating account...')
      const res = await api.post('/auth/register', values)
      const { token, user } = res.data
      dispatch(setCredentials({ token, user }))
      toast.success('Account created', { id: toastId })
      navigate('/', { replace: true })
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Registration failed')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input label="Name" placeholder="Your name" {...register('name')} error={errors.name?.message} />
      <Input label="Email" placeholder="you@example.com" {...register('email')} error={errors.email?.message} />
      <Input type="password" label="Password" placeholder="Password" {...register('password')} error={errors.password?.message} />
      <Button type="submit" className="bg-green-600 text-white" disabled={isSubmitting}>
        {isSubmitting ? 'Creating...' : 'Create account'}
      </Button>
    </form>
  )
}
