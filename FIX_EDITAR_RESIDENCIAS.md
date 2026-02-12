# Fix: Editar Residencias de Usuarios

## 🐛 Problema Reportado
Al editar un usuario existente (ej: usuario "test"), no se podían agregar o modificar las residencias asignadas a pesar de seleccionarlas en el modal de edición.

## 🔍 Causa Raíz
El endpoint `PUT /api/users/:userId` en el backend **no estaba procesando el parámetro `residences`** del request body. Solo actualizaba `name` y `email`.

### Código Anterior (Incorrecto)
```typescript
users.put('/:userId', async (c) => {
  const { name, email } = await c.req.json();  // ❌ No captura residences
  
  await db.prepare(
    'UPDATE users SET name = ?, email = ? WHERE id = ?'
  ).bind(name, email, userId).run();
  
  // ❌ No actualiza user_residences
});
```

## ✅ Solución Implementada

### 1. Backend Actualizado
Ahora el endpoint:
- ✅ Captura el parámetro `residences` del body
- ✅ Elimina todas las residencias actuales del usuario
- ✅ Asigna las nuevas residencias seleccionadas
- ✅ Solo permite actualizar residencias si el usuario es admin

### Código Corregido
```typescript
users.put('/:userId', async (c) => {
  const { name, email, residences } = await c.req.json();  // ✅ Captura residences
  
  // Actualizar nombre y email
  await db.prepare(
    'UPDATE users SET name = ?, email = ? WHERE id = ?'
  ).bind(name, email, userId).run();

  // ✅ Si se incluyen residencias y el usuario es admin, actualizar
  if (residences && currentUser.role === 'admin') {
    // Eliminar residencias actuales
    await db.prepare(
      'DELETE FROM user_residences WHERE user_id = ?'
    ).bind(userId).run();

    // Agregar nuevas residencias
    for (const residenceId of residences) {
      await db.prepare(
        'INSERT INTO user_residences (user_id, residence_id) VALUES (?, ?)'
      ).bind(userId, residenceId).run();
    }
  }
});
```

## 🧪 Testing

### Antes del Fix
1. Admin crea usuario "test" ✅
2. Admin intenta editar "test" y agregar residencias
3. Click en "Actualizar Usuario"
4. Residencias NO se guardan ❌

### Después del Fix
1. Admin crea usuario "test" ✅
2. Admin edita "test" y selecciona H-001, H-002
3. Click en "Actualizar Usuario"
4. Residencias se guardan correctamente ✅
5. Usuario "test" ahora tiene 2 residencias ✅

## 📊 Cambios Realizados

### Archivos Modificados
- `src/routes/users.ts` - Endpoint PUT actualizado

### Líneas Cambiadas
- **Agregadas**: +17 líneas
- **Eliminadas**: -1 línea

### Funcionalidad
- ✅ Actualización de residencias funciona
- ✅ Validación de permisos (solo admin)
- ✅ Eliminación y re-asignación correcta
- ✅ Frontend ya estaba enviando el array correctamente

## 🚀 Deployment

### Producción
- **URL**: https://smart-homes.pages.dev
- **Deployment**: https://3820a6f8.smart-homes.pages.dev
- **Commit**: `7ed59b5`
- **Fecha**: 12 de febrero, 2026 - 03:59 UTC

### Testing en Producción
```bash
# 1. Login como admin
curl -X POST https://smart-homes.pages.dev/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@smartspaces.com","password":"admin123"}'

# 2. Editar usuario test (ID 4)
curl -X PUT https://smart-homes.pages.dev/api/users/4 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Test Usuario",
    "email": "test@example.com",
    "residences": ["H-001", "H-002"]
  }'

# 3. Verificar que se guardó
curl https://smart-homes.pages.dev/api/users \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## ✅ Estado Final
- ✅ Fix implementado y testeado
- ✅ Desplegado en producción
- ✅ Commit pushеado a GitHub
- ✅ Funcionalidad verificada

## 📝 Notas
- El frontend ya estaba enviando el array `residences` correctamente
- El problema era exclusivamente en el backend
- El fix mantiene la validación de permisos (solo admin puede editar)
- No afecta a otras funcionalidades del sistema

---

**Smart Homes - Infrastructure OS**  
*Fix aplicado el 12 de febrero, 2026*
