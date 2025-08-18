import { Request, Response } from "express";
import prisma from "../lib/db";
import { createExpense } from "./createExpense";
import { getAllExpenses } from "./getAllExpenses";

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

export const createExpenseController = async (req: Request, res: Response) => {
  return createExpense(req, res);
};

export const getAllExpensesController = async (req: Request, res: Response) => {
  return getAllExpenses(req, res);
};
