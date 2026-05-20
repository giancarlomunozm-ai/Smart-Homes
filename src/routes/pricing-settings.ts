import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';
import type { JWTPayload } from '../utils/jwt';

type Bindings = {
  DB: D1Database;
  JWT_SECRET: string;
};

type Variables = {
  user: JWTPayload;
};

const pricingSettings = new Hono<{ Bindings: Bindings; Variables: Variables }>();

pricingSettings.use('/*', authMiddleware);

pricingSettings.get('/', async (c) => {
  try {
    const user = c.get('user');
    const db = c.env.DB;

    if (user.role !== 'admin') {
      return c.json({ error: 'Solo administradores pueden ver configuración de tarifas' }, 403);
    }

    const projectId = c.req.query('projectId');

    if (projectId) {
      const projectSetting = await db.prepare(`
        SELECT * FROM service_pricing_settings
        WHERE scope = 'project' AND project_id = ?
        ORDER BY updated_at DESC LIMIT 1
      `).bind(projectId).first();

      if (projectSetting) {
        return c.json({ success: true, setting: projectSetting });
      }
    }

    const globalSetting = await db.prepare(`
      SELECT * FROM service_pricing_settings
      WHERE scope = 'global' AND project_id IS NULL
      ORDER BY updated_at DESC LIMIT 1
    `).first();

    return c.json({ success: true, setting: globalSetting });
  } catch (error) {
    console.error('Get pricing settings error:', error);
    return c.json({ error: 'Error al obtener tarifas base' }, 500);
  }
});

pricingSettings.put('/', async (c) => {
  try {
    const user = c.get('user');
    const db = c.env.DB;

    if (user.role !== 'admin') {
      return c.json({ error: 'Solo administradores pueden editar tarifas' }, 403);
    }

    const {
      scope,
      project_id,
      currency,
      first_hour_rate,
      extra_hour_rate,
      tax_rate
    } = await c.req.json();

    const finalScope = scope || (project_id ? 'project' : 'global');

    const existing = await db.prepare(`
      SELECT id FROM service_pricing_settings
      WHERE scope = ? AND (
        (project_id IS NULL AND ? IS NULL) OR project_id = ?
      )
      ORDER BY updated_at DESC LIMIT 1
    `).bind(finalScope, project_id || null, project_id || null).first();

    if (existing) {
      await db.prepare(`
        UPDATE service_pricing_settings SET
          currency = ?,
          first_hour_rate = ?,
          extra_hour_rate = ?,
          tax_rate = ?,
          updated_by = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(
        currency || 'USD',
        Number(first_hour_rate || 150),
        Number(extra_hour_rate || 95),
        Number(tax_rate || 0.16),
        user.userId,
        existing.id
      ).run();
    } else {
      await db.prepare(`
        INSERT INTO service_pricing_settings (
          scope, project_id, currency, first_hour_rate, extra_hour_rate, tax_rate, updated_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(
        finalScope,
        project_id || null,
        currency || 'USD',
        Number(first_hour_rate || 150),
        Number(extra_hour_rate || 95),
        Number(tax_rate || 0.16),
        user.userId
      ).run();
    }

    if (project_id) {
      await db.prepare(`
        UPDATE residences SET
          service_hour_rate_first = ?,
          service_hour_rate_extra = ?,
          default_tax_rate = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(
        Number(first_hour_rate || 150),
        Number(extra_hour_rate || 95),
        Number(tax_rate || 0.16),
        project_id
      ).run();
    }

    return c.json({ success: true, message: 'Tarifas actualizadas exitosamente' });
  } catch (error) {
    console.error('Update pricing settings error:', error);
    return c.json({ error: 'Error al actualizar tarifas' }, 500);
  }
});

export default pricingSettings;
