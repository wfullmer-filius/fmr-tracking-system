-- Add additional tracking fields to FMR requests table
ALTER TABLE fmr_requests 
ADD COLUMN form_submission_type TEXT,
ADD COLUMN fmr_created_date TIMESTAMP DEFAULT NOW(),
ADD COLUMN warranty_stop_date DATE,
ADD COLUMN completed_date DATE,
ADD COLUMN fmr_received_date_by_failures DATE,
ADD COLUMN tracking_no_type TEXT,
ADD COLUMN tracking_no TEXT,
ADD COLUMN rma_no_type TEXT,
ADD COLUMN rma_no TEXT,
ADD COLUMN engineer_deployed_type TEXT,
ADD COLUMN engineer_name TEXT,
ADD COLUMN deployment_date DATE,
ADD COLUMN record_updated TIMESTAMP DEFAULT NOW(),
ADD COLUMN record_entered_on TIMESTAMP DEFAULT NOW(),
ADD COLUMN record_entered_by TEXT;