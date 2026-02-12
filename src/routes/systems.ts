import { Hono } from 'hono';
import { authMiddleware, requireAdmin } from '../middleware/auth';
import type { JWTPayload } from '../utils/jwt';

type Bindings = {
  DB: D1Database;
  JWT_SECRET: string;
};

type Variables = {
  user: JWTPayload;
};

const systems = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Middleware de autenticación
systems.use('/*', authMiddleware);

// Listar todos los sistemas
systems.get('/', async (c) => {
  try {
    const db = c.env.DB;

    const result = await db.prepare(
      'SELECT * FROM systems ORDER BY name'
    ).all();

    return c.json({
      success: true,
      systems: result.results
    });

  } catch (error) {
    console.error('Get systems error:', error);
    return c.json({ error: 'Error al obtener sistemas' }, 500);
  }
});

// Obtener estadísticas de un sistema específico
systems.get('/:id/stats', async (c) => {
  try {
    const user = c.get('user');
    const systemId = c.req.param('id');
    const db = c.env.DB;

    let query: D1PreparedStatement;

    if (user.role === 'admin') {
      query = db.prepare(`
        SELECT 
          COUNT(*) as total_devices,
          COUNT(CASE WHEN status = 'Online' THEN 1 END) as online,
          COUNT(CASE WHEN status = 'Offline' THEN 1 END) as offline,
          COUNT(CASE WHEN status = 'Maintenance' THEN 1 END) as maintenance
        FROM devices
        WHERE system_id = ?
      `).bind(systemId);
    } else {
      query = db.prepare(`
        SELECT 
          COUNT(*) as total_devices,
          COUNT(CASE WHEN d.status = 'Online' THEN 1 END) as online,
          COUNT(CASE WHEN d.status = 'Offline' THEN 1 END) as offline,
          COUNT(CASE WHEN d.status = 'Maintenance' THEN 1 END) as maintenance
        FROM devices d
        INNER JOIN user_residences ur ON d.residence_id = ur.residence_id
        WHERE d.system_id = ? AND ur.user_id = ?
      `).bind(systemId, user.userId);
    }

    const stats = await query.first();

    return c.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Get system stats error:', error);
    return c.json({ error: 'Error al obtener estadísticas' }, 500);
  }
});

export default systems;
