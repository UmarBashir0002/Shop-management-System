import { z } from "zod";

export const createPrintJobSchema = z.object({
  customer_name: z.string().optional(),
  pages: z.number().int().positive(),
  rate: z.number().positive(),
  payment_status: z.enum(["PAID", "UNPAID"]).optional(),
});
