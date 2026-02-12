-- Insertar usuario administrador (equipo Smart Spaces)
-- Email: admin@smartspaces.com
-- Password: admin123
INSERT OR IGNORE INTO users (id, email, password, name, role) VALUES 
  (1, 'admin@smartspaces.com', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'Smart Spaces Admin', 'admin');

-- Insertar usuarios clientes de ejemplo
-- Emails: cliente1@example.com, cliente2@example.com
-- Password para ambos: cliente123
INSERT OR IGNORE INTO users (id, email, password, name, role) VALUES 
  (2, 'cliente1@example.com', '09a31a7001e261ab1e056182a71d3cf57f582ca9a29cff5eb83be0f0549730a9', 'Juan Pérez', 'client'),
  (3, 'cliente2@example.com', '09a31a7001e261ab1e056182a71d3cf57f582ca9a29cff5eb83be0f0549730a9', 'María García', 'client');

-- Insertar residencias
INSERT OR IGNORE INTO residences (id, name, address, image, status) VALUES 
  ('H-001', 'Residencial Valle Real', 'Av. Paseo de las Lomas #450, Zapopan, Jal.', 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80&w=1200', 'Operational'),
  ('H-002', 'Villa Montana', 'Sierra Nevada #102, Monterrey, NL.', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200', 'Maintenance'),
  ('H-003', 'Penthouse Reforma', 'Paseo de la Reforma #2500, CDMX.', 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1200', 'Operational');

-- Asignar residencias a clientes
-- Juan Pérez tiene acceso a H-001
-- María García tiene acceso a H-002
INSERT OR IGNORE INTO user_residences (user_id, residence_id) VALUES 
  (2, 'H-001'),
  (3, 'H-002');

-- Insertar sistemas
INSERT OR IGNORE INTO systems (id, name, icon) VALUES 
  ('lighting', 'Lighting', 'Lightbulb'),
  ('audio-video', 'Media', 'Music'),
  ('network', 'Network', 'Wifi'),
  ('cctv', 'Security', 'Cctv'),
  ('access', 'Entry', 'DoorOpen'),
  ('shades', 'Shades', 'Wind'),
  ('automation', 'Logic', 'Cpu');

-- Insertar dispositivos en H-001 (Residencial Valle Real)
INSERT OR IGNORE INTO devices (residence_id, system_id, name, brand, model, serial, ip, mac, firmware, username, password, status) VALUES 
  ('H-001', 'network', 'Router Principal', 'Ubiquiti', 'Dream Machine Pro', 'UI-882910', '192.168.1.1', '00:15:5D:01:22:AF', 'v3.1.16', 'admin', 'Network2024!', 'Online'),
  ('H-001', 'cctv', 'NVR Grabador', 'Hikvision', 'DS-7608NI-I2', 'HK-990021', '192.168.1.50', 'BC:FB:E4:88:99:00', 'V4.61.025', 'admin', 'Cctv_9988', 'Online'),
  ('H-001', 'lighting', 'Control Lutron Main', 'Lutron', 'Caseta Smart Bridge', 'LT-445612', '192.168.1.20', 'D0:73:D5:12:34:56', 'v2.8.3', 'lutron', 'Light2024', 'Online'),
  ('H-001', 'audio-video', 'Sonos Beam', 'Sonos', 'Beam Gen 2', 'SN-223344', '192.168.1.40', 'A4:77:33:11:22:33', 'v14.12', 'sonos', 'Audio123', 'Online');

-- Insertar dispositivos en H-002 (Villa Montana)
INSERT OR IGNORE INTO devices (residence_id, system_id, name, brand, model, serial, ip, mac, firmware, username, password, status) VALUES 
  ('H-002', 'network', 'Switch Principal', 'Ubiquiti', 'USW-Pro-24', 'UI-772341', '192.168.2.1', '00:15:5D:02:33:BF', 'v6.2.13', 'admin', 'Switch_Pass99', 'Online'),
  ('H-002', 'cctv', 'Cámara Entrada', 'Hikvision', 'DS-2CD2185FWD', 'HK-881234', '192.168.2.101', 'BC:FB:E4:77:88:11', 'V5.7.3', 'admin', 'Cam_2024!', 'Maintenance'),
  ('H-002', 'shades', 'Control Cortinas', 'Lutron', 'Serena Shades', 'LT-667788', '192.168.2.30', 'D0:73:D5:44:55:66', 'v3.2.1', 'lutron', 'Shades_Pass', 'Online');

-- Insertar dispositivos en H-003 (Penthouse Reforma)
INSERT OR IGNORE INTO devices (residence_id, system_id, name, brand, model, serial, ip, mac, firmware, username, password, status) VALUES 
  ('H-003', 'network', 'Router Mesh', 'Ubiquiti', 'AmpliFi HD', 'UI-334455', '192.168.3.1', '00:15:5D:03:44:CF', 'v3.7.1', 'admin', 'Mesh_Secure!', 'Online'),
  ('H-003', 'audio-video', 'Receiver AV', 'Denon', 'AVR-X4700H', 'DN-998877', '192.168.3.30', 'F4:4E:E3:11:22:33', 'v1.6.0', 'denon', 'Audio_Pass', 'Online'),
  ('H-003', 'access', 'Cerradura Smart', 'Yale', 'Assure Lock SL', 'YL-445566', '192.168.3.50', 'E8:44:11:22:33:44', 'v2.1.0', 'yale', 'Lock_Secure', 'Online');

-- Insertar eventos de ejemplo
INSERT OR IGNORE INTO events (residence_id, device_id, user_id, event_type, description) VALUES 
  ('H-001', 1, 1, 'device_added', 'Router Principal agregado al sistema'),
  ('H-001', 2, 1, 'device_added', 'NVR Grabador agregado al sistema'),
  ('H-001', 3, 1, 'device_added', 'Control Lutron Main agregado al sistema'),
  ('H-002', 6, 1, 'maintenance_started', 'Mantenimiento iniciado en Cámara Entrada'),
  ('H-002', 5, 1, 'device_added', 'Switch Principal agregado al sistema'),
  ('H-003', 8, 1, 'device_added', 'Router Mesh agregado al sistema'),
  ('H-003', 9, 1, 'device_added', 'Receiver AV agregado al sistema');

-- Actualizar estados de suscripción
UPDATE residences SET subscription_status = 'active', subscription_expires_at = datetime('now', '+1 year') WHERE id = 'H-001';
UPDATE residences SET subscription_status = 'active', subscription_expires_at = datetime('now', '+6 months') WHERE id = 'H-002';
UPDATE residences SET subscription_status = 'inactive', subscription_expires_at = datetime('now', '-1 month') WHERE id = 'H-003';

-- Insertar tickets de soporte de ejemplo
INSERT OR IGNORE INTO support_tickets (id, residence_id, user_id, title, description, priority, status, category, assigned_to) VALUES 
  (1, 'H-001', 2, 'Router perdiendo conexión intermitente', 'El router principal presenta desconexiones cada 2-3 horas. Afecta toda la red de la residencia.', 'high', 'open', 'Network', 1),
  (2, 'H-001', 2, 'Cámara de entrada con imagen borrosa', 'La cámara principal muestra imagen desenfocada desde hace 2 días.', 'medium', 'in_progress', 'Security', 1),
  (3, 'H-002', 3, 'Actualización de firmware requerida', 'Solicito actualización del sistema de cortinas Lutron a última versión.', 'low', 'resolved', 'Automation', 1),
  (4, 'H-001', 2, 'Configurar acceso remoto VPN', 'Necesito acceso remoto para monitorear cámaras cuando estoy de viaje.', 'medium', 'open', 'Network', NULL);

-- Insertar respuestas a tickets
INSERT OR IGNORE INTO ticket_responses (ticket_id, user_id, message, is_internal) VALUES 
  (1, 1, 'Hemos identificado el problema. El router necesita actualización de firmware. Programaremos visita técnica.', 0),
  (2, 1, 'Técnico en camino. Revisaremos limpieza de lente y configuración de enfoque.', 0),
  (2, 2, 'Perfecto, estaré disponible mañana por la tarde.', 0),
  (3, 1, 'Actualización completada exitosamente. Sistema funcionando correctamente.', 0),
  (3, 3, 'Excelente servicio, gracias!', 0);
