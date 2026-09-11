-- Track which players have already claimed trivia bonus coins for a turn
ALTER TABLE "Turn" ADD COLUMN IF NOT EXISTS "bonusAnswerers" TEXT NOT NULL DEFAULT '[]';