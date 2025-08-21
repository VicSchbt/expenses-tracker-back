import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import expenseRoutes from "./routes/expenses";
import categoryRoutes from "./routes/category.routes";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: ["http://localhost:3000", process.env.FRONTEND_URL].filter(
      Boolean
    ) as string[],
    credentials: true,
  })
);
app.use(express.json());

app.use("/api/expenses", expenseRoutes);
app.use("/api/categories", categoryRoutes);

export default app;
