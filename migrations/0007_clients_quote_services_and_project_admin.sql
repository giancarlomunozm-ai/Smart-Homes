-- Fase 2: clientes reutilizables, catalogo de servicios y relacion con tickets

CREATE TABLE IF NOT EXISTS clients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  display_name TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  company_name TEXT,
  email TEXT,
  phone TEXT,
  billing_email TEXT,
  billing_phone TEXT,
  preferred_language TEXT DEFAULT 'es' CHECK(preferred_language IN ('es', 'en')),
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS project_clients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id TEXT NOT NULL,
  client_id INTEGER NOT NULL,
  relationship TEXT NOT NULL DEFAULT 'owner' CHECK(relationship IN ('owner', 'billing', 'property_manager', 'occupant', 'other')),
  is_primary BOOLEAN NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES residences(id) ON DELETE CASCADE,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
  UNIQUE(project_id, client_id, relationship)
);

CREATE TABLE IF NOT EXISTS service_catalog (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE NOT NULL,
  name_es TEXT NOT NULL,
  name_en TEXT,
  description_es TEXT,
  description_en TEXT,
  item_type TEXT NOT NULL DEFAULT 'service' CHECK(item_type IN ('service', 'product', 'accessory', 'custom')),
  unit TEXT NOT NULL DEFAULT 'hour',
  default_quantity REAL NOT NULL DEFAULT 1,
  default_unit_price REAL NOT NULL DEFAULT 0,
  taxable BOOLEAN NOT NULL DEFAULT 1,
  active BOOLEAN NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE quotes ADD COLUMN client_id INTEGER REFERENCES clients(id) ON DELETE SET NULL;
ALTER TABLE quotes ADD COLUMN ticket_id INTEGER REFERENCES support_tickets(id) ON DELETE SET NULL;
ALTER TABLE quote_items ADD COLUMN service_catalog_id INTEGER REFERENCES service_catalog(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_clients_name ON clients(display_name);
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_project_clients_project ON project_clients(project_id);
CREATE INDEX IF NOT EXISTS idx_project_clients_client ON project_clients(client_id);
CREATE INDEX IF NOT EXISTS idx_project_clients_primary ON project_clients(project_id, is_primary);
CREATE INDEX IF NOT EXISTS idx_quotes_client ON quotes(client_id);
CREATE INDEX IF NOT EXISTS idx_quotes_ticket ON quotes(ticket_id);
CREATE INDEX IF NOT EXISTS idx_quote_items_catalog ON quote_items(service_catalog_id);
CREATE INDEX IF NOT EXISTS idx_service_catalog_active ON service_catalog(active, sort_order);

INSERT INTO clients (display_name, company_name, email, phone, billing_email, billing_phone, preferred_language)
SELECT owner_name, NULL, billing_email, billing_phone, billing_email, billing_phone, COALESCE(preferred_language, 'es')
FROM residences
WHERE owner_name IS NOT NULL
  AND TRIM(owner_name) <> ''
  AND NOT EXISTS (
    SELECT 1 FROM clients WHERE LOWER(clients.display_name) = LOWER(residences.owner_name)
  );

INSERT OR IGNORE INTO project_clients (project_id, client_id, relationship, is_primary)
SELECT r.id, c.id, 'owner', 1
FROM residences r
JOIN clients c ON LOWER(c.display_name) = LOWER(r.owner_name)
WHERE r.owner_name IS NOT NULL AND TRIM(r.owner_name) <> '';

INSERT OR IGNORE INTO service_catalog (code, name_es, name_en, description_es, description_en, item_type, unit, default_quantity, default_unit_price, taxable, sort_order)
VALUES
  ('FIRST_HOUR_ONSITE', 'Primera hora de servicio en sitio', 'First on-site service hour', 'Diagnostico, llegada y primera hora de servicio tecnico en sitio.', 'Arrival, diagnosis and first on-site technical service hour.', 'service', 'hour', 1, 150, 1, 10),
  ('ADDITIONAL_HOUR_ONSITE', 'Hora adicional de servicio en sitio', 'Additional on-site service hour', 'Hora adicional posterior a la primera hora de servicio.', 'Additional hour after the first service hour.', 'service', 'hour', 1, 95, 1, 20),
  ('ARRIVAL_CHECK', 'Arrival check', 'Arrival check', 'Revision general de llegada, estado operativo y puntos criticos del proyecto.', 'General arrival inspection, operational status and critical project points.', 'service', 'service', 1, 150, 1, 30),
  ('REMOTE_SUPPORT', 'Soporte remoto', 'Remote support', 'Revision remota, ajustes menores y seguimiento tecnico.', 'Remote review, minor adjustments and technical follow-up.', 'service', 'hour', 1, 75, 1, 40),
  ('PREVENTIVE_MAINTENANCE', 'Mantenimiento preventivo', 'Preventive maintenance', 'Revision preventiva de sistemas, conexiones, firmware y operacion.', 'Preventive review of systems, connections, firmware and operation.', 'service', 'service', 1, 250, 1, 50);
