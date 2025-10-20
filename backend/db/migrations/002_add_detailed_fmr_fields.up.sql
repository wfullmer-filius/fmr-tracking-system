-- Add new detailed fields to FMR requests table
ALTER TABLE fmr_requests 
ADD COLUMN control_number TEXT,
ADD COLUMN program TEXT DEFAULT 'CRC - AN/TYQ-23A - OMMOD',
ADD COLUMN unit TEXT,
ADD COLUMN ommod_sn TEXT,
ADD COLUMN ommod_system_meter_hrs TEXT,
ADD COLUMN technician_name TEXT,
ADD COLUMN email TEXT,
ADD COLUMN comm_number TEXT,
ADD COLUMN date_reported DATE,
ADD COLUMN failed_date DATE,
ADD COLUMN point_of_failure TEXT CHECK (point_of_failure IN ('Receipt', 'Testing', 'Mission', 'Other')),
ADD COLUMN failed_part_nomenclature TEXT,
ADD COLUMN failed_part_number TEXT,
ADD COLUMN qty TEXT,
ADD COLUMN part_serial_number TEXT,
ADD COLUMN describe_failure TEXT,
ADD COLUMN trouble_shooting_performed TEXT,
ADD COLUMN repair_technician TEXT,
ADD COLUMN repair_start_date DATE,
ADD COLUMN repair_activity_description TEXT,

-- Processing fields
ADD COLUMN repair_action TEXT,
ADD COLUMN repair_action_other TEXT,

-- Supply Chain fields
ADD COLUMN signed_1149 TEXT,
ADD COLUMN signed_1149_date DATE,
ADD COLUMN failed_part_received_date DATE,
ADD COLUMN new_part_received_date DATE,
ADD COLUMN new_part_issued_date DATE,
ADD COLUMN new_part_serial_number TEXT,
ADD COLUMN supply_comments TEXT,

-- Procurement fields
ADD COLUMN po_number TEXT,
ADD COLUMN warranty_start_date DATE,
ADD COLUMN new_part_ordered_date DATE,
ADD COLUMN vendor_contact_address TEXT,
ADD COLUMN procurement_comments TEXT,

-- Logistics fields
ADD COLUMN request_date DATE,
ADD COLUMN request_to_vendor_date DATE,
ADD COLUMN rma_received_date DATE,
ADD COLUMN shipped_to_vendor_date DATE,
ADD COLUMN logistics_comment TEXT,

-- Contractor fields
ADD COLUMN problem_assistance_requested TEXT,
ADD COLUMN tier_1_date DATE,
ADD COLUMN tier_2_date DATE,
ADD COLUMN tier_3_date DATE,
ADD COLUMN problem_resolved BOOLEAN,
ADD COLUMN contractor_comments TEXT;

-- Update status enum to include new statuses
ALTER TABLE fmr_requests DROP CONSTRAINT fmr_requests_status_check;
ALTER TABLE fmr_requests ADD CONSTRAINT fmr_requests_status_check 
  CHECK (status IN ('draft', 'submitted', 'unresolved', 'in-progress', 'resolved', 'archived'));

-- Update default status
ALTER TABLE fmr_requests ALTER COLUMN status SET DEFAULT 'draft';