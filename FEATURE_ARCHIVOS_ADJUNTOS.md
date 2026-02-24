# 📂 Sistema de Archivos Adjuntos

## ✅ Nueva Funcionalidad Implementada

### 🎯 **Pestaña "Documents" por Residencia**

Ahora cada residencia tiene una nueva pestaña **DOCUMENTS** donde puedes:
- ✅ **Subir archivos** (PDFs, imágenes, documentos)
- ✅ **Categorizar** (Topología, Contrato, Acta de Entrega, Manual, Factura, Otro)
- ✅ **Ver/Descargar** todos los documentos
- ✅ **Eliminar** archivos (solo admin)
- ✅ **Agregar descripción** opcional a cada archivo

---

## 📋 **Categorías de Archivos**

| Categoría | Ícono | Uso |
|-----------|-------|-----|
| **Topología** | 🗺️ | Diagramas de red, topologías de cableado |
| **Contrato** | 📄 | Contratos firmados con cliente |
| **Acta de Entrega** | 📦 | Documentos de entrega de obra |
| **Manual** | 📚 | Manuales de equipos, guías de usuario |
| **Factura** | 🧾 | Facturas, órdenes de compra |
| **Otro** | 📎 | Cualquier otro documento |

---

## 🎨 **Tipos de Archivo Soportados**

### **Imágenes**
- ✅ PNG (.png)
- ✅ JPEG (.jpg, .jpeg)
- ✅ GIF (.gif)

### **Documentos**
- ✅ PDF (.pdf)
- ✅ Word (.doc, .docx)
- ✅ Excel (.xls, .xlsx)

### **Límites**
- 📏 **Tamaño máximo**: 5MB por archivo
- 📁 **Almacenamiento**: Base64 en D1 (ilimitados archivos)

---

## 🚀 **Cómo Usar**

### **Subir un Archivo (Solo Admin)**

1. **Entra a una residencia** (ej: H-001)
2. **Click en pestaña "DOCUMENTS"**
3. **Click en "+ Subir Archivo"**
4. **Selecciona el archivo** (max 5MB)
5. **Elige categoría**: Topología, Contrato, etc.
6. **(Opcional) Agrega descripción**: Ej: "Topología actualizada Feb 2026"
7. **Click "Subir Archivo"**
8. ✅ **Listo!** El archivo aparece en la grid

### **Ver/Descargar un Archivo**

1. **Ve a la pestaña "DOCUMENTS"**
2. **Click en "Ver / Descargar"** en cualquier tarjeta
3. El archivo se abre en nueva pestaña o se descarga

### **Eliminar un Archivo (Solo Admin)**

1. **Ve a la tarjeta del archivo**
2. **Click en el ícono 🗑️** (arriba a la derecha)
3. **Confirma** la eliminación
4. ✅ **Eliminado!** Se registra en el timeline

---

## 📊 **Vista de la Pestaña Documents**

### **Cuando NO hay archivos:**
```
        📂
No hay documentos subidos
    
[Subir primer documento →]
```

### **Cuando hay archivos:**
```
┌─────────────────────┬─────────────────────┬─────────────────────┐
│  📕 🗺️         🗑️  │  🖼️ 📄         🗑️  │  📝 📦         🗑️  │
│                     │                     │                     │
│  Topologia_Red.pdf  │  Contrato_Firmado..│  Acta_Entrega.docx  │
│  [Topología]        │  [Contrato]         │  [Acta de Entrega]  │
│  1.2 MB             │  850 KB             │  250 KB             │
│                     │                     │                     │
│  "Topología..."     │  "Contrato con..."  │  "Acta firmada..."  │
│  Por: Admin         │  Por: Admin         │  Por: Admin         │
│  12/02/2026         │  12/02/2026         │  12/02/2026         │
│                     │                     │                     │
│  [Ver / Descargar]  │  [Ver / Descargar]  │  [Ver / Descargar]  │
└─────────────────────┴─────────────────────┴─────────────────────┘
```

---

## 🔧 **Implementación Técnica**

### **Backend**

**Nuevo archivo**: `src/routes/files.ts`

**Endpoints:**
- `GET /api/files/residence/:residenceId` - Listar archivos
- `POST /api/files/upload` - Subir archivo (base64)
- `DELETE /api/files/:fileId` - Eliminar archivo

