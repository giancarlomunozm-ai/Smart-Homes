-- Tabla de documentos/archivos por residencia
CREATE TABLE IF NOT EXISTS residence_files (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  residence_id TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL, -- pdf, image, document
  file_category TEXT NOT NULL, -- topology, contract, delivery, manual, other
  file_url TEXT NOT NULL,
  file_size INTEGER, -- en bytes
  mime_type TEXT,
  description TEXT,
  uploaded_by INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (residence_id) REFERENCES residences(id) ON DELETE CASCADE,
  FOREIGN KEY (uploaded_by) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_residence_files_residence ON residence_files(residence_id);
CREATE INDEX IF NOT EXISTS idx_residence_files_category ON residence_files(file_category);
