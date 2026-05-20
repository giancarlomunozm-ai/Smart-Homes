# Plan maestro — Módulo de Cotizaciones, Firma, Pagos y Ventas

## Estado
- Fase actual: **Fase 4 lista para iniciar**
- Proyecto: `Smart-Homes`
- Objetivo: incorporar módulo comercial y operativo para cotizaciones compartibles, firma, pago con Stripe, histórico de servicio y control de ventas, sin romper `smart-homes.pages.dev`.

## Fases
- [x] **Fase 0 — Descubrimiento y mapeo inicial**
  - acceso SSH al repo
  - inspección de arquitectura
  - validación de Cloudflare/Wrangler
  - mapa inicial de rutas, frontend y D1
- [x] **Fase 1 — Base de datos y backend base**
  - migraciones de cotizaciones, partidas, pricing settings, logs y ventas
  - rutas autenticadas para CRUD base de cotizaciones
  - rutas para pricing settings
  - rutas para historial de servicio
  - estructura base para sales records
- [x] **Fase 2 — UI interna admin**
  - vista global `Quotations`
  - tab `Quotes` por proyecto
  - editor base de cotizaciones
  - panel de tarifas base
- [x] **Fase 3 — Link público de cliente**
  - backend público por token agregado
  - selector ES/EN agregado
  - tracking de vistas agregado
  - ruta `/quote/:token` agregada
  - layout mobile friendly base validado por build
- [ ] **Fase 4 — Firma**
  - endpoint público `POST /api/public/quotes/:token/sign`
  - captura de firma/aceptación en `/quote/:token`
  - registro de IP, agente y timestamp
  - pendiente: validación final con datos reales y firma dibujada/canvas si se quiere subir de nivel
- [ ] **Fase 5 — Stripe**
  - checkout/payment link
  - webhook
  - cambio de estado a `paid`
- [ ] **Fase 6 — Sales dashboard**
  - pipeline comercial
  - KPIs
  - seguimiento de conversión
- [ ] **Fase 7 — Endurecimiento y optimización**
  - seguridad
  - refactor gradual del frontend monolítico
  - migración de archivos a R2

## Requerimientos funcionales aprobados
- crear cotizaciones de servicio
- generar link público compartible
- ver cotización en español o inglés
- firmar cotización
- pagar cotización con Stripe
- registrar histórico de servicios y logs por casa/proyecto
- soportar no solo casas, también restaurantes y hoteles
- llevar control comercial/ventas en segmento separado
- configurar tarifas base editables
  - primera hora en sitio: `150 USD + IVA`
  - horas extra en sitio: `95 USD + IVA`
- permitir partidas genéricas para productos y accesorios
- mantener diseño mobile friendly

## Decisiones de implementación
- mantener compatibilidad con entidad actual `residences`, pero usarla semánticamente como proyecto en el nuevo módulo
- construir Fase 1 en backend primero para no romper UX actual
- no meter Stripe ni firma en Fase 1; solo dejar estructura lista
- mantener lista de fases aquí mismo para continuidad operativa

## Modelo de datos propuesto
### Tabla `quotes`
- cotización maestra por proyecto
- status: `draft`, `sent`, `viewed`, `signed`, `paid`, `expired`, `cancelled`
- token público y datos de cliente
- montos, tarifas base, notas y referencia futura a Stripe/firma

### Tabla `quote_items`
- partidas de servicio, producto, accesorio o custom
- campos bilingües `title_es/title_en` y `description_es/description_en`

### Tabla `quote_views`
- tracking de visualización por link público

### Tabla `quote_signatures`
- estructura para firma futura

### Tabla `sales_records`
- pipeline comercial por cotización/proyecto

### Tabla `service_logs`
- eventos operativos y comerciales por proyecto

### Tabla `service_pricing_settings`
- tarifas configurables globales o por proyecto

## Rutas backend previstas
### autenticadas
- `GET /api/quotes`
- `GET /api/quotes/:id`
- `POST /api/quotes`
- `PUT /api/quotes/:id`
- `GET /api/quotes/project/:projectId`
- `POST /api/quotes/:id/items`
- `PUT /api/quotes/:id/items/:itemId`
- `DELETE /api/quotes/:id/items/:itemId`
- `GET /api/pricing-settings`
- `PUT /api/pricing-settings`
- `GET /api/service-history/project/:projectId`
- `GET /api/sales`

### públicas futuras
- `GET /api/public/quotes/:token`
- `POST /api/public/quotes/:token/sign`
- `POST /api/stripe/webhook`

## Orden recomendado
1. Fase 1 backend y persistencia
2. Fase 2 UI interna admin
3. Fase 3 link público cliente
4. Fase 4 firma
5. Fase 5 Stripe
6. Fase 6 ventas
7. Fase 7 endurecimiento

## Estado operativo
Este archivo es la referencia persistente para no perdernos. Cada avance debe reflejar qué fase está activa y cuáles faltan.
