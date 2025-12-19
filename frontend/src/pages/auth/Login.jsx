import AuthLayout from '../../components/layout/AuthLayout'
import LoginForm from './LoginForm'

export default function Login() {
  return (
    <AuthLayout>
      <h1 className="text-xl font-semibold mb-4">Login</h1>
      <LoginForm />
    </AuthLayout>
  )
}
