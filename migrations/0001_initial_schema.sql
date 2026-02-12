-- Tabla de usuarios (equipo Smart Spaces y usuarios finales)
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('admin', 'client')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de residencias
CREATE TABLE IF NOT EXISTS residences (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  image TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('Operational', 'Maintenance', 'Offline')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de asignación de residencias a usuarios (clientes)
CREATE TABLE IF NOT EXISTS user_residences (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  residence_id TEXT NOT NULL,
  assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (residence_id) REFERENCES residences(id) ON DELETE CASCADE,
  UNIQUE(user_id, residence_id)
);

-- Tabla de sistemas
CREATE TABLE IF NOT EXISTS systems (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT NOT NULL
);

-- Tabla de dispositivos
CREATE TABLE IF NOT EXISTS devices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  residence_id TEXT NOT NULL,
  system_id TEXT NOT NULL,
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  serial TEXT NOT NULL,
  ip TEXT NOT NULL,
  mac TEXT NOT NULL,
  firmware TEXT NOT NULL,
  username TEXT NOT NULL,
  password TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('Online', 'Offline', 'Maintenance')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (residence_id) REFERENCES residences(id) ON DELETE CASCADE,
  FOREIGN KEY (system_id) REFERENCES systems(id) ON DELETE CASCADE
);

-- Tabla de historial de eventos
CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  residence_id TEXT NOT NULL,
  device_id INTEGER,
  user_id INTEGER,
  event_type TEXT NOT NULL,
  description TEXT NOT NULL,
  metadata TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (residence_id) REFERENCES residences(id) ON DELETE CASCADE,
  FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE SET NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_residences_status ON residences(status);
CREATE INDEX IF NOT EXISTS idx_user_residences_user ON user_residences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_residences_residence ON user_residences(residence_id);
CREATE INDEX IF NOT EXISTS idx_devices_residence ON devices(residence_id);
CREATE INDEX IF NOT EXISTS idx_devices_system ON devices(system_id);
CREATE INDEX IF NOT EXISTS idx_devices_status ON devices(status);
CREATE INDEX IF NOT EXISTS idx_events_residence ON events(residence_id);
CREATE INDEX IF NOT EXISTS idx_events_created ON events(created_at);
