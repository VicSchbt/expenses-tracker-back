-- CreateTable
CREATE TABLE "MonthlyBalanceSummary" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "totalIncome" DECIMAL NOT NULL DEFAULT 0,
    "totalBills" DECIMAL NOT NULL DEFAULT 0,
    "totalSavings" DECIMAL NOT NULL DEFAULT 0,
    "totalSubscriptions" DECIMAL NOT NULL DEFAULT 0,
    "totalExpenses" DECIMAL NOT NULL DEFAULT 0,
    "totalRefunds" DECIMAL NOT NULL DEFAULT 0,
    "balance" DECIMAL NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MonthlyBalanceSummary_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MonthlyBalanceSummary_userId_year_month_key" ON "MonthlyBalanceSummary"("userId", "year", "month");

-- CreateIndex
CREATE INDEX "MonthlyBalanceSummary_userId_year_month_idx" ON "MonthlyBalanceSummary"("userId", "year", "month");

-- AddForeignKey
ALTER TABLE "MonthlyBalanceSummary" ADD CONSTRAINT "MonthlyBalanceSummary_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;


