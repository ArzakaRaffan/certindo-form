-- Preserve LAB and INSITU for historical submissions while enabling the
-- customer-facing service location values used by new submissions.
ALTER TYPE "JenisLayanan" ADD VALUE IF NOT EXISTS 'IN_OUR_LAB';
ALTER TYPE "JenisLayanan" ADD VALUE IF NOT EXISTS 'ON_SITE';
ALTER TYPE "JenisLayanan" ADD VALUE IF NOT EXISTS 'HYBRID';
