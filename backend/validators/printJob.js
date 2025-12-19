import { z } from "zod";

export const createPrintJobSchema = z.object({
  customer_name: z
    .string()
    .min(1, { message: "customer_name cannot be empty" })
    .optional(),

  pages: z
    .number({ invalid_type_error: "pages must be a number" })
    .int({ message: "pages must be an integer" })
    .positive({ message: "pages must be at least 1" }),

  rate: z
    .number({ invalid_type_error: "rate must be a number" })
    .positive({ message: "rate must be greater than 0" }),
});
