-- Create Recurrence enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Recurrence') THEN
        CREATE TYPE "Recurrence" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY');
    END IF;
END $$;

-- Create SavingsGoal table if it doesn't exist
CREATE TABLE IF NOT EXISTS "SavingsGoal" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "targetAmount" DECIMAL(65,30) NOT NULL,
    "currentAmount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "dueDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavingsGoal_pkey" PRIMARY KEY ("id")
);

-- Add missing columns to Transaction table
DO $$ 
BEGIN
    -- Add recurrence column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Transaction' AND column_name = 'recurrence'
    ) THEN
        ALTER TABLE "Transaction" ADD COLUMN "recurrence" "Recurrence";
    END IF;

    -- Add isPaid column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Transaction' AND column_name = 'isPaid'
    ) THEN
        ALTER TABLE "Transaction" ADD COLUMN "isPaid" BOOLEAN DEFAULT false;
    END IF;

    -- Add dueDate column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Transaction' AND column_name = 'dueDate'
    ) THEN
        ALTER TABLE "Transaction" ADD COLUMN "dueDate" TIMESTAMP(3);
    END IF;

    -- Add goalId column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Transaction' AND column_name = 'goalId'
    ) THEN
        ALTER TABLE "Transaction" ADD COLUMN "goalId" TEXT;
    END IF;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS "SavingsGoal_userId_idx" ON "SavingsGoal"("userId");
CREATE INDEX IF NOT EXISTS "Transaction_goalId_idx" ON "Transaction"("goalId");

-- Add foreign key constraints if they don't exist
DO $$ 
BEGIN
    -- Add foreign key for SavingsGoal.userId
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'SavingsGoal_userId_fkey'
    ) THEN
        ALTER TABLE "SavingsGoal" ADD CONSTRAINT "SavingsGoal_userId_fkey" 
            FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    -- Add foreign key for Transaction.goalId
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'Transaction_goalId_fkey'
    ) THEN
        ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_goalId_fkey" 
            FOREIGN KEY ("goalId") REFERENCES "SavingsGoal"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

