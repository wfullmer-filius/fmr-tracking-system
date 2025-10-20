CREATE TABLE filter_presets (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  filters JSONB NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_filter_presets_name ON filter_presets(name);