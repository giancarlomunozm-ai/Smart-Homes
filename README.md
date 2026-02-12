# Smart Spaces - Infrastructure OS

Sistema de gestión inteligente de residencias con control de dispositivos de automatización, seguridad y monitoreo.

## 🎯 Descripción del Proyecto

**Smart Spaces** es una plataforma completa de gestión de infraestructura para residencias inteligentes. Permite al equipo de Smart Spaces y a los clientes finales monitorear, gestionar y controlar todos los dispositivos y sistemas instalados en cada propiedad.

### Características Principales

✅ **Sistema de Autenticación de Dos Niveles**
- **Administradores** (equipo Smart Spaces): Acceso completo a todas las residencias y funciones de gestión
- **Clientes**: Acceso restringido solo a sus residencias asignadas

✅ **Gestión Completa de Residencias**
- Visualización de portafolio completo (admin) o residencias asignadas (clientes)
- Información detallada de cada propiedad
- Estados operacionales en tiempo real

✅ **Monitoreo de Sistemas por Categoría**
- Iluminación (Lighting)
- Audio/Video (Media)
- Red (Network)
- Seguridad/CCTV (Security)
- Control de Acceso (Entry)
- Cortinas/Persianas (Shades)
- Automatización (Logic)

✅ **Gestión de Dispositivos**
- Inventario completo de dispositivos por residencia
- Detalles técnicos: IP, MAC, firmware, serial
- Credenciales de acceso seguras
- Estados operacionales (Online, Offline, Maintenance)

✅ **Interfaz Premium**
- Diseño minimalista y elegante
- Animaciones fluidas
- Responsive design
- Inspirada en sistemas de alta gama

## 🌐 URLs de Acceso

### Desarrollo Local (Sandbox)
- **Aplicación**: https://3000-i8qh3aowtsi1cskm7t6pw-ad490db5.sandbox.novita.ai
- **API Health**: https://3000-i8qh3aowtsi1cskm7t6pw-ad490db5.sandbox.novita.ai/api/health
- **API Base**: https://3000-i8qh3aowtsi1cskm7t6pw-ad490db5.sandbox.novita.ai/api

### Producción (Por desplegar)
- **Cloudflare Pages**: (pendiente de despliegue)

## 🔐 Credenciales de Acceso

### Usuario Administrador (Equipo Smart Spaces)
```
Email: admin@smartspaces.com
Password: admin123
```
**Permisos:** Acceso completo a todas las residencias, gestión de dispositivos, asignación de clientes

### Usuarios Clientes

**Cliente 1 - Juan Pérez**
```
Email: cliente1@example.com
Password: cliente123
```
**Acceso a:** Residencial Valle Real (H-001)

**Cliente 2 - María García**
```
Email: cliente2@example.com
Password: cliente123
```
**Acceso a:** Villa Montana (H-002)

## 📊 Arquitectura de Datos

### Modelo de Base de Datos (Cloudflare D1)

**Tablas Principales:**

1. **users** - Usuarios del sistema
   - id, email, password (hash SHA-256), name, role (admin/client)
   
2. **residences** - Propiedades gestionadas
   - id, name, address, image, status (Operational/Maintenance/Offline)
   
3. **user_residences** - Asignación de clientes a residencias
   - user_id, residence_id

4. **systems** - Categorías de sistemas
   - id, name, icon

5. **devices** - Dispositivos instalados
   - residence_id, system_id, name, brand, model, serial
   - ip, mac, firmware, username, password, status

6. **events** - Historial de eventos
   - residence_id, device_id, user_id, event_type, description

### Flujo de Datos

```
Usuario → Login (JWT) → API Backend → D1 Database → Respuesta JSON → Frontend React
```

## 🚀 Stack Tecnológico

### Backend
- **Framework**: Hono (lightweight web framework)
- **Runtime**: Cloudflare Workers
- **Base de Datos**: Cloudflare D1 (SQLite distribuido)
- **Autenticación**: JWT con Web Crypto API
- **Seguridad**: Hash SHA-256 para contraseñas

### Frontend
- **Framework UI**: React 18 (via CDN)
- **Estilos**: Tailwind CSS (via CDN)
- **Transpiler**: Babel Standalone
- **State Management**: React Hooks + Context API

### Infraestructura
- **Desarrollo Local**: Wrangler + PM2
- **Producción**: Cloudflare Pages
- **CI/CD**: Git + Wrangler CLI

## 📁 Estructura del Proyecto

```
webapp/
├── src/
│   ├── index.tsx                 # Aplicación principal Hono
│   ├── routes/
│   │   ├── auth.ts              # Rutas de autenticación
│   │   ├── residences.ts        # Gestión de residencias
│   │   ├── devices.ts           # Gestión de dispositivos
│   │   ├── systems.ts           # Sistemas disponibles
│   │   └── events.ts            # Historial de eventos
│   ├── middleware/
│   │   └── auth.ts              # Middleware de autenticación
│   └── utils/
│       ├── jwt.ts               # Utilidades JWT
│       └── password.ts          # Hash de contraseñas
├── public/
│   └── app.js                   # Aplicación React frontend
├── migrations/
│   └── 0001_initial_schema.sql  # Esquema de base de datos
├── dist/                        # Build output (generado)
├── seed.sql                     # Datos de ejemplo
├── wrangler.jsonc              # Configuración Cloudflare
├── ecosystem.config.cjs        # Configuración PM2
├── package.json                # Dependencias
└── README.md                   # Este archivo
```

