# Smart Spaces - Infrastructure OS

Sistema de gestión inteligente de residencias con control de acceso multinivel para equipos técnicos y propietarios.

## 🔗 URLs de Acceso

- **Aplicación Local**: https://3000-i8qh3aowtsi1cskm7t6pw-ad490db5.sandbox.novita.ai
- **API Health Check**: https://3000-i8qh3aowtsi1cskm7t6pw-ad490db5.sandbox.novita.ai/api/health

## 🔑 Credenciales de Acceso

### Usuario Administrador (Equipo Smart Spaces)
- **Email**: `admin@smartspaces.com`
- **Contraseña**: `admin123`
- **Permisos**: Acceso total a todas las residencias, gestión de dispositivos, creación de usuarios

### Usuarios Clientes (Propietarios)

**Cliente 1 - Juan Pérez**
- **Email**: `cliente1@example.com`
- **Contraseña**: `cliente123`
- **Acceso**: Solo residencia H-001 (Residencial Valle Real)

**Cliente 2 - María García**
- **Email**: `cliente2@example.com`
- **Contraseña**: `cliente123`
- **Acceso**: Solo residencia H-002 (Villa Montana)

## 📋 Características Implementadas

### ✅ Sistema de Autenticación Completo
- Login con JWT (Web Crypto API)
- Dos niveles de acceso: Admin y Cliente
- Tokens con expiración de 24 horas
- Verificación automática de sesión

### ✅ Panel de Administración (Admin)
- **Vista de todas las residencias**: Acceso completo al portfolio
- **Gestión de dispositivos**: CRUD completo de equipos
- **Asignación de accesos**: Vincular residencias a clientes
- **Monitoreo global**: Ver estados y eventos de todo el sistema

### ✅ Panel de Cliente (Propietarios)
- **Vista limitada**: Solo residencias asignadas
- **Consulta de dispositivos**: Ver equipos de sus propiedades
- **Información de acceso**: Credenciales de red y sistemas
- **Sin permisos de modificación**: Solo lectura

### ✅ Gestión de Residencias
- 3 residencias de ejemplo precargadas
- Estados: Operational, Maintenance, Offline
- Asignación flexible usuario-residencia

### ✅ Sistemas y Dispositivos
- **7 categorías de sistemas**:
  - Lighting (Iluminación)
  - Media (Audio/Video)
  - Network (Redes)
  - Security (Seguridad/CCTV)
  - Entry (Control de Acceso)
  - Shades (Cortinas/Persianas)
  - Logic (Automatización)

- **11 dispositivos de ejemplo** distribuidos en 3 residencias:
  - Routers Ubiquiti
  - Sistemas CCTV Hikvision
  - Controles Lutron
  - Equipos Sonos y Denon

### ✅ Base de Datos D1 (SQLite)
- Esquema completo con relaciones
- Migraciones versionadas
- Datos de seed para desarrollo
- Índices optimizados

### ✅ API REST Completa
```
POST   /api/auth/login         - Iniciar sesión
GET    /api/auth/verify        - Verificar token

GET    /api/residences         - Listar residencias (según permisos)
GET    /api/residences/:id     - Detalle de residencia
POST   /api/residences         - Crear residencia (admin)
PUT    /api/residences/:id     - Actualizar residencia (admin)
DELETE /api/residences/:id     - Eliminar residencia (admin)

GET    /api/devices/residence/:id  - Dispositivos de una residencia
GET    /api/devices/:id            - Detalle de dispositivo
POST   /api/devices                - Crear dispositivo (admin)
PUT    /api/devices/:id            - Actualizar dispositivo (admin)
DELETE /api/devices/:id            - Eliminar dispositivo (admin)

GET    /api/systems            - Listar todos los sistemas
GET    /api/systems/:id/stats  - Estadísticas de un sistema

GET    /api/events/residence/:id  - Eventos de una residencia
GET    /api/events                - Eventos globales (admin)
```

## 🏗️ Arquitectura Técnica

### Backend
- **Framework**: Hono (edge-optimized)
- **Runtime**: Cloudflare Workers
- **Base de datos**: Cloudflare D1 (SQLite)
- **Autenticación**: JWT con Web Crypto API
- **Hashing**: SHA-256 para contraseñas

### Frontend
- **Biblioteca**: React 18 (UMD)
- **Estilos**: TailwindCSS vía CDN
- **Estado**: React Hooks + Context API
- **Transpilación**: Babel Standalone

### Deployment
- **Plataforma**: Cloudflare Pages
- **Build Tool**: Vite
- **Process Manager**: PM2 (desarrollo local)

## 📁 Estructura del Proyecto

