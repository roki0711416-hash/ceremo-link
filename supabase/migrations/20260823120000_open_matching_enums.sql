-- Open matching: add enum values in their own migration.
-- Postgres forbids using new enum labels until after this transaction commits.

ALTER TYPE public.job_status ADD VALUE IF NOT EXISTS 'open';
ALTER TYPE public.job_status ADD VALUE IF NOT EXISTS 'assigned';
