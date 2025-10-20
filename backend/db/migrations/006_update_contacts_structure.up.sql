ALTER TABLE contacts
  ADD COLUMN title TEXT,
  ADD COLUMN sequence_number INTEGER,
  ADD COLUMN first_name TEXT,
  ADD COLUMN last_name TEXT,
  ADD COLUMN mobile_number TEXT,
  ADD COLUMN work_number TEXT;

UPDATE contacts SET 
  first_name = name,
  mobile_number = phone;

ALTER TABLE contacts DROP COLUMN name;
ALTER TABLE contacts DROP COLUMN phone;

CREATE INDEX idx_contacts_last_name ON contacts(last_name);
CREATE INDEX idx_contacts_sequence_number ON contacts(sequence_number);
