-- Agregar campo de suscripción a residencias
ALTER TABLE residences ADD COLUMN subscription_status TEXT NOT NULL DEFAULT 'active' CHECK(subscription_status IN ('active', 'inactive', 'suspended'));
ALTER TABLE residences ADD COLUMN subscription_expires_at DATETIME;

-- Tabla de tickets de soporte
CREATE TABLE IF NOT EXISTS support_tickets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  residence_id TEXT NOT NULL,
  user_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT NOT NULL CHECK(priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT NOT NULL CHECK(status IN ('open', 'in_progress', 'resolved', 'closed')),
  category TEXT NOT NULL,
  assigned_to INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  resolved_at DATETIME,
  FOREIGN KEY (residence_id) REFERENCES residences(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
);

-- Tabla de respuestas a tickets
CREATE TABLE IF NOT EXISTS ticket_responses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ticket_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  message TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ticket_id) REFERENCES support_tickets(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Índices para tickets
CREATE INDEX IF NOT EXISTS idx_tickets_residence ON support_tickets(residence_id);
CREATE INDEX IF NOT EXISTS idx_tickets_user ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_created ON support_tickets(created_at);
CREATE INDEX IF NOT EXISTS idx_ticket_responses_ticket ON ticket_responses(ticket_id);
