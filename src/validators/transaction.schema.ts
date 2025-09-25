import { z } from "zod";

export const payloadSchema = z
  .object({
    label: z.string().min(1),
    value: z.number(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    categoryId: z.string().optional().nullable(),
  })
  .strip();