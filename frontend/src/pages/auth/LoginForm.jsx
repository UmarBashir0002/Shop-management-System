// src/pages/auth/LoginForm.jsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import toast from 'react-hot-toast'
import api from '../../api/axios'
import { useDispatch } from 'react-redux'
import { setCredentials } from '../../store/authSlice'
import { useNavigate } from 'react-router-dom'

const schema = z.object({
  email: z.string().email({ message: 'Enter a valid email' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
})

export default function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) })

  const dispatch = useDispatch()
  const navigate = useNavigate()

  async function onSubmit(values) {
    try {
      const toastId = toast.loading('Logging in...')
      const res = await api.post('/auth/login', values)
      const { token, user } = res.data
      dispatch(setCredentials({ token, user }))
      toast.success('Logged in', { id: toastId })
      navigate('/', { replace: true })
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Login failed')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input label="Email" placeholder="you@example.com" {...register('email')} error={errors.email?.message} />
      <Input type="password" label="Password" placeholder="Password" {...register('password')} error={errors.password?.message} />

      <div className="flex items-center justify-between">
        <Button type="submit" className="bg-blue-600 text-white" disabled={isSubmitting}>
          {isSubmitting ? 'Signing in...' : 'Sign in'}
        </Button>
        <a className="text-sm text-blue-600" href="/forgot-password">Forgot?</a>
      </div>
    </form>
  )
}
