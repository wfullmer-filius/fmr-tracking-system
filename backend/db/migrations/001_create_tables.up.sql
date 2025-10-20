-- Create contacts table
CREATE TABLE contacts (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  organization TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create FMR requests table
CREATE TABLE fmr_requests (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'unresolved' CHECK (status IN ('unresolved', 'in-progress', 'resolved', 'archived')),
  creation_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolution_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notes table
CREATE TABLE notes (
  id BIGSERIAL PRIMARY KEY,
  fmr_id BIGINT NOT NULL REFERENCES fmr_requests(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  author TEXT,
  note_type TEXT DEFAULT 'general' CHECK (note_type IN ('general', 'technician', 'customer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create attachments table
CREATE TABLE attachments (
  id BIGSERIAL PRIMARY KEY,
  fmr_id BIGINT NOT NULL REFERENCES fmr_requests(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_fmr_requests_status ON fmr_requests(status);
CREATE INDEX idx_fmr_requests_creation_date ON fmr_requests(creation_date);
CREATE INDEX idx_notes_fmr_id ON notes(fmr_id);
CREATE INDEX idx_attachments_fmr_id ON attachments(fmr_id);
CREATE INDEX idx_contacts_name ON contacts(name);
CREATE INDEX idx_contacts_organization ON contacts(organization);
