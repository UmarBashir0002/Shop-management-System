import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});


export const newPasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, "Current password is required"),

  newPassword: z
    .string()
    .min(6, "Password must be at least 6 characters long")
    .regex(/[a-zA-Z]/, "Password must contain at least one letter"),
});