**Nueva tabla**: `residence_files`
```sql
CREATE TABLE residence_files (
  id INTEGER PRIMARY KEY,
  residence_id TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,      -- pdf, image, document
  file_category TEXT NOT NULL,  -- topology, contract, delivery, etc.
  file_url TEXT NOT NULL,       -- Data URL (base64)
  file_size INTEGER,
  mime_type TEXT,
  description TEXT,
  uploaded_by INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### **Frontend**

**Nuevo componente**: `DocumentsTab` en `public/app.js`

**Funcionalidades:**
- Upload de archivos con FileReader API
- Conversión a base64
- Validación de tamaño (5MB)
- Grid responsive con tarjetas
- Íconos por tipo y categoría
- Formato de tamaño legible (KB/MB)

---

## 📈 **Registro de Eventos**

Cada acción se registra automáticamente en el timeline:

### **Subir archivo:**
```
📎 Archivo subido: Topologia_Red.pdf (topology)
Por: Smart Spaces Admin
12/02/2026 - 10:30
```

### **Eliminar archivo:**
```
🗑️ Archivo eliminado: Contrato_Viejo.pdf
Por: Smart Spaces Admin
12/02/2026 - 11:45
```

---

## 🎯 **Casos de Uso Comunes**

### **Caso 1: Topología de Red**
```
Cliente: "¿Cómo está configurada mi red?"
→ Admin entra a H-001 → Documents
→ Descarga "Topologia_Red_2026.pdf"
→ Se la envía al cliente
```

### **Caso 2: Acta de Entrega**
```
Auditoría necesita el acta de entrega
→ Admin entra a H-002 → Documents
→ Filtra por "Acta de Entrega"
→ Descarga documento firmado
```

### **Caso 3: Manual de Equipo**
```
Técnico va a dar mantenimiento
→ Admin sube "Manual_Switch_Cisco.pdf"
→ Categoría: Manual
→ Descripción: "Manual del switch principal"
→ Técnico lo descarga antes de ir
```

---

## ⚙️ **Configuración Técnica**

### **Almacenamiento**
- **Método**: Base64 en Data URLs
- **Tabla**: D1 (Cloudflare SQLite)
- **Ventajas**: 
  - ✅ Sin costos adicionales
  - ✅ Sin configuración de R2
  - ✅ Funciona inmediatamente
- **Limitación**: 5MB por archivo (suficiente para PDFs y docs)

### **Alternativa Futura (Archivos Grandes)**
Si necesitas subir archivos > 5MB:
- Usar Cloudflare R2 (S3-compatible)
- Upload directo con URLs firmadas
- Costo: ~$0.015 GB/mes (muy barato)

---

## 📊 **Estadísticas del Feature**

| Métrica | Valor |
|---------|-------|
| **Archivos modificados** | 5 |
| **Líneas agregadas** | +748 |
| **Nuevo endpoint** | `/api/files` |
| **Nuevo componente** | `DocumentsTab` |
| **Nueva tabla D1** | `residence_files` |
| **Migración** | `0003_add_residence_files.sql` |
| **Bundle size** | 58.08 kB (+3.2 kB) |

---

## 🚀 **Deployment**

### **Producción**
- **URL**: https://smart-homes.pages.dev
- **Deployment**: https://1d52c177.smart-homes.pages.dev
- **Commit**: `b79bc9f`
- **Fecha**: 24 de febrero, 2026 - 19:29 UTC

### **Migraciones**
- ✅ Local: Aplicada
- ✅ Producción: Aplicada

---

## ✅ **Testing Verificado**

- ✅ Pestaña "Documents" visible en residencias
- ✅ Botón "Subir Archivo" solo para admin
- ✅ Upload de PDF funciona
- ✅ Upload de imágenes funciona
- ✅ Validación de 5MB funciona
- ✅ Categorías se guardan correctamente
- ✅ Descarga de archivos funciona
- ✅ Eliminación con confirmación funciona
- ✅ Eventos se registran en timeline
- ✅ Grid responsive funciona

---

## 📝 **Próximas Mejoras Opcionales**

1. **Vista previa de imágenes** - Lightbox para ver imágenes sin descargar
2. **Búsqueda/Filtros** - Buscar por nombre o categoría
3. **Versiones** - Guardar múltiples versiones del mismo documento
4. **R2 Storage** - Para archivos > 5MB
5. **OCR** - Extraer texto de PDFs escaneados
6. **Compartir** - Links públicos temporales para clientes

---

## 🎉 **Resumen**

Sistema de archivos **100% funcional** y desplegado en producción:

✅ **Subir PDFs, imágenes y documentos**  
✅ **6 categorías predefinidas** (Topología, Contrato, etc.)  
✅ **Límite de 5MB por archivo**  
✅ **Solo admins pueden subir/eliminar**  
✅ **Todos pueden ver/descargar**  
✅ **Eventos registrados en timeline**  
✅ **Grid visual con íconos**  

**URL de producción**: https://smart-homes.pages.dev  
**Pestaña**: DOCUMENTS (al lado de Systems, History, Support)

---

**Smart Homes - Infrastructure OS**  
*Feature desplegado el 24 de febrero, 2026*
