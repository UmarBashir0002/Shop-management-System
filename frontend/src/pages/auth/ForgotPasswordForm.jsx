// src/pages/auth/ForgotPasswordForm.jsx
import React from "react";
import { useForm } from "react-hook-form";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import toast from "react-hot-toast";

export default function ForgotPasswordForm() {
  const { register, handleSubmit } = useForm();
  const onSubmit = () => {
    toast("Password reset not implemented on backend. Contact admin.", { icon: "⚠️" });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input label="Username" {...register("username")} />
      <div className="flex justify-end">
        <Button type="submit">Request reset</Button>
      </div>
    </form>
  );
}
