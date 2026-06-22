-- Add askedQuestions column to Room (was missing from initial migration)
ALTER TABLE "Room" ADD COLUMN IF NOT EXISTS "askedQuestions" TEXT NOT NULL DEFAULT '[]';

-- Add questionFunFact column to Turn (was missing from initial migration)
ALTER TABLE "Turn" ADD COLUMN IF NOT EXISTS "questionFunFact" TEXT;
