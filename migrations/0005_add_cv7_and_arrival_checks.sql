-- Agregar campos a tabla residences
ALTER TABLE residences ADD COLUMN development TEXT;
ALTER TABLE residences ADD COLUMN property_manager TEXT;
ALTER TABLE residences ADD COLUMN owner_name TEXT;

-- Tabla para Arrival Checks
CREATE TABLE IF NOT EXISTS arrival_checks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  residence_id TEXT NOT NULL,
  ticket_id INTEGER,
  scheduled_date DATETIME NOT NULL,
  scheduled_time TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  performed_by INTEGER,
  started_at DATETIME,
  completed_at DATETIME,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (residence_id) REFERENCES residences(id) ON DELETE CASCADE,
  FOREIGN KEY (performed_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Tabla para items del checklist de Arrival Check
CREATE TABLE IF NOT EXISTS arrival_check_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  arrival_check_id INTEGER NOT NULL,
  room TEXT NOT NULL,
  system TEXT NOT NULL,
  item_name TEXT NOT NULL,
  brand TEXT,
  model TEXT,
  quantity INTEGER DEFAULT 1,
  installed BOOLEAN DEFAULT 0,
  functional BOOLEAN DEFAULT 0,
  notes TEXT,
  checked_at DATETIME,
  checked_by INTEGER,
  FOREIGN KEY (arrival_check_id) REFERENCES arrival_checks(id) ON DELETE CASCADE,
  FOREIGN KEY (checked_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Índices para optimización
CREATE INDEX IF NOT EXISTS idx_arrival_checks_residence ON arrival_checks(residence_id);
CREATE INDEX IF NOT EXISTS idx_arrival_checks_status ON arrival_checks(status);
CREATE INDEX IF NOT EXISTS idx_arrival_checks_scheduled ON arrival_checks(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_arrival_check_items_check ON arrival_check_items(arrival_check_id);
CREATE INDEX IF NOT EXISTS idx_arrival_check_items_room ON arrival_check_items(room);
