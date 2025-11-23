-- Fix User table: rename password to passwordHash and add missing columns
DO $$ 
BEGIN
    -- Rename password column to passwordHash if it exists and passwordHash doesn't
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'User' AND column_name = 'password'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'User' AND column_name = 'passwordHash'
    ) THEN
        ALTER TABLE "User" RENAME COLUMN "password" TO "passwordHash";
    END IF;

    -- Add createdAt column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'User' AND column_name = 'createdAt'
    ) THEN
        ALTER TABLE "User" ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    END IF;

    -- Add updatedAt column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'User' AND column_name = 'updatedAt'
    ) THEN
        ALTER TABLE "User" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    END IF;
END $$;

-- Fix Category table: rename name to label and add missing columns
DO $$ 
BEGIN
    -- Rename name column to label if it exists and label doesn't
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Category' AND column_name = 'name'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Category' AND column_name = 'label'
    ) THEN
        ALTER TABLE "Category" RENAME COLUMN "name" TO "label";
    END IF;

    -- Add color column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Category' AND column_name = 'color'
    ) THEN
        ALTER TABLE "Category" ADD COLUMN "color" TEXT;
    END IF;

    -- Add icon column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Category' AND column_name = 'icon'
    ) THEN
        ALTER TABLE "Category" ADD COLUMN "icon" TEXT;
    END IF;
END $$;

-- Drop the old unique constraint on userId and name if it exists
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'Category_userId_name_key'
    ) THEN
        ALTER TABLE "Category" DROP CONSTRAINT "Category_userId_name_key";
    END IF;
END $$;

