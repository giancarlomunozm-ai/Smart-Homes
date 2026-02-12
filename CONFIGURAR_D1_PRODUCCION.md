# 🔧 Guía: Configurar Base de Datos D1 en Cloudflare (Producción)

## ⚠️ Estado Actual del Deploy

El proyecto está desplegado **SIN base de datos D1** para evitar errores de deployment.

**Lo que funciona**:
- ✅ Frontend completo
- ✅ Interfaz de usuario
- ✅ Navegación

**Lo que NO funciona sin BD**:
- ❌ Login
- ❌ APIs de datos
- ❌ Gestión de residencias

---

## 📋 Pasos para Agregar Base de Datos D1

### Paso 1: Crear Base de Datos D1 en Cloudflare

```bash
# Desde tu máquina local o sandbox
cd /home/user/webapp

# Crear base de datos D1 en Cloudflare
npx wrangler d1 create webapp-production
```

**Output esperado**:
```
✅ Successfully created DB 'webapp-production'

[[d1_databases]]
binding = "DB"
database_name = "webapp-production"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

**⚠️ IMPORTANTE**: Copia el `database_id` que te devuelva el comando.

---

### Paso 2: Actualizar wrangler.jsonc

Edita el archivo `wrangler.jsonc` y agrega la configuración D1:

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "webapp",
  "compatibility_date": "2026-02-12",
  "pages_build_output_dir": "./dist",
  "compatibility_flags": ["nodejs_compat"],
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "webapp-production",
      "database_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"  // 👈 PEGA AQUÍ el ID real
    }
  ],
  "vars": {
    "JWT_SECRET": "your-secret-key-change-in-production"
  }
}
```

---

### Paso 3: Aplicar Migraciones a Producción

```bash
# Aplicar esquema de base de datos
npx wrangler d1 migrations apply webapp-production

# Cuando pregunte si continuar, escribe: yes
```

Esto creará todas las tablas:
- users
- residences
- user_residences
- systems
- devices
- events
- support_tickets
- ticket_responses

---

### Paso 4: Cargar Datos de Ejemplo (Opcional)

```bash
# Cargar usuarios, residencias y dispositivos demo
npx wrangler d1 execute webapp-production --file=./seed.sql
```

---

### Paso 5: Re-desplegar con Base de Datos

```bash
# Hacer commit de los cambios
git add wrangler.jsonc
git commit -m "Add: Configurar D1 database en producción"
git push origin main

# Construir y desplegar
npm run build
npm run deploy

# O desde la plataforma de deploy, hacer re-deploy
```

---

## 🎯 Verificar que Funciona

Una vez desplegado con BD:

### Test 1: Health Check
```bash
curl https://tu-app.pages.dev/api/health
```
**Esperado**: `{"status":"ok",...}`

### Test 2: Login
```bash
curl -X POST https://tu-app.pages.dev/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@smartspaces.com","password":"admin123"}'
```
**Esperado**: `{"success":true,"token":"..."}`

### Test 3: Residencias
```bash
# Usa el token del paso anterior
curl -H "Authorization: Bearer TU_TOKEN" \
  https://tu-app.pages.dev/api/residences
```
**Esperado**: Lista de 3 residencias

---

## 🔄 Alternativa: Deploy CON Base de Datos desde el Inicio

Si prefieres hacerlo todo de una vez:

```bash
# 1. Crear BD
npx wrangler d1 create webapp-production

# 2. Copiar el database_id y actualizar wrangler.jsonc

# 3. Aplicar migraciones
npx wrangler d1 migrations apply webapp-production

# 4. Cargar datos
npx wrangler d1 execute webapp-production --file=./seed.sql

# 5. Commit
git add wrangler.jsonc
git commit -m "Add: D1 database configurada"
git push origin main

# 6. Deploy
npm run build
npm run deploy
```

---

## 📊 Comandos Útiles D1

```bash
# Listar bases de datos
npx wrangler d1 list

# Ver info de una BD
npx wrangler d1 info webapp-production

# Ejecutar query manual
npx wrangler d1 execute webapp-production --command="SELECT * FROM users"

# Ver migraciones aplicadas
npx wrangler d1 migrations list webapp-production
```

---

## ⚠️ Notas Importantes

1. **Desarrollo vs Producción**:
   - Local: Usa `--local` (SQLite en `.wrangler/`)
   - Producción: Sin `--local` (D1 en Cloudflare)

2. **No mezclar**:
   - La BD local y producción son completamente separadas
   - Cambios en local NO afectan producción

3. **Migraciones**:
   - Siempre aplicar migraciones ANTES de deploy
   - No editar migraciones ya aplicadas

4. **Seed data**:
   - Solo para desarrollo/testing
   - En producción, usa panel admin para crear datos

---

## 🆘 Problemas Comunes

### Error: "Invalid database UUID"
**Causa**: `database_id` vacío o incorrecto  
**Solución**: Verifica que copiaste el ID correcto de `wrangler d1 create`

### Error: "Table doesn't exist"
**Causa**: Migraciones no aplicadas  
**Solución**: `npx wrangler d1 migrations apply webapp-production`

### Error: "Authentication required"
**Causa**: No hay datos de usuarios  
**Solución**: `npx wrangler d1 execute webapp-production --file=./seed.sql`

---

## ✅ Checklist Final

- [ ] Crear base de datos D1
- [ ] Copiar database_id
- [ ] Actualizar wrangler.jsonc
- [ ] Aplicar migraciones
- [ ] Cargar seed data (opcional)
- [ ] Commit y push
- [ ] Re-deploy
- [ ] Probar login

---

## 📞 Soporte

Si encuentras problemas:
1. Revisa los logs de Cloudflare Pages
2. Verifica que el database_id sea correcto
3. Confirma que las migraciones se aplicaron
4. Prueba las APIs con curl

---

**Última actualización**: 2026-02-12  
**Versión**: 2.1.0
