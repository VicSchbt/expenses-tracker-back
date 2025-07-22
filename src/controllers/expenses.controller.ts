import { Request, Response } from "express";
import prisma from "../lib/db";

export const createExpense = async (req: Request, res: Response) => {
  try {
    const { label, value, date, categoryId } = req.body;

    if (!label || !value || !date) {
      return res
        .status(400)
        .json({ error: "label, value and date are required." });
    }

    const newExpense = await prisma.expense.create({
      data: {
        label,
        value: parseFloat(value),
        date: new Date(date),
        categoryId: categoryId || null,
      },
    });

    res.status(201).json(newExpense);
  } catch (error) {
    console.error("❌ Error creating expense:", error);
    res.status(500).json({ error: "Internal server error" });
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
