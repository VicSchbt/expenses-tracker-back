import { Router } from "express";
import {
  createTransaction,
  getAllTransactions,
  getTransactionById,
  deleteTransaction,
  updateTransaction,
} from "../controllers/transaction/transaction.controller";
import { basicAuth } from "../middleware/basicAuth";
import { z } from "zod";
import { payloadSchema as createTransactionBodySchema } from "../controllers/transaction/transaction.controller";
const router = Router();

router.use(basicAuth);

router.post(
  "/",
  async (req, res, next) => {
    try {
      const parsed = createTransactionBodySchema.parse(req.body);
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
  createTransaction
);
router.get("/", getAllTransactions);
router.get("/:id", getTransactionById);
router.delete("/:id", deleteTransaction);
router.patch("/:id", updateTransaction);

export default router;
