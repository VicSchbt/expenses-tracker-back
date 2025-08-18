import { Router } from "express";
import {
  createExpenseController,
  getAllExpensesController,
  getExpenseById,
  deleteExpense,
  updateExpense,
} from "../controllers/expenses.controller";
import { basicAuth } from "../middleware/basicAuth";
import { z } from "zod";
import { payloadSchema as createExpenseBodySchema } from "../controllers/createExpense";
const router = Router();

router.use(basicAuth);

router.post(
  "/",
  async (req, res, next) => {
    try {
      const parsed = createExpenseBodySchema.parse(req.body);
      req.body = parsed; // overwrite with clean data
      next();
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res
          .status(400)
          .json({ error: "Invalid payload", issues: err.format() });
      }
      next(err);
    }
  },
  createExpenseController
);
router.get("/", getAllExpensesController);
router.get("/:id", getExpenseById);
router.delete("/:id", deleteExpense);
router.patch("/:id", updateExpense);

export default router;
