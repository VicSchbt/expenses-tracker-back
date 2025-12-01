-- Add isAuto column to Transaction table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Transaction' AND column_name = 'isAuto'
    ) THEN
        ALTER TABLE "Transaction" ADD COLUMN "isAuto" BOOLEAN DEFAULT false;
    END IF;
END $$;

