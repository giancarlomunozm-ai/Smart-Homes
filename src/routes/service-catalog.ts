import { Hono } from 'hono';
import { authMiddleware, requireAdmin } from '../middleware/auth';

type Bindings = {
  DB: D1Database;
  JWT_SECRET: string;
};

const serviceCatalog = new Hono<{ Bindings: Bindings }>();

serviceCatalog.use('/*', authMiddleware);

serviceCatalog.get('/', async (c) => {
  try {
    const includeInactive = c.req.query('includeInactive') === 'true';
    const result = includeInactive
      ? await c.env.DB.prepare('SELECT * FROM service_catalog ORDER BY active DESC, sort_order ASC, name_es ASC').all()
      : await c.env.DB.prepare('SELECT * FROM service_catalog WHERE active = 1 ORDER BY sort_order ASC, name_es ASC').all();
    return c.json({ success: true, services: result.results || [] });
  } catch (error) {
    console.error('Get service catalog error:', error);
    return c.json({ error: 'Error al obtener catalogo de servicios' }, 500);
  }
});

serviceCatalog.post('/', requireAdmin, async (c) => {
  try {
    const body = await c.req.json();
    if (!body.code || !body.name_es) return c.json({ error: 'code y name_es son requeridos' }, 400);
    const result = await c.env.DB.prepare(`
      INSERT INTO service_catalog (code, name_es, name_en, description_es, description_en, item_type, unit, default_quantity, default_unit_price, taxable, active, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      body.code,
      body.name_es,
      body.name_en || null,
      body.description_es || null,
      body.description_en || null,
      body.item_type || 'service',
      body.unit || 'hour',
      Number(body.default_quantity || 1),
      Number(body.default_unit_price || 0),
      body.taxable === false ? 0 : 1,
      body.active === false ? 0 : 1,
      Number(body.sort_order || 0)
    ).run();
    return c.json({ success: true, serviceId: result.meta.last_row_id });
  } catch (error) {
    console.error('Create service catalog error:', error);
    return c.json({ error: 'Error al crear servicio' }, 500);
  }
});

serviceCatalog.put('/:id', requireAdmin, async (c) => {
  try {
    const id = Number(c.req.param('id'));
    const current = await c.env.DB.prepare('SELECT * FROM service_catalog WHERE id = ?').bind(id).first();
    if (!current) return c.json({ error: 'Servicio no encontrado' }, 404);
    const body = await c.req.json();
    await c.env.DB.prepare(`
      UPDATE service_catalog SET
        code = ?, name_es = ?, name_en = ?, description_es = ?, description_en = ?,
        item_type = ?, unit = ?, default_quantity = ?, default_unit_price = ?,
        taxable = ?, active = ?, sort_order = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(
      body.code ?? current.code,
      body.name_es ?? current.name_es,
      body.name_en ?? current.name_en,
      body.description_es ?? current.description_es,
      body.description_en ?? current.description_en,
      body.item_type ?? current.item_type,
      body.unit ?? current.unit,
      Number(body.default_quantity ?? current.default_quantity),
      Number(body.default_unit_price ?? current.default_unit_price),
      body.taxable === false ? 0 : (body.taxable === true ? 1 : current.taxable),
      body.active === false ? 0 : (body.active === true ? 1 : current.active),
      Number(body.sort_order ?? current.sort_order),
      id
    ).run();
    return c.json({ success: true, message: 'Servicio actualizado' });
  } catch (error) {
    console.error('Update service catalog error:', error);
    return c.json({ error: 'Error al actualizar servicio' }, 500);
  }
});

export default serviceCatalog;
