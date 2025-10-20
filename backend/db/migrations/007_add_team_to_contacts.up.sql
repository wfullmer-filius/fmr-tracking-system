ALTER TABLE contacts ADD COLUMN team TEXT NOT NULL DEFAULT 'The Filius Team';

CREATE INDEX idx_contacts_team ON contacts(team);
