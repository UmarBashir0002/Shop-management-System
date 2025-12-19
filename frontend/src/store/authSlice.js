import { createSlice } from '@reduxjs/toolkit'

// load token from localStorage (simple persistence)
const tokenFromStorage = localStorage.getItem('auth_token') || null
const userFromStorage = localStorage.getItem('auth_user')
  ? JSON.parse(localStorage.getItem('auth_user'))
  : null

const initialState = {
  token: tokenFromStorage,
  user: userFromStorage,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { token, user } = action.payload
      state.token = token
      state.user = user ?? state.user
      if (token) localStorage.setItem('auth_token', token)
      if (user) localStorage.setItem('auth_user', JSON.stringify(user))
    },
    setUser: (state, action) => {
      state.user = action.payload
      localStorage.setItem('auth_user', JSON.stringify(action.payload))
    },
    logout: (state) => {
      state.token = null
      state.user = null
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
    },
  },
})

export const { setCredentials, setUser, logout } = authSlice.actions
export default authSlice.reducer
