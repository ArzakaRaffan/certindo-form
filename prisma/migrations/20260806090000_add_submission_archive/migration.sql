-- Add reversible archiving metadata without changing or removing existing rows.
ALTER TABLE "Submission"
ADD COLUMN "archivedAt" TIMESTAMP(3),
ADD COLUMN "archivedBy" TEXT;

CREATE INDEX "Submission_archivedAt_idx" ON "Submission"("archivedAt");
