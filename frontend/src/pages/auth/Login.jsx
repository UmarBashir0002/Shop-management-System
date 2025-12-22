// src/pages/auth/Login.jsx
import React from "react";
import AuthLayout from "../../components/layout/AuthLayout";
import LoginForm from "./LoginForm";

export default function Login() {
  return (
    <AuthLayout>
      <div>
        <h2 className="text-2xl font-semibold mb-4">Sign in to your account</h2>
        <LoginForm />
      </div>
    </AuthLayout>
  );
}
