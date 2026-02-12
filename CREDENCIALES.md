# 🔑 Credenciales de Acceso - Smart Spaces Infrastructure OS

## 🌐 URL de la Aplicación

**Aplicación Web**: https://smart-homes.pages.dev ✅ **ONLINE Y FUNCIONAL**

---

## 👥 Usuarios del Sistema

### 🛡️ ADMINISTRADOR (Equipo Smart Spaces)

**Email**: `admin@smartspaces.com`  
**Contraseña**: `admin123`

**Capacidades**:
- ✅ Ver TODAS las residencias del portfolio
- ✅ Gestionar dispositivos (crear, editar, eliminar)
- ✅ Asignar residencias a clientes
- ✅ Ver eventos globales del sistema
- ✅ Acceso completo sin restricciones

---

### 👤 CLIENTE 1 - Juan Pérez

**Email**: `cliente1@example.com`  
**Contraseña**: `cliente123`

**Acceso asignado**:
- 🏠 **H-001**: Residencial Valle Real
  - Ubicación: Av. Paseo de las Lomas #450, Zapopan, Jal.
  - Dispositivos: 4 unidades activas
  - Sistemas: Network, CCTV, Lighting, Media

**Restricciones**:
- ❌ Solo puede ver SU residencia asignada
- ❌ No puede modificar dispositivos
- ❌ Solo lectura de información

---

### 👤 CLIENTE 2 - María García

**Email**: `cliente2@example.com`  
**Contraseña**: `cliente123`

**Acceso asignado**:
- 🏠 **H-002**: Villa Montana
  - Ubicación: Sierra Nevada #102, Monterrey, NL.
  - Dispositivos: 3 unidades (1 en mantenimiento)
  - Sistemas: Network, CCTV, Shades

**Restricciones**:
- ❌ Solo puede ver SU residencia asignada
- ❌ No puede modificar dispositivos
- ❌ Solo lectura de información

---

## 🏢 Residencias en el Sistema

### H-001: Residencial Valle Real
- **Status**: ✅ Operational
- **Cliente**: Juan Pérez
- **Dispositivos**: 4
  - Router Principal (Ubiquiti)
  - NVR Grabador (Hikvision)
  - Control Lutron Main
  - Sonos Beam

### H-002: Villa Montana
- **Status**: ⚠️ Maintenance
- **Cliente**: María García
- **Dispositivos**: 3
  - Switch Principal (Ubiquiti)
  - Cámara Entrada (Hikvision) - En mantenimiento
  - Control Cortinas (Lutron)

### H-003: Penthouse Reforma
- **Status**: ✅ Operational
- **Cliente**: Sin asignar (solo admin puede ver)
- **Dispositivos**: 3
  - Router Mesh (Ubiquiti)
  - Receiver AV (Denon)
  - Cerradura Smart (Yale)

---

## 🧪 Cómo Probar el Sistema

### Test 1: Login como Administrador
1. Acceder a la URL
2. Usar: `admin@smartspaces.com` / `admin123`
3. Verificar que se muestran las 3 residencias
4. Entrar a cualquier residencia
5. Ver todos los sistemas y dispositivos

### Test 2: Login como Cliente 1
1. Acceder a la URL
2. Usar: `cliente1@example.com` / `cliente123`
3. Verificar que SOLO se muestra H-001
4. Entrar a la residencia
5. Ver dispositivos pero sin opciones de edición

### Test 3: Login como Cliente 2
1. Acceder a la URL
2. Usar: `cliente2@example.com` / `cliente123`
3. Verificar que SOLO se muestra H-002
4. Ver dispositivo en estado "Maintenance"

### Test 4: Ver Detalles de Dispositivo
1. Login como admin o cliente
2. Entrar a una residencia
3. Click en cualquier sistema (ej: Network)
4. Click en un dispositivo
5. Verificar panel lateral con:
   - IP Address
   - MAC Address
   - Firmware
   - Usuario/Contraseña (con botón para mostrar/ocultar)

---

## 🔐 Seguridad

- ✅ Tokens JWT con expiración de 24 horas
- ✅ Contraseñas hasheadas (SHA-256)
- ✅ Control de acceso por roles
- ✅ Validación de permisos en cada endpoint
- ✅ Aislamiento de datos por usuario

---

## 📞 Soporte

Para cualquier problema o consulta sobre el sistema, contactar al equipo de desarrollo.

**Última actualización**: 2026-02-12
