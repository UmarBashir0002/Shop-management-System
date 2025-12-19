import api from './axios'

export const fetchProducts = async () => {
  const { data } = await api.get('/products')
  return data
}

export const updateProduct = async ({ id, payload }) => {
  const { data } = await api.put(`/products/${id}`, payload)
  return data
}
