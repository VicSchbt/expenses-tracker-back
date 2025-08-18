import prisma from "../lib/db";
import { z } from "zod";
import { Request, Response } from "express";

// simple UUID guard (Postgres uuid)
const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const payloadSchema = z
  .object({
    label: z.string().min(1),
    value: z.number(), // you use `value` in your schema
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // 'YYYY-MM-DD'
    categoryId: z.string().optional().nullable(),
  })
  .strip();

export const createExpense = async (req: Request, res: Response) => {
  const parsed = payloadSchema.safeParse(req.body);

  if (!parsed.success) {
    return res
      .status(400)
      .json({ error: "Invalid payload", issues: parsed.error.flatten() });
  }

  let { label, value, date, categoryId } = parsed.data;
  const userId = (req as any).user.id;

  // Normalize categoryId: empty string -> null
  if (!categoryId || categoryId.trim() === "") {
    categoryId = null;
  }

  // Build create data
  const data: any = {
    label,
    value, // Float in Prisma
    date: new Date(date), // store as DateTime
    userId,
  };

  // Only connect if a valid UUID AND the category exists
  if (categoryId) {
    if (!uuidRegex.test(categoryId)) {
      return res
        .status(400)
        .json({ error: "categoryId must be a valid UUID or be empty" });
    }
    const cat = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!cat) {
      return res.status(400).json({ error: "Unknown categoryId" });
    }
    data.category = { connect: { id: categoryId } };
  }

  try {
    const created = await prisma.expense.create({ data });
    return res.status(201).json(created);
  } catch (e: any) {
    if (e?.code === "P2003") {
      // FK violation (shouldn’t happen with the checks, but just in case)
      return res
        .status(400)
        .json({ error: "Invalid categoryId (foreign key)" });
    }
    console.error("❌ Error creating expense:", e);
    return res.status(500).json({ error: "Failed to create expense" });
  }
};
