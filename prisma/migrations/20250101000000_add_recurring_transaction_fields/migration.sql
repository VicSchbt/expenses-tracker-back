-- Add recurring transaction fields
DO $$ 
BEGIN
    -- Add recurrenceEndDate column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Transaction' AND column_name = 'recurrenceEndDate'
    ) THEN
        ALTER TABLE "Transaction" ADD COLUMN "recurrenceEndDate" TIMESTAMP(3);
    END IF;

    -- Add parentTransactionId column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Transaction' AND column_name = 'parentTransactionId'
    ) THEN
        ALTER TABLE "Transaction" ADD COLUMN "parentTransactionId" TEXT;
    END IF;
END $$;

-- Create index for parentTransactionId if it doesn't exist
CREATE INDEX IF NOT EXISTS "Transaction_parentTransactionId_idx" ON "Transaction"("parentTransactionId");

-- Add foreign key constraint for parentTransactionId if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'Transaction_parentTransactionId_fkey'
    ) THEN
        ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_parentTransactionId_fkey" 
            FOREIGN KEY ("parentTransactionId") REFERENCES "Transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

