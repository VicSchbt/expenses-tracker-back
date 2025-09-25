import prisma from "../../lib/db";
import { Request, Response } from "express";
import { payloadSchema } from "../../validators/transaction.schema";

// simple UUID guard (Postgres uuid)
const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  export const createTransaction = async (req: Request, res: Response) => {
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
      type: "EXPENSE",
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
      const created = await prisma.transaction.create({ data });
      return res.status(201).json(created);
    } catch (e: any) {
      if (e?.code === "P2003") {
        // FK violation (shouldn’t happen with the checks, but just in case)
        return res
          .status(400)
          .json({ error: "Invalid categoryId (foreign key)" });
      }
      console.error("❌ Error creating transaction:", e);
      return res.status(500).json({ error: "Failed to create expense" });
    }
  };

  export const getTransactionById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
  
      const transaction = await prisma.transaction.findUnique({
        where: { id },
        include: { category: true },
      });
  
      if (!transaction) {
        return res.status(404).json({ error: "Transaction not found" });
      }
  
      res.json(transaction);
    } catch (error) {
      console.error("❌ Error fetching transaction:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
  
  export const updateTransaction = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { label, value, date, categoryId } = req.body;
  
      const updated = await prisma.transaction.update({
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
      console.error("❌ Error updating transaction:", error);
      if ((error as any).code === "P2025") {
        res.status(404).json({ error: "Transaction not found" });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  };
  
  export const deleteTransaction = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
  
      await prisma.transaction.delete({
        where: { id },
      });
  
      res.status(204).send(); // No content
    } catch (error) {
      console.error("❌ Error deleting transaction:", error);
      if ((error as any).code === "P2025") {
        res.status(404).json({ error: "Transaction not found" });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  };

  export const getAllTransactions = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const transactions = await prisma.transaction.findMany({
        where: {
          userId: userId,
        },
        orderBy: {
          date: "desc",
        },
      });
  
      res.json(transactions);
    } catch (error) {
      console.error("❌ Error fetching transactions:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
  