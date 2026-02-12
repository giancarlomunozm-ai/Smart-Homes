# 🔧 MEJORAS PENDIENTES - Smart Homes v1.2

## 1. Sistema de Invitaciones con Email ✉️

### Backend
- [ ] Crear endpoint POST /api/users/invite
- [ ] Generar token único de invitación (UUID)
- [ ] Guardar token en tabla `user_invitations`
- [ ] Enviar email con link de activación
- [ ] Crear endpoint GET /api/users/activate/:token
- [ ] Endpoint POST /api/users/set-password/:token

### Frontend
- [ ] Modificar formulario de invitación (sin campo password)
- [ ] Mostrar mensaje de éxito con "Email enviado"
- [ ] Crear página de activación de cuenta

## 2. Edición de Usuarios ✏️

### Backend
- [ ] Endpoint PUT /api/users/:id
- [ ] Validar permisos (solo admin)
- [ ] Actualizar datos de usuario

### Frontend
- [ ] Botón "Editar" en cada fila de usuario
- [ ] Modal/Form de edición
- [ ] Actualizar nombre, email, residencias

## 3. Fix Bug Crear Ticket 🐛

### Investigar
- [x] Revisar código handleCreateTicket
- [ ] Verificar endpoint backend /api/support/tickets
- [ ] Probar en consola del navegador
- [ ] Agregar mensajes de error

## 4. Vista Lista de Dispositivos 📋

### Backend
- [x] Ya existe GET /api/devices
- [ ] Agregar filtros (búsqueda, sistema, estado)

### Frontend
- [ ] Nuevo componente `DevicesList`
- [ ] Tabla con búsqueda
- [ ] Filtros por sistema, estado, residencia
- [ ] Click para ver detalles

## 5. Mejorar UI de Sistemas 🎨

### Frontend
- [ ] Aumentar tamaño de iconos (de 48px a 80px)
- [ ] Reducir padding de cards
- [ ] Ajustar tamaño de cuadros blancos

## 6. Agregar Dispositivos ➕

### Backend
- [ ] Endpoint POST /api/devices
- [ ] Validación de datos
- [ ] Crear evento device_added

### Frontend
- [ ] Botón "+ Agregar Dispositivo"
- [ ] Form completo con todos los campos
- [ ] Selector de sistema
- [ ] Validación de IP/MAC
