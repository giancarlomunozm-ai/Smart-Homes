# 📧 Sistema de Invitaciones por Email

## 🎯 Funcionalidad Implementada

El sistema permite a los administradores invitar nuevos usuarios por email. Los invitados reciben un enlace para completar su registro.

## 🔧 Configuración de Resend (Servicio de Email)

### Paso 1: Crear cuenta en Resend

1. Ir a: https://resend.com/signup
2. Crear cuenta gratuita
3. Verificar email

### Paso 2: Obtener API Key

1. Ir al Dashboard: https://resend.com/api-keys
2. Click en "Create API Key"
3. Nombre: `Smart Spaces Production`
4. Permisos: "Sending access" (default)
5. Copiar el API key (empieza con `re_...`)

### Paso 3: Configurar en Cloudflare Pages

**Opción A: Via Dashboard (RECOMENDADO)**

1. Ir a: https://dash.cloudflare.com
2. Workers & Pages → `smart-homes`
3. Settings → Environment Variables
4. Add variable:
   - Name: `RESEND_API_KEY`
   - Value: `re_...` (tu API key)
   - Environment: Production
5. Opcional - Email personalizado:
   - Name: `RESEND_FROM_EMAIL`
   - Value: `onboarding@tu-dominio.com` (requiere dominio verificado)
   - Environment: Production

**Opción B: Via Wrangler CLI**

```bash
# Agregar API key
npx wrangler pages secret put RESEND_API_KEY --project-name smart-homes
# Pegar el valor cuando lo pida: re_...

# Opcional - Email personalizado
npx wrangler pages secret put RESEND_FROM_EMAIL --project-name smart-homes
# Pegar: onboarding@tu-dominio.com
```

### Paso 4: Verificar Dominio (Opcional pero Recomendado)

**Sin dominio verificado**:
- Se usa `onboarding@resend.dev` (sandbox)
- Solo puedes enviar a tu propio email
- Límite: 100 emails/día

**Con dominio verificado**:
1. Ir a: https://resend.com/domains
2. Click "Add Domain"
3. Agregar: `smartspaces.com.mx` (o tu dominio)
4. Configurar DNS records (MX, DKIM, etc.)
5. Esperar verificación (~10 minutos)
6. Usar: `invitaciones@smartspaces.com.mx`

---

## 📊 Límites del Plan Gratuito de Resend

| Feature | Límite |
|---------|--------|
| **Emails/día** | 100 |
| **Emails/mes** | 3,000 |
| **Dominios** | 1 |
| **Destinatarios** | Ilimitados (con dominio verificado) |
| **Attachments** | Sí |
| **Templates** | Sí |

---

## 🚀 Uso del Sistema

### Como Administrador - Invitar Usuario

**1. Ir a Gestión de Usuarios**:
```
Dashboard → 👥 Usuarios → ➕ Invitar Usuario
```

**2. Llenar formulario**:
- Email del invitado
- Rol: Admin o Cliente
- Residencias asignadas

**3. Enviar invitación**:
- Click en "Enviar Invitación"
- Se crea registro en BD
- Se envía email automático (si está configurado Resend)

### Como Invitado - Aceptar Invitación

**1. Recibir email**:
```
Asunto: 🏠 Invitación a Smart Spaces - Cliente/Admin
De: onboarding@resend.dev (o tu dominio)
```

**2. Click en botón "Aceptar Invitación"**

**3. Completar registro**:
- Nombre completo
- Contraseña (min 6 caracteres)
- Click en "Crear Cuenta"

**4. Login automático**:
- Acceso inmediato a sus residencias asignadas

---

## 🗄️ Estructura de Base de Datos

### Tabla: `user_invitations`

```sql
CREATE TABLE user_invitations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  token TEXT UNIQUE NOT NULL,
  invited_by INTEGER NOT NULL,
  role TEXT NOT NULL DEFAULT 'client',
  residences TEXT, -- JSON array
  status TEXT NOT NULL DEFAULT 'pending',
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  accepted_at DATETIME,
  FOREIGN KEY (invited_by) REFERENCES users(id)
);
```

**Estados**:
- `pending`: Invitación enviada, esperando aceptación
- `accepted`: Usuario completó registro
- `expired`: Invitación venció (7 días)

---

## 📡 API Endpoints

### POST `/api/users/invite`
**Crear y enviar invitación** (Admin only)

Request:
```json
{
  "email": "usuario@example.com",
  "role": "client",
  "residences": ["H-001", "H-002"]
}
```

