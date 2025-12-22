// src/pages/auth/LoginForm.jsx
import React from "react";
import { useForm } from "react-hook-form";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import useAuth from "../../hooks/useAuth";

export default function LoginForm() {
  const { signin } = useAuth();
  const { register, handleSubmit, formState } = useForm();

  const onSubmit = async (values) => {
    try {
      await signin(values);
    } catch (err) {
      console.log(err)
      // axios interceptor will show toast
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input label="Username" {...register("username", { required: "Username required" })} />
      <Input label="Password" type="password" {...register("password", { required: "Password required" })} />
      <div className="flex justify-end">
        <Button type="submit" disabled={formState.isSubmitting}>Sign in</Button>
      </div>
    </form>
  );
}
