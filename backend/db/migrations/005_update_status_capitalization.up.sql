-- Update existing status values to be capitalized first
UPDATE fmr_requests SET status = 'Draft' WHERE status = 'draft';
UPDATE fmr_requests SET status = 'Submitted' WHERE status = 'submitted';
UPDATE fmr_requests SET status = 'Unresolved' WHERE status = 'unresolved';
UPDATE fmr_requests SET status = 'In-Progress' WHERE status = 'in-progress';
UPDATE fmr_requests SET status = 'Resolved' WHERE status = 'resolved';
UPDATE fmr_requests SET status = 'Archived' WHERE status = 'archived';

-- Update status constraint to use capitalized values
ALTER TABLE fmr_requests DROP CONSTRAINT fmr_requests_status_check;
ALTER TABLE fmr_requests ADD CONSTRAINT fmr_requests_status_check 
  CHECK (status IN ('Draft', 'Submitted', 'Unresolved', 'In-Progress', 'Resolved', 'Archived'));

-- Update default status to capitalized version
ALTER TABLE fmr_requests ALTER COLUMN status SET DEFAULT 'Draft';
