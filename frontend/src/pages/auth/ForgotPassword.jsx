import AuthLayout from '../../components/layout/AuthLayout'
import ForgotPasswordForm from './ForgotPasswordForm'

export default function Login() {
  return (
    <AuthLayout>
      <h1 className="text-xl font-semibold mb-4">Login</h1>
      <ForgotPasswordForm />
    </AuthLayout>
  )
}