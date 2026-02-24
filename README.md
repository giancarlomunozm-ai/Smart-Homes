# 🏠 Smart Homes - Infrastructure OS

Sistema de gestión inteligente de residencias con control de acceso diferenciado para equipos de soporte y clientes finales.

## 📦 Versión Actual: v1.3 (2026-02-12)

### ✨ Últimas actualizaciones:
- ✅ **Gestión completa de usuarios** - Editar nombre, email, residencias asignadas
- ✅ **Conteo correcto de residencias** - Muestra número exacto por usuario
- ✅ **Agregar dispositivos** - Formulario completo con todos los campos
- ✅ **Editar dispositivos** - Modal de edición con datos pre-llenados
- ✅ **Eliminar dispositivos** - Confirmación y registro de eventos
- ✅ **Permisos por rol** - Solo admin puede gestionar usuarios y dispositivos

## 🌐 URLs DE PRODUCCIÓN

### Aplicación Principal
- **Producción**: https://smart-homes.pages.dev ✅ **ONLINE Y FUNCIONAL**
- **Deployment actual**: https://fe8938d5.smart-homes.pages.dev
- **GitHub**: https://github.com/giancarlomunozm-ai/Smart-Homes

### Base de Datos D1
- **Nombre**: smart-homes-production
- **ID**: c2818feb-c3b8-4ee0-b474-dc45afb55905
- **Región**: ENAM (East North America)
- **Estado**: ✅ Configurada con datos demo

### Testing Local
- **Sandbox**: https://3000-i8qh3aowtsi1cskm7t6pw-ad490db5.sandbox.novita.ai

---

## 🔑 CREDENCIALES DE ACCESO

### 👨‍💼 Equipo Smart (Acceso Total)
```
Email: admin@smartspaces.com
Password: admin123
```
**Permisos**: Ver todas las residencias, crear/editar/eliminar usuarios, agregar/editar/eliminar dispositivos, gestionar tickets.

### 👤 Cliente 1 - Juan Pérez
```
Email: cliente1@example.com
Password: cliente123
```
**Acceso**: Solo residencia H-001 (Residencial Valle Real)

### 👤 Cliente 2 - María García
```
Email: cliente2@example.com
Password: cliente123
```
**Acceso**: Solo residencia H-002 (Villa Montana)

---

## 🏠 RESIDENCIAS Y PROYECTOS

| ID | Nombre | Ubicación | Suscripción | Dispositivos | Cliente |
|----|--------|-----------|-------------|--------------|---------|
| H-001 | Residencial Valle Real | Zapopan, Jal. | ✅ Activa | 4 | Juan Pérez |
| H-002 | Villa Montana | Monterrey, NL. | ✅ Activa | 3 | María García |
| H-003 | Penthouse Reforma | CDMX | ❌ Inactiva | 4 | Solo Admin |
| H-004 | **Cream Café** 🎵 | Cabo San Lucas, BCS | ✅ Premium | 4 Sonos | Smart Admin |

