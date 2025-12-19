import { z } from "zod";

export const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        itemId: z
          .number({ invalid_type_error: "itemId must be a number" })
          .int({ message: "itemId must be an integer" })
          .positive({ message: "itemId must be greater than 0" }),

        quantity: z
          .number({ invalid_type_error: "quantity must be a number" })
          .int({ message: "quantity must be an integer" })
          .positive({ message: "quantity must be at least 1" }),
      })
    )
    .min(1, { message: "Order must contain at least one item" }),
});
