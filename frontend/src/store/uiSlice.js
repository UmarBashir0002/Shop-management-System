import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  globalLoading: false,
  toastMessage: null,
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setGlobalLoading: (state, action) => {
      state.globalLoading = action.payload
    },
    setToastMessage: (state, action) => {
      state.toastMessage = action.payload
    },
    clearToast: (state) => {
      state.toastMessage = null
    },
  },
})

export const { setGlobalLoading, setToastMessage, clearToast } = uiSlice.actions
export default uiSlice.reducer
