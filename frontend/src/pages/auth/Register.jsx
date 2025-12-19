import AuthLayout from '../../components/layout/AuthLayout'
import RegisterForm from './RegisterForm'

export default function Login() {
  return (
    <AuthLayout>
      <h1 className="text-xl font-semibold mb-4">Login</h1>
      <RegisterForm />
    </AuthLayout>
  )
}
