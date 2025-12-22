// src/pages/auth/ForgotPassword.jsx
import React from "react";
import AuthLayout from "../../components/layout/AuthLayout";
import ForgotPasswordForm from "./ForgotPasswordForm";

export default function ForgotPassword() {
  return (
    <AuthLayout>
      <div>
        <h2 className="text-2xl font-semibold mb-4">Forgot password</h2>
        <ForgotPasswordForm />
      </div>
    </AuthLayout>
  );
}
