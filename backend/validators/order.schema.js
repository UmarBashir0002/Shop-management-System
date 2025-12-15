import { z } from "zod";

export const createOrderSchema = z.object({
  items: z.array(
    z.object({
      itemId: z.number().int().positive(),
      quantity: z.number().int().positive(),
    })
  ).min(1, "Order must contain at least one item"),
});
