import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import expenseRoutes from "./routes/expenses";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/expenses", expenseRoutes);

export default app;
