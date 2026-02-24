-- Tabla de invitaciones de usuarios
CREATE TABLE IF NOT EXISTS user_invitations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  token TEXT UNIQUE NOT NULL,
  invited_by INTEGER NOT NULL,
  role TEXT NOT NULL DEFAULT 'client' CHECK(role IN ('admin', 'client')),
  residences TEXT, -- JSON array de residence IDs
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'accepted', 'expired')),
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  accepted_at DATETIME,
  FOREIGN KEY (invited_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Índice para búsqueda rápida por token
CREATE INDEX IF NOT EXISTS idx_invitations_token ON user_invitations(token);

-- Índice para búsqueda por email
CREATE INDEX IF NOT EXISTS idx_invitations_email ON user_invitations(email);

-- Índice para limpieza de invitaciones expiradas
CREATE INDEX IF NOT EXISTS idx_invitations_expires ON user_invitations(expires_at);
