import { Router } from "express";
import {
  createExpense,
  getAllExpenses,
  getExpenseById,
  deleteExpense,
  updateExpense,
} from "../controllers/expenses.controller";

const router = Router();

router.post("/", createExpense);
router.get("/", getAllExpenses);
router.get("/:id", getExpenseById);
router.delete("/:id", deleteExpense);
router.patch("/:id", updateExpense);

export default router;