```
webapp/
├── src/
│   ├── index.tsx              # Aplicación principal Hono
│   ├── routes/
│   │   ├── auth.ts            # Rutas de autenticación
│   │   ├── residences.ts      # Gestión de residencias
│   │   ├── devices.ts         # Gestión de dispositivos
│   │   ├── systems.ts         # Consulta de sistemas
│   │   └── events.ts          # Historial de eventos
│   ├── middleware/
│   │   └── auth.ts            # Middleware de autenticación
│   └── utils/
│       ├── jwt.ts             # Utilidades JWT
│       └── password.ts        # Hashing de contraseñas
├── public/
│   └── app.js                 # Aplicación React completa
├── migrations/
│   └── 0001_initial_schema.sql  # Esquema de base de datos
├── seed.sql                   # Datos de ejemplo
├── wrangler.jsonc            # Configuración Cloudflare
├── ecosystem.config.cjs      # Configuración PM2
├── package.json              # Dependencias
└── README.md                 # Este archivo
```

## 🗄️ Modelo de Datos

### Tablas Principales
- **users**: Usuarios (admin/client)
- **residences**: Propiedades inmobiliarias
- **user_residences**: Asignación usuario-residencia
- **systems**: Categorías de sistemas
- **devices**: Dispositivos IoT/Smart Home
- **events**: Historial de actividad

### Relaciones
- Un usuario puede tener múltiples residencias asignadas
- Una residencia puede tener múltiples dispositivos
- Un dispositivo pertenece a un sistema y una residencia
- Los eventos se registran por residencia y dispositivo

## 🚀 Comandos Disponibles

```bash
# Desarrollo
npm run dev              # Servidor Vite local
npm run dev:sandbox      # Wrangler Pages dev en 0.0.0.0:3000

# Build y Deploy
npm run build            # Construir proyecto
npm run preview          # Preview local
npm run deploy           # Deploy a Cloudflare Pages

# Base de datos
npm run db:migrate:local # Aplicar migraciones (local)
npm run db:migrate:prod  # Aplicar migraciones (producción)
npm run db:seed          # Cargar datos de ejemplo
npm run db:reset         # Resetear BD completa

# PM2 (Desarrollo local)
pm2 start ecosystem.config.cjs  # Iniciar
pm2 restart webapp              # Reiniciar
pm2 stop webapp                 # Detener
pm2 logs webapp --nostream      # Ver logs
pm2 delete webapp               # Eliminar
```

## 🔐 Seguridad Implementada

1. **Autenticación JWT**: Tokens seguros con expiración
2. **Control de acceso por roles**: Admin vs Cliente
3. **Validación de permisos**: Middleware en todas las rutas protegidas
4. **Aislamiento de datos**: Clientes solo ven sus residencias
5. **Hashing de contraseñas**: SHA-256 (actualizar a bcrypt en producción)

## 📊 Datos de Ejemplo

### Residencias
- **H-001**: Residencial Valle Real (Zapopan, Jal.) - 4 dispositivos
- **H-002**: Villa Montana (Monterrey, NL.) - 3 dispositivos
- **H-003**: Penthouse Reforma (CDMX) - 3 dispositivos

### Asignaciones
- Juan Pérez → H-001
- María García → H-002
- Admin → Todas

## 🎨 Interfaz de Usuario

### Características Visuales
- Diseño minimalista y elegante
- Tipografía Inter con espaciado amplio
- Animaciones suaves y transiciones
- Modo grayscale con hover colorizado
- Panel lateral deslizante para detalles
- Responsive design completo

### Flujos de Navegación
1. **Login** → Pantalla de autenticación
2. **Directory** → Grid de residencias disponibles
3. **Dashboard** → Vista detallada de residencia
   - Tab Systems: Grid de sistemas
   - System Detail: Lista de dispositivos
   - Device Panel: Información técnica completa

## 🔧 Siguientes Pasos Recomendados

### Mejoras de Seguridad
- [ ] Implementar bcrypt real (vía API externa)
- [ ] Rate limiting en endpoints
- [ ] HTTPS en producción
- [ ] Refresh tokens
- [ ] 2FA para administradores

### Funcionalidades Adicionales
- [ ] Tab "History": Línea de tiempo de eventos
- [ ] Tab "Support": Sistema de tickets
- [ ] Panel de creación de residencias (admin)
- [ ] Panel de creación de dispositivos (admin)
- [ ] Gestión de usuarios (admin)
- [ ] Filtros y búsqueda
- [ ] Exportar reportes

### Optimizaciones
- [ ] Caché de consultas frecuentes
- [ ] Paginación en listas grandes
- [ ] WebSockets para actualizaciones en tiempo real
- [ ] PWA para acceso offline

## 📝 Notas de Desarrollo

- **Puerto local**: 3000
- **Base de datos**: SQLite local en `.wrangler/state/v3/d1/`
- **JWT Secret**: Configurado en `wrangler.jsonc` (cambiar en producción)
- **Logs PM2**: `/home/user/.pm2/logs/`

## 👨‍💻 Autor

Desarrollado para **Smart Spaces** - Global Automation & Design

---

**Versión**: 1.0.0  
**Última actualización**: 2026-02-12  
**Estado**: ✅ Desarrollo Completo - Listo para Pruebas
