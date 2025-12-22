// src/pages/auth/RegisterForm.jsx
import React from "react";
import { useForm } from "react-hook-form";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import toast from "react-hot-toast";

export default function RegisterForm() {
  const { register, handleSubmit } = useForm();
  const onSubmit = (v) => {
    toast("Registration isn't implemented on backend. Use admin to create users.", { icon: "ℹ️" });
    console.log("register", v);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input label="Username" {...register("username")} />
      <Input label="Password" type="password" {...register("password")} />
      <div className="flex justify-end">
        <Button type="submit">Register</Button>
      </div>
    </form>
  );
}
