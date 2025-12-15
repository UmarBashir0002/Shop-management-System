import { z } from "zod";

const itemTypes = ["PRINTER", "LAPTOP", "ACCESSORY", "SERVICE"];

export const createItemSchema = z.object({
  name: z.string().min(1),
  brand: z.string().min(1),
  type: z.enum(itemTypes),
  costPrice: z.number().nonnegative(),
  salePrice: z.number().nonnegative(),
  quantity: z.number().int().nonnegative(),
  isActive: z.boolean().optional(), // default true
});

export const updateItemSchema = z.object({
  name: z.string().optional(),
  brand: z.string().optional(),
  type: z.enum(itemTypes).optional(),
  costPrice: z.number().nonnegative().optional(),
  salePrice: z.number().nonnegative().optional(),
  quantity: z.number().int().nonnegative().optional(),
  isActive: z.boolean().optional(),
});
