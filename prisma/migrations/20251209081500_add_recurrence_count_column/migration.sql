-- Add recurrenceCount column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Transaction' AND column_name = 'recurrenceCount'
    ) THEN
        ALTER TABLE "Transaction" ADD COLUMN "recurrenceCount" INTEGER;
    END IF;
END $$;
