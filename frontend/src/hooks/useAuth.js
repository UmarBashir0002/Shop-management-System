// src/hooks/useAuth.js
import { useDispatch, useSelector } from "react-redux";
import { login as apiLogin, fetchProfile } from "../api/auth.api";
import { setCredentials, logout } from "../store/authSlice";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {  } from "@tanstack/react-query";

export default function useAuth() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const auth = useSelector((s) => s.auth);

  const signin = async ({ username, password }) => {
    const data = await apiLogin({ username, password });
    // backend expected: { user, token }
    dispatch(setCredentials({ user: data.user, token: data.token }));
    toast.success("Welcome!");
    navigate("/dashboard");
  };

  const signout = () => {
    dispatch(logout());
    navigate("/auth/login");
    toast.success("Logged out");
  };

  const profileQuery = (["profile"], fetchProfile, {
    enabled: !!auth.token,
    onSuccess(data) {
      // sync
      dispatch(setCredentials({ user: data }));
    },
    onError() {},
  });

  return { ...auth, signin, signout, profileQuery };
}
