import { Request, Response } from "express";
import prisma from "../lib/db";
import { z } from "zod";

// simple UUID guard (Postgres uuid)
const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const payloadSchema = z.object({
  label: z.string().min(1),
  value: z.number(), // you use `value` in your schema
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // 'YYYY-MM-DD'
  categoryId: z.string().optional().nullable(),
});

export const createExpense = async (req: Request, res: Response) => {
  const parsed = payloadSchema.safeParse(req.body);

  if (!parsed.success) {
    return res
      .status(400)
      .json({ error: "Invalid payload", issues: parsed.error.flatten() });
  }

  let { label, value, date, categoryId } = parsed.data;

  // Normalize categoryId: empty string -> null
  if (!categoryId || categoryId.trim() === "") {
    categoryId = null;
  }

  // Build create data
  const data: any = {
    label,
    value, // Float in Prisma
    date: new Date(date), // store as DateTime
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

export const getAllExpenses = async (_req: Request, res: Response) => {
  try {
    const expenses = await prisma.expense.findMany({
      include: {
        category: true,
      },
      orderBy: {
        date: "desc",
      },
    });

    res.json(expenses);
  } catch (error) {
    console.error("❌ Error fetching expenses:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getExpenseById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const expense = await prisma.expense.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!expense) {
      return res.status(404).json({ error: "Expense not found" });
    }

    res.json(expense);
  } catch (error) {
    console.error("❌ Error fetching expense:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateExpense = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { label, value, date, categoryId } = req.body;

    const updated = await prisma.expense.update({
      where: { id },
      data: {
        label,
        value: value ? parseFloat(value) : undefined,
        date: date ? new Date(date) : undefined,
        categoryId,
      },
    });

    res.json(updated);
  } catch (error) {
    console.error("❌ Error updating expense:", error);
    if ((error as any).code === "P2025") {
      res.status(404).json({ error: "Expense not found" });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
};

export const deleteExpense = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.expense.delete({
      where: { id },
    });

    res.status(204).send(); // No content
  } catch (error) {
    console.error("❌ Error deleting expense:", error);
    if ((error as any).code === "P2025") {
      res.status(404).json({ error: "Expense not found" });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
};
