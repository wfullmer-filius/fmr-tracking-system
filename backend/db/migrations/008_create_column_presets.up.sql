CREATE TABLE column_presets (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  columns TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_column_presets_is_default ON column_presets(is_default);
