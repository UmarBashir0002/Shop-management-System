import { z } from "zod";

// Removed hardcoded itemTypes array as categories are now dynamic in the DB

export const createItemSchema = z.object({
  name: z
    .string()
    .min(1, { message: "name is required" }),

  brand: z
    .string()
    .min(1, { message: "brand is required" }),

  // Updated: categoryId validation (accepts number or string, ensures it's not empty)
  categoryId: z.union([
    z.number().positive({ message: "Invalid category ID" }),
    z.string().min(1, { message: "Category is required" })
  ]),

  costPrice: z
    .number({ invalid_type_error: "costPrice must be a number" })
    .nonnegative({ message: "costPrice cannot be negative" }),

  salePrice: z
    .number({ invalid_type_error: "salePrice must be a number" })
    .nonnegative({ message: "salePrice cannot be negative" }),

  quantity: z
    .number({ invalid_type_error: "quantity must be a number" })
    .int({ message: "quantity must be an integer" })
    .nonnegative({ message: "quantity cannot be negative" }),

  isActive: z.boolean().optional(),
});

export const updateItemSchema = z.object({
  name: z.string().min(1, { message: "name cannot be empty" }).optional(),
  brand: z.string().min(1, { message: "brand cannot be empty" }).optional(),

  // Updated: categoryId is optional for updates
  categoryId: z.union([
    z.number().positive(),
    z.string().min(1)
  ]).optional(),

  costPrice: z.number().nonnegative({ message: "costPrice cannot be negative" }).optional(),
  salePrice: z.number().nonnegative({ message: "salePrice cannot be negative" }).optional(),

  quantity: z
    .number()
    .int({ message: "quantity must be an integer" })
    .nonnegative({ message: "quantity cannot be negative" })
    .optional(),

  isActive: z.boolean().optional(),
});