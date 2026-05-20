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

const serviceHistory = new Hono<{ Bindings: Bindings; Variables: Variables }>();

serviceHistory.use('/*', authMiddleware);

serviceHistory.get('/project/:projectId', async (c) => {
  try {
    const user = c.get('user');
    const projectId = c.req.param('projectId');
    const db = c.env.DB;

    if (user.role === 'client') {
      const access = await db.prepare(
        'SELECT id FROM user_residences WHERE user_id = ? AND residence_id = ?'
      ).bind(user.userId, projectId).first();

      if (!access) {
        return c.json({ error: 'Acceso denegado a este proyecto' }, 403);
      }
    }

    const logs = await db.prepare(`
      SELECT sl.*, u.name as created_by_name, q.quote_number
      FROM service_logs sl
      LEFT JOIN users u ON sl.created_by = u.id
      LEFT JOIN quotes q ON sl.quote_id = q.id
      WHERE sl.project_id = ?
      ORDER BY sl.created_at DESC
    `).bind(projectId).all();

    return c.json({ success: true, logs: logs.results || [] });
  } catch (error) {
    console.error('Get service history error:', error);
    return c.json({ error: 'Error al obtener historial de servicio' }, 500);
  }
});

export default serviceHistory;
