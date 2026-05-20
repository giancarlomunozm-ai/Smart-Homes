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

const sales = new Hono<{ Bindings: Bindings; Variables: Variables }>();

sales.use('/*', authMiddleware);

sales.get('/', async (c) => {
  try {
    const user = c.get('user');
    const db = c.env.DB;

    if (user.role !== 'admin') {
      return c.json({ error: 'Solo administradores pueden ver ventas' }, 403);
    }

    const records = await db.prepare(`
      SELECT sr.*, r.name as project_name, q.quote_number
      FROM sales_records sr
      LEFT JOIN residences r ON sr.project_id = r.id
      LEFT JOIN quotes q ON sr.quote_id = q.id
      ORDER BY sr.updated_at DESC, sr.created_at DESC
    `).all();

    const summary = await db.prepare(`
      SELECT
        COUNT(*) as total_records,
        SUM(expected_value) as total_expected,
        SUM(COALESCE(closed_value, 0)) as total_closed,
        SUM(CASE WHEN stage = 'quoted' THEN 1 ELSE 0 END) as quoted_count,
        SUM(CASE WHEN stage = 'signed' THEN 1 ELSE 0 END) as signed_count,
        SUM(CASE WHEN stage = 'paid' THEN 1 ELSE 0 END) as paid_count
      FROM sales_records
    `).first();

    return c.json({ success: true, records: records.results || [], summary });
  } catch (error) {
    console.error('Get sales error:', error);
    return c.json({ error: 'Error al obtener ventas' }, 500);
  }
});

export default sales;
