import prisma from "../lib/db";
import { Request, Response } from "express";

export const getAllExpenses = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const expenses = await prisma.expense.findMany({
      where: {
        userId: userId,
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
