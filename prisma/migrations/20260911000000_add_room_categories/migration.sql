-- Add categories column to Room (host-selected trivia categories)
ALTER TABLE "Room" ADD COLUMN IF NOT EXISTS "categories" TEXT NOT NULL DEFAULT '[]';