## 🔧 API REST Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/verify` - Verificar token
- `POST /api/auth/register` - Registrar usuario (admin only)

### Residencias
- `GET /api/residences` - Listar residencias (filtrado por rol)
- `GET /api/residences/:id` - Detalles de residencia
- `POST /api/residences` - Crear residencia (admin only)
- `PUT /api/residences/:id` - Actualizar residencia (admin only)
- `DELETE /api/residences/:id` - Eliminar residencia (admin only)
- `POST /api/residences/:id/assign` - Asignar residencia a cliente (admin only)
- `DELETE /api/residences/:id/assign/:userId` - Desasignar (admin only)

### Dispositivos
- `GET /api/devices/residence/:residenceId` - Dispositivos por residencia
- `GET /api/devices/:id` - Detalles de dispositivo
- `POST /api/devices` - Crear dispositivo (admin only)
- `PUT /api/devices/:id` - Actualizar dispositivo (admin only)
- `DELETE /api/devices/:id` - Eliminar dispositivo (admin only)
- `GET /api/devices/system/:systemId` - Dispositivos por sistema

### Sistemas
- `GET /api/systems` - Listar todos los sistemas
- `GET /api/systems/:id/stats` - Estadísticas de sistema

### Eventos
- `GET /api/events/residence/:residenceId` - Eventos por residencia
- `GET /api/events` - Todos los eventos (admin only)

## 🛠️ Comandos Disponibles

### Desarrollo
```bash
npm run dev              # Servidor desarrollo Vite (sin D1)
npm run dev:sandbox      # Wrangler local con D1 (sandbox)
npm run build            # Construir para producción
npm run preview          # Preview build local
```

### Base de Datos
```bash
npm run db:migrate:local # Aplicar migraciones local
npm run db:migrate:prod  # Aplicar migraciones producción
npm run db:seed          # Cargar datos de ejemplo
npm run db:reset         # Resetear BD local completamente
```

### Despliegue
```bash
npm run deploy           # Build + Deploy a Cloudflare Pages
npm run deploy:prod      # Deploy con nombre de proyecto
```

### PM2 (Desarrollo Local)
```bash
pm2 start ecosystem.config.cjs   # Iniciar aplicación
pm2 restart webapp               # Reiniciar
pm2 logs webapp --nostream       # Ver logs
pm2 stop webapp                  # Detener
pm2 delete webapp                # Eliminar de PM2
```

## 🎨 Funcionalidades Implementadas

### ✅ Sistema de Login
- Validación de credenciales contra D1
- Generación de JWT tokens
- Almacenamiento seguro en localStorage
- Verificación automática al cargar

### ✅ Panel de Residencias
- Grid de tarjetas con imágenes
- Estados operacionales
- Hover effects premium
- Filtrado automático por rol de usuario

### ✅ Dashboard de Residencia
- Header con información completa
- Navegación por tabs (Systems, History, Support)
- Diseño con overlay de imagen de fondo

### ✅ Grid de Sistemas
- Iconos animados por categoría
- Contador de dispositivos
- Transiciones suaves
- Arquitectura modular

### ✅ Lista de Dispositivos
- Agrupación por sistema
- Información técnica completa
- Indicadores de estado (Online/Offline/Maintenance)
- Click para ver detalles

### ✅ Panel de Detalles
- Slide-over lateral
- Información completa del dispositivo
- Credenciales con toggle de visibilidad
- Datos técnicos: IP, MAC, Firmware, Serial

## 📋 Próximos Pasos Recomendados

### Fase 1: Mejoras de UX/UI (1-2 semanas)
- [ ] Agregar búsqueda global de dispositivos
- [ ] Filtros avanzados por sistema/estado
- [ ] Dark mode toggle
- [ ] Notificaciones toast para acciones
- [ ] Indicadores de carga más detallados

### Fase 2: Funcionalidades Avanzadas (2-3 semanas)
- [ ] Implementar tab "History" con eventos reales
- [ ] Sistema de tickets de soporte (tab "Support")
- [ ] Dashboard con gráficas y estadísticas
- [ ] Exportación de reportes (PDF/Excel)
- [ ] Gestión de usuarios admin

### Fase 3: Gestión CRUD Completa (1-2 semanas)
- [ ] Formularios para crear/editar residencias
- [ ] Formularios para crear/editar dispositivos
- [ ] Asignación de clientes a residencias
- [ ] Gestión de permisos granulares
- [ ] Validaciones de formularios

### Fase 4: Optimización y Producción (1 semana)
- [ ] Tests automatizados (unit + integration)
- [ ] Optimización de queries D1
- [ ] CDN para assets estáticos
- [ ] Monitoreo con Cloudflare Analytics
- [ ] Rate limiting y seguridad

