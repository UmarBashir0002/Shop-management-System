import axios from 'axios'
import { store } from '../store'
import { logout } from '../store/authSlice'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  timeout: 20000,
})

// attach token on every request
api.interceptors.request.use((config) => {
  try {
    const state = store.getState()
    const token = state?.auth?.token
    if (token) {
      config.headers = config.headers ?? {}
      config.headers.Authorization = `Bearer ${token}`
    }
  } catch (err) {
console.log(err)  }
  return config
})

// response interceptor: handle 401 centrally
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error?.response?.status === 401) {
      // sign out locally and redirect (app should handle redirect)
      store.dispatch(logout())
    }
    return Promise.reject(error)
  }
)

export default api
