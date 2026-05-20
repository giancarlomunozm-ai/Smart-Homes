-- Fase 1: Cotizaciones, ventas e histórico de servicio

ALTER TABLE residences ADD COLUMN project_type TEXT NOT NULL DEFAULT 'house' CHECK(project_type IN ('house', 'restaurant', 'hotel', 'commercial', 'other'));
ALTER TABLE residences ADD COLUMN client_name TEXT;
ALTER TABLE residences ADD COLUMN client_company TEXT;
ALTER TABLE residences ADD COLUMN billing_email TEXT;
ALTER TABLE residences ADD COLUMN billing_phone TEXT;
ALTER TABLE residences ADD COLUMN preferred_language TEXT NOT NULL DEFAULT 'es' CHECK(preferred_language IN ('es', 'en'));
ALTER TABLE residences ADD COLUMN default_tax_rate REAL NOT NULL DEFAULT 0.16;
ALTER TABLE residences ADD COLUMN service_hour_rate_first REAL NOT NULL DEFAULT 150;
ALTER TABLE residences ADD COLUMN service_hour_rate_extra REAL NOT NULL DEFAULT 95;

CREATE TABLE IF NOT EXISTS quotes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id TEXT NOT NULL,
  quote_number TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft', 'sent', 'viewed', 'signed', 'paid', 'expired', 'cancelled')),
  language_default TEXT NOT NULL DEFAULT 'es' CHECK(language_default IN ('es', 'en')),
  currency TEXT NOT NULL DEFAULT 'USD',
  subtotal REAL NOT NULL DEFAULT 0,
  tax_rate REAL NOT NULL DEFAULT 0.16,
  tax_amount REAL NOT NULL DEFAULT 0,
  total REAL NOT NULL DEFAULT 0,
  first_hour_rate REAL NOT NULL DEFAULT 150,
  extra_hour_rate REAL NOT NULL DEFAULT 95,
  estimated_hours_first REAL NOT NULL DEFAULT 1,
  estimated_hours_extra REAL NOT NULL DEFAULT 0,
  client_name TEXT,
  client_email TEXT,
  public_token TEXT UNIQUE NOT NULL,
  public_expires_at DATETIME,
  signed_at DATETIME,
  paid_at DATETIME,
  stripe_payment_link TEXT,
  stripe_session_id TEXT,
  signature_name TEXT,
  signature_ip TEXT,
  signature_user_agent TEXT,
  notes_internal TEXT,
  notes_client_es TEXT,
  notes_client_en TEXT,
  created_by INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES residences(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS quote_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  quote_id INTEGER NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  item_type TEXT NOT NULL DEFAULT 'service' CHECK(item_type IN ('service', 'product', 'accessory', 'custom')),
  title_es TEXT NOT NULL,
  title_en TEXT,
  description_es TEXT,
  description_en TEXT,
  quantity REAL NOT NULL DEFAULT 1,
  unit TEXT NOT NULL DEFAULT 'unit',
  unit_price REAL NOT NULL DEFAULT 0,
  taxable BOOLEAN NOT NULL DEFAULT 1,
  line_total REAL NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS quote_views (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  quote_id INTEGER NOT NULL,
  language TEXT NOT NULL DEFAULT 'es' CHECK(language IN ('es', 'en')),
  ip TEXT,
  user_agent TEXT,
  viewed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS quote_signatures (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  quote_id INTEGER NOT NULL,
  signer_name TEXT NOT NULL,
  signer_email TEXT,
  signature_data TEXT,
  ip TEXT,
  user_agent TEXT,
  signed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS sales_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  quote_id INTEGER,
  project_id TEXT NOT NULL,
  client_name TEXT,
  stage TEXT NOT NULL DEFAULT 'quoted' CHECK(stage IN ('lead', 'quoted', 'signed', 'paid', 'scheduled', 'completed', 'lost')),
  expected_value REAL NOT NULL DEFAULT 0,
  closed_value REAL,
  source TEXT,
  owner_user_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE SET NULL,
  FOREIGN KEY (project_id) REFERENCES residences(id) ON DELETE CASCADE,
  FOREIGN KEY (owner_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS service_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id TEXT NOT NULL,
  quote_id INTEGER,
  event_type TEXT NOT NULL,
  description TEXT NOT NULL,
  metadata TEXT,
  created_by INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES residences(id) ON DELETE CASCADE,
  FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS service_pricing_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  scope TEXT NOT NULL DEFAULT 'global' CHECK(scope IN ('global', 'project')),
  project_id TEXT,
  currency TEXT NOT NULL DEFAULT 'USD',
  first_hour_rate REAL NOT NULL DEFAULT 150,
  extra_hour_rate REAL NOT NULL DEFAULT 95,
  tax_rate REAL NOT NULL DEFAULT 0.16,
  updated_by INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES residences(id) ON DELETE CASCADE,
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

INSERT INTO service_pricing_settings (scope, currency, first_hour_rate, extra_hour_rate, tax_rate)
SELECT 'global', 'USD', 150, 95, 0.16
WHERE NOT EXISTS (
  SELECT 1 FROM service_pricing_settings WHERE scope = 'global' AND project_id IS NULL
);

CREATE INDEX IF NOT EXISTS idx_quotes_project ON quotes(project_id);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
CREATE INDEX IF NOT EXISTS idx_quotes_public_token ON quotes(public_token);
CREATE INDEX IF NOT EXISTS idx_quote_items_quote ON quote_items(quote_id);
CREATE INDEX IF NOT EXISTS idx_quote_views_quote ON quote_views(quote_id);
CREATE INDEX IF NOT EXISTS idx_quote_signatures_quote ON quote_signatures(quote_id);
CREATE INDEX IF NOT EXISTS idx_sales_project ON sales_records(project_id);
CREATE INDEX IF NOT EXISTS idx_sales_stage ON sales_records(stage);
CREATE INDEX IF NOT EXISTS idx_service_logs_project ON service_logs(project_id);
CREATE INDEX IF NOT EXISTS idx_service_logs_quote ON service_logs(quote_id);
CREATE INDEX IF NOT EXISTS idx_service_pricing_scope ON service_pricing_settings(scope, project_id);