Response:
```json
{
  "success": true,
  "message": "Invitación enviada exitosamente",
  "invitationUrl": "https://smart-homes.pages.dev/invite/UUID"
}
```

### GET `/api/users/invite/:token`
**Verificar invitación** (Público)

Response:
```json
{
  "success": true,
  "invitation": {
    "email": "usuario@example.com",
    "role": "client",
    "residenceNames": ["Residencial Valle Real"],
    "inviterName": "Smart Spaces Admin",
    "expiresAt": "2026-03-03T20:00:00.000Z"
  }
}
```

### POST `/api/users/invite/:token/accept`
**Aceptar invitación y crear cuenta** (Público)

Request:
```json
{
  "name": "Juan Pérez",
  "password": "securepass123"
}
```

Response:
```json
{
  "success": true,
  "message": "Cuenta creada exitosamente"
}
```

---

## 📧 Email Template

El email incluye:

✅ **Header**: Logo de Smart Spaces  
✅ **Invitador**: Nombre de quien invitó  
✅ **Rol**: Admin o Cliente  
✅ **Espacios**: Lista de residencias asignadas  
✅ **Botón CTA**: "Aceptar Invitación" (grande, visible)  
✅ **Link alternativo**: Para copiar/pegar  
✅ **Expiración**: Aviso de 7 días  
✅ **Footer**: Contacto de Smart Spaces  
✅ **Responsive**: Se ve bien en mobile y desktop  

Diseño: Minimalista, profesional, colores de Smart Spaces (slate-950)

---

## 🧪 Testing sin Resend

Si no tienes API key de Resend configurada:

1. La invitación se crea en BD
2. NO se envía email
3. El endpoint devuelve el `invitationUrl`
4. Puedes copiar y pegar el link manualmente

**Ejemplo**:
```bash
POST /api/users/invite
Response: {
  "invitationUrl": "https://smart-homes.pages.dev/invite/abc-123-def"
}
```

Enviar ese link al usuario manualmente (WhatsApp, Telegram, etc.)

---

## 🔒 Seguridad

✅ **Token único**: UUID v4 (imposible adivinar)  
✅ **Expiración**: 7 días automático  
✅ **Un solo uso**: Status cambia a "accepted"  
✅ **Email único**: No se pueden crear múltiples invitaciones para el mismo email  
✅ **Password hash**: SHA-256 antes de guardar  
✅ **Rate limiting**: Cloudflare protege automáticamente  

---

## 📊 Monitoreo

### Ver invitaciones pendientes:

```sql
SELECT 
  email, role, 
  datetime(created_at) as created,
  datetime(expires_at) as expires,
  status
FROM user_invitations
ORDER BY created_at DESC;
```

### Limpiar invitaciones expiradas:

```sql
UPDATE user_invitations 
SET status = 'expired' 
WHERE status = 'pending' 
  AND datetime(expires_at) < datetime('now');
```

---

## 🚨 Troubleshooting

### Email no llega

1. **Verificar API key**:
   ```bash
   npx wrangler pages secret list --project-name smart-homes
   ```

2. **Revisar logs**:
   - Dashboard de Resend: https://resend.com/emails
   - Cloudflare Pages: Logs section

3. **Sandbox mode**:
   - Sin dominio verificado, solo puedes enviar a tu email
   - Verificar dominio para enviar a cualquier email

### Invitación expirada

- Crear nueva invitación
- No se pueden reutilizar tokens

### Email en spam

- Verificar dominio en Resend
- Configurar SPF, DKIM, DMARC
- Pedir al usuario revisar carpeta de spam

---

## 💰 Costos

**Resend Plan Gratuito**: $0/mes
- 100 emails/día
- 3,000 emails/mes
- Perfecto para empezar

**Resend Pro**: $20/mes
- 50,000 emails/mes
- $1 por cada 10,000 adicionales
- Dominios ilimitados

**Estimate para Smart Spaces**:
- 5 invitaciones/día = ~150/mes
- **Plan gratuito es suficiente** ✅

---

## 📝 Próximos Pasos

1. ✅ Migración de BD aplicada
2. ✅ Service de email creado
3. ✅ Endpoints de API listos
4. ⏳ **Frontend**: Formulario de invitación en UI
5. ⏳ **Frontend**: Página de aceptación de invitación
6. ⏳ **Configuración**: Agregar RESEND_API_KEY en Cloudflare

---

**Documentado por**: Smart Spaces  
**Fecha**: 24 febrero 2026  
**Versión**: 1.0