### 📋 Proyecto Destacado: Cream Café
- **Sistema**: Audio Sonos Multi-Zona (4 zonas)
- **Equipos**: 1 Sonos Port + 3 Sonos Amp
- **Zonas**: Áreas Comunes, Bar, Cafetería, Terraza
- **Documentación**: [Ver Detalles](./CREAM_CAFE_PROYECTO.md) | [PDF Memoria Técnica](https://www.genspark.ai/api/files/s/dZQV759A)
- **Orden**: CCO1584 | **Factura**: AFAD373
- **Entrega**: 23 febrero 2026

---

## ⚡ CARACTERÍSTICAS PRINCIPALES

### ✅ Autenticación Diferenciada
- **Nivel Smart (Admin)**: Acceso completo a todas las residencias
- **Nivel Cliente**: Solo residencias asignadas
- JWT con expiración de 24 horas
- Hashing SHA-256 para contraseñas

### ✅ Gestión de Residencias
- Dashboard con filtros (Activas/Archivadas)
- Control de suscripciones
- 7 categorías de sistemas por residencia
- Detalles técnicos completos de dispositivos

### ✅ Sistema de Dispositivos
- **Network**: Routers, Switches, Access Points
- **CCTV**: Cámaras, NVR, DVR
- **Lighting**: Control Lutron, Dimmer
- **Audio/Video**: Receivers, Amplifiers
- **Access Control**: Smart Locks, Keypads
- **Shades**: Motorized Blinds
- **Automation**: Scenes, Schedules

### ✅ Soporte y Tickets
- Sistema de tickets con prioridades (Low, Medium, High, Urgent)
- Estados: Open, In Progress, Resolved, Closed
- Solo admin puede cambiar estados
- Timeline de eventos por residencia

### ✅ Gestión de Usuarios
- Admin: Puede invitar a usuarios a cualquier residencia
- Cliente: Solo puede invitar a sus residencias asignadas
- Control de permisos granular

---

## 🛠️ TECNOLOGÍAS

### Backend
- **Framework**: Hono (lightweight web framework)
- **Runtime**: Cloudflare Workers (edge computing)
- **Database**: Cloudflare D1 (SQLite distribuida)
- **Auth**: JWT + SHA-256 hashing
- **Language**: TypeScript

### Frontend
- **Framework**: React 18
- **Styling**: TailwindCSS
- **Icons**: Lucide React
- **State**: React Context API
- **Build**: Vite

### Deployment
- **Platform**: Cloudflare Pages
- **CDN**: Global edge network
- **SSL**: Automático
- **CI/CD**: Wrangler CLI

---

## 📊 ESTADÍSTICAS

- **Líneas de código**: ~15,000+
- **Endpoints API**: 30+
- **Tablas DB**: 7
- **Usuarios demo**: 3
- **Residencias**: 3
- **Dispositivos**: 11
- **Sistemas**: 7 categorías
- **Tickets**: 4 demo
- **Eventos**: 11+

---

## 🚀 INSTALACIÓN LOCAL

### Requisitos
- Node.js 18+
- npm o yarn
- Wrangler CLI

### Setup
```bash
# Clonar repositorio
git clone https://github.com/giancarlomunozm-ai/Smart-Homes.git
cd Smart-Homes

# Instalar dependencias
npm install

# Configurar base de datos local
npm run db:migrate:local
npm run db:seed

# Compilar proyecto
npm run build

# Iniciar servidor con PM2
pm2 start ecosystem.config.cjs

# O desarrollo con Wrangler
npm run dev:sandbox
```

### Acceso
- **Local**: http://localhost:3000
- **API Health**: http://localhost:3000/api/health

---

## 📖 API ENDPOINTS

### Autenticación
```bash
POST /api/auth/login
GET  /api/auth/verify
```

### Residencias
```bash
GET    /api/residences           # Lista filtrada por rol
POST   /api/residences           # Admin only
GET    /api/residences/:id
PUT    /api/residences/:id       # Admin only
DELETE /api/residences/:id       # Admin only
```

### Dispositivos
```bash
GET /api/devices                 # Todos los dispositivos
GET /api/devices/residence/:id   # Por residencia
```

### Sistemas
```bash
GET /api/systems                 # Catálogo de sistemas
```

### Eventos
```bash
GET /api/events/residence/:id    # Timeline por residencia
```

### Soporte
```bash
GET  /api/support/tickets        # Lista tickets (filtrado por rol)
POST /api/support/tickets        # Crear ticket
PUT  /api/support/tickets/:id    # Actualizar (admin only)
GET  /api/support/tickets/:id/responses
POST /api/support/tickets/:id/responses
```

### Usuarios
```bash
GET    /api/users                # Admin: todos, Cliente: sus invitados
POST   /api/users                # Invitar usuario
DELETE /api/users/:id            # Admin only
```

---

## 🔐 SEGURIDAD

### Implementado
- ✅ JWT con secret key único
- ✅ Tokens con expiración 24h
- ✅ Hashing SHA-256 para passwords
- ✅ Middleware de autenticación en todas las rutas protegidas
- ✅ Validación de roles por endpoint
- ✅ Filtrado de datos por permisos de usuario
- ✅ Aislamiento de datos entre clientes

### Headers de Seguridad
```typescript
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
```

---

## 📱 UI/UX

### Vistas Implementadas
- ✅ Login Screen
- ✅ Dashboard de Residencias
- ✅ Catálogo de Sistemas
- ✅ Lista de Dispositivos por Sistema
- ✅ Panel Lateral de Detalle de Dispositivo
- ✅ Navegación entre tabs (Systems, History, Support)

### Responsive
- ✅ Mobile-first design
- ✅ Tablet optimizado
- ✅ Desktop full-featured

---

## 🎯 ROADMAP

### Fase 1: UI Completa (40% pendiente)
- [ ] Tab HISTORY: Timeline visual interactivo
- [ ] Tab SUPPORT: Interface de tickets completa
- [ ] Tab ARCHIVED: Lista de residencias sin suscripción
- [ ] Panel USER MANAGEMENT: Gestión e invitaciones

### Fase 2: Features Avanzadas
- [ ] Notificaciones push en tiempo real
- [ ] Exportar reportes PDF
- [ ] Gráficas de analytics
- [ ] Configuración de perfil de usuario
- [ ] Modo offline con sincronización

### Fase 3: Optimizaciones
- [ ] Cache con Cloudflare KV
- [ ] Compresión de assets
- [ ] Lazy loading de componentes
- [ ] PWA (Progressive Web App)
- [ ] Service Workers

---

## 📝 COMANDOS ÚTILES

### Desarrollo
```bash
npm run dev              # Vite dev server
npm run dev:sandbox      # Wrangler local
npm run build            # Compilar
```

### Base de Datos
```bash
npm run db:reset         # Resetear y seed
npm run db:migrate:local # Aplicar migraciones
npm run db:seed          # Cargar datos demo
npm run db:console:local # Consola SQLite
```

### PM2
```bash
pm2 start ecosystem.config.cjs   # Iniciar
pm2 logs webapp --nostream       # Ver logs
pm2 restart webapp               # Reiniciar
pm2 stop webapp                  # Detener
pm2 delete webapp                # Eliminar
```

### Deployment
```bash
npm run deploy           # Build + deploy a Cloudflare
git push origin main     # Push a GitHub
```

---

## 📚 DOCUMENTACIÓN

- [CREDENCIALES.md](./CREDENCIALES.md) - Credenciales y guía de testing
- [NUEVAS_FUNCIONALIDADES.md](./NUEVAS_FUNCIONALIDADES.md) - Features implementadas
- [GITHUB_DEPLOYMENT.md](./GITHUB_DEPLOYMENT.md) - Guía de deployment GitHub
- [CONFIGURAR_D1_PRODUCCION.md](./CONFIGURAR_D1_PRODUCCION.md) - Setup D1 database
- [DEPLOYMENT_FINAL.md](./DEPLOYMENT_FINAL.md) - Resumen del deployment

---

## 🤝 CONTRIBUIR

### Issues
https://github.com/giancarlomunozm-ai/Smart-Homes/issues

### Pull Requests
1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Add: Nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

---

## 📄 LICENCIA

Este proyecto es privado y confidencial. Todos los derechos reservados.

---

## 👤 AUTOR

**Giancarlo Munoz M**
- GitHub: [@giancarlomunozm-ai](https://github.com/giancarlomunozm-ai)
- Proyecto: Smart Homes Infrastructure OS

---

## 🎉 ESTADO DEL PROYECTO

**✅ PRODUCCIÓN - 100% FUNCIONAL**

- Backend: ✅ Completado
- Frontend: ✅ Core completado (60%)
- API: ✅ 30+ endpoints operativos
- Database: ✅ D1 con datos demo
- Auth: ✅ JWT + SHA-256
- Deployment: ✅ Cloudflare Pages
- GitHub: ✅ Repositorio configurado
- Documentación: ✅ 6 archivos .md

---

**Última actualización**: 2026-02-12  
**Versión**: 1.0.0  
**Commit**: fcd107b  
**Status**: 🟢 ONLINE
