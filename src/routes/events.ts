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

const events = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Middleware de autenticación
events.use('/*', authMiddleware);

// Obtener eventos de una residencia
events.get('/residence/:residenceId', async (c) => {
  try {
    const user = c.get('user');
    const residenceId = c.req.param('residenceId');
    const limit = parseInt(c.req.query('limit') || '50');
    const db = c.env.DB;

    // Verificar acceso
    if (user.role === 'client') {
      const access = await db.prepare(
        'SELECT id FROM user_residences WHERE user_id = ? AND residence_id = ?'
      ).bind(user.userId, residenceId).first();

      if (!access) {
        return c.json({ error: 'Acceso denegado' }, 403);
      }
    }

    const result = await db.prepare(`
      SELECT 
        e.*,
        d.name as device_name,
        u.name as user_name
      FROM events e
      LEFT JOIN devices d ON e.device_id = d.id
      LEFT JOIN users u ON e.user_id = u.id
      WHERE e.residence_id = ?
      ORDER BY e.created_at DESC
      LIMIT ?
    `).bind(residenceId, limit).all();

    return c.json({
      success: true,
      events: result.results
    });

  } catch (error) {
    console.error('Get events error:', error);
    return c.json({ error: 'Error al obtener eventos' }, 500);
  }
});

// Obtener eventos globales (solo admin)
events.get('/', async (c) => {
  try {
    const user = c.get('user');
    const limit = parseInt(c.req.query('limit') || '100');
    const db = c.env.DB;

    if (user.role !== 'admin') {
      return c.json({ error: 'Acceso denegado' }, 403);
    }

    const result = await db.prepare(`
      SELECT 
        e.*,
        r.name as residence_name,
        d.name as device_name,
        u.name as user_name
      FROM events e
      LEFT JOIN residences r ON e.residence_id = r.id
      LEFT JOIN devices d ON e.device_id = d.id
      LEFT JOIN users u ON e.user_id = u.id
      ORDER BY e.created_at DESC
      LIMIT ?
    `).bind(limit).all();

    return c.json({
      success: true,
      events: result.results
    });

  } catch (error) {
    console.error('Get all events error:', error);
    return c.json({ error: 'Error al obtener eventos' }, 500);
  }
});

export default events;
