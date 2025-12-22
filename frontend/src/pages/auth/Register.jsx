// src/pages/auth/Register.jsx
import React from "react";
import AuthLayout from "../../components/layout/AuthLayout";
import RegisterForm from "./RegisterForm";

export default function Register() {
  return (
    <AuthLayout>
      <div>
        <h2 className="text-2xl font-semibold mb-4">Create account</h2>
        <RegisterForm />
      </div>
    </AuthLayout>
  );
}