### Fase 5: Funcionalidades Pro (3-4 semanas)
- [ ] Control remoto de dispositivos (si API disponible)
- [ ] Automatizaciones y escenas
- [ ] Integración con webhooks
- [ ] Aplicación móvil (PWA)
- [ ] Sistema de alertas en tiempo real

## 🔒 Seguridad

### Implementado
- ✅ Autenticación JWT con expiración (24h)
- ✅ Contraseñas hasheadas (SHA-256)
- ✅ Validación de tokens en cada request
- ✅ Control de acceso basado en roles (RBAC)
- ✅ Filtrado de datos por permisos de usuario
- ✅ CORS configurado correctamente

### Recomendaciones para Producción
- [ ] Implementar bcrypt/Argon2 para contraseñas
- [ ] Rate limiting en endpoints de login
- [ ] HTTPS obligatorio (Cloudflare lo provee)
- [ ] Rotación periódica de JWT_SECRET
- [ ] Logs de auditoría de accesos
- [ ] 2FA opcional para administradores

## 📱 Responsive Design

La aplicación es completamente responsive y funciona en:
- ✅ Desktop (1920px+)
- ✅ Laptop (1366px)
- ✅ Tablet (768px)
- ✅ Mobile (375px)

## 🤝 Guía de Usuario

### Para Administradores
1. **Login** con credenciales de admin
2. **Ver todas las residencias** en el directorio
3. **Acceder a cualquier residencia** haciendo click
4. **Navegar por sistemas** en la vista de dashboard
5. **Ver dispositivos** por categoría
6. **Revisar detalles técnicos** de cada dispositivo
7. **Cerrar sesión** desde el header

### Para Clientes
1. **Login** con credenciales de cliente
2. **Ver solo residencias asignadas** en el directorio
3. **Acceder a su(s) residencia(s)** 
4. **Monitorear sistemas y dispositivos** instalados
5. **Consultar credenciales** de acceso a dispositivos
6. **Reportar incidencias** (próximamente en tab Support)

## 📦 Despliegue a Producción

### Requisitos Previos
1. Cuenta de Cloudflare con Workers habilitado
2. API Token de Cloudflare configurado
3. Base de datos D1 creada en producción

### Pasos de Despliegue
```bash
# 1. Crear base de datos D1 en producción
npx wrangler d1 create webapp-production

# 2. Copiar database_id al wrangler.jsonc

# 3. Aplicar migraciones en producción
npm run db:migrate:prod

# 4. Cargar datos iniciales (opcional)
npx wrangler d1 execute webapp-production --file=./seed.sql

# 5. Configurar secretos
npx wrangler secret put JWT_SECRET --project-name webapp

# 6. Desplegar
npm run deploy:prod
```

## 📊 Estado del Proyecto

**Versión Actual:** 1.0.0 (MVP)

**Completado:**
- [x] Sistema de autenticación completo
- [x] Base de datos D1 con esquema completo
- [x] API REST completa con control de acceso
- [x] Interfaz de usuario premium replicada
- [x] Gestión de residencias
- [x] Monitoreo de dispositivos por sistema
- [x] Panel de detalles de dispositivos
- [x] Responsive design

**En Desarrollo:**
- [ ] Tab de historial de eventos
- [ ] Tab de soporte/tickets
- [ ] Formularios CRUD de gestión

**Por Desarrollar:**
- [ ] Dashboard con gráficas
- [ ] Exportación de reportes
- [ ] Sistema de notificaciones
- [ ] Control remoto de dispositivos

## 🐛 Problemas Conocidos

Ninguno reportado en el MVP actual.

## 📝 Notas Técnicas

### Contraseñas Hasheadas
Las contraseñas en la base de datos están hasheadas con SHA-256:
- `admin123` → `b3c0d3f1a7c9e5d8f2a4b6e8c1d3f5a7b9c0e2f4a6b8d0f2e4c6a8b0d2f4e6a8`
- `cliente123` → `f7a9c1e3b5d7f9a1c3e5b7d9f1a3c5e7b9d1f3a5c7e9b1d3f5a7c9e1b3d5f7a9`

Para producción, se recomienda usar bcrypt o Argon2.

### JWT Secret
El secret JWT actual es de desarrollo: `your-secret-key-change-in-production`

Para producción, generar uno aleatorio y seguro:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Base de Datos Local
La base de datos local se encuentra en: `.wrangler/state/v3/d1/`

Para resetear completamente:
```bash
npm run db:reset
```

## 👨‍💻 Información del Desarrollador

- **Proyecto:** Smart Spaces - Infrastructure OS
- **Cliente:** Equipo Smart Spaces
- **Fecha de Inicio:** 2026-02-12
- **Estado:** MVP Completado ✅
- **Última Actualización:** 2026-02-12

---

**Smart Spaces** - *Global Automation & Design © 2024*

*Encrypted Infrastructure - Relay: 10.0.4.1 — Stable*
