// src/store/authSlice.js
import { createSlice } from "@reduxjs/toolkit";

const persisted = JSON.parse(localStorage.getItem("shop_auth") || "null");

const initialState = persisted 
  ? { ...persisted, isAuthenticated: !!persisted.token } 
  : {
      user: null,
      token: null,
      isAuthenticated: false,
    };

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials(state, action) {
      const { user, token } = action.payload || {};
      state.user = user ?? state.user;
      state.token = token ?? state.token;
      state.isAuthenticated = !!(token || state.token);
      
      localStorage.setItem(
        "shop_auth",
        JSON.stringify({ 
          user: state.user, 
          token: state.token, 
          isAuthenticated: state.isAuthenticated 
        })
      );
    },
    logout(state) {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem("shop_auth");
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;