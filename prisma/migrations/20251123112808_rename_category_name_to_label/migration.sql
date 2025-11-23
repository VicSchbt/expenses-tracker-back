-- Rename column from name to label
ALTER TABLE "Category" RENAME COLUMN "name" TO "label";

-- Add color column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Category' AND column_name = 'color'
    ) THEN
        ALTER TABLE "Category" ADD COLUMN "color" TEXT;
    END IF;
END $$;

-- Add icon column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Category' AND column_name = 'icon'
    ) THEN
        ALTER TABLE "Category" ADD COLUMN "icon" TEXT;
    END IF;
END $$;

