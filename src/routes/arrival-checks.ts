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

const arrivalChecks = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Auth middleware
arrivalChecks.use('/*', authMiddleware);

// GET /api/arrival-checks - Listar todos los arrival checks
arrivalChecks.get('/', async (c) => {
  const user = c.get('user');
  const db = c.env.DB;

  try {
    let query;
    if (user.role === 'admin') {
      query = db.prepare(`
        SELECT ac.*, r.name as residence_name, u.name as performed_by_name
        FROM arrival_checks ac
        LEFT JOIN residences r ON ac.residence_id = r.id
        LEFT JOIN users u ON ac.performed_by = u.id
        ORDER BY ac.scheduled_date DESC, ac.scheduled_time DESC
      `);
    } else {
      query = db.prepare(`
        SELECT ac.*, r.name as residence_name, u.name as performed_by_name
        FROM arrival_checks ac
        LEFT JOIN residences r ON ac.residence_id = r.id
        LEFT JOIN users u ON ac.performed_by = u.id
        INNER JOIN user_residences ur ON ac.residence_id = ur.residence_id
        WHERE ur.user_id = ?
        ORDER BY ac.scheduled_date DESC, ac.scheduled_time DESC
      `).bind(user.userId);
    }

    const { results: checks } = await query.all();
    return c.json({ success: true, checks });
  } catch (error: any) {
    console.error('Error fetching arrival checks:', error);
    return c.json({ success: false, error: 'Error al obtener arrival checks' }, 500);
  }
});

// GET /api/arrival-checks/:id - Obtener arrival check específico
arrivalChecks.get('/:id', async (c) => {
  const id = c.req.param('id');
  const db = c.env.DB;

  try {
    const check = await db.prepare(`
      SELECT ac.*, r.name as residence_name, u.name as performed_by_name
      FROM arrival_checks ac
      LEFT JOIN residences r ON ac.residence_id = r.id
      LEFT JOIN users u ON ac.performed_by = u.id
      WHERE ac.id = ?
    `).bind(id).first();

    if (!check) {
      return c.json({ success: false, error: 'Arrival check no encontrado' }, 404);
    }

    return c.json({ success: true, check });
  } catch (error: any) {
    console.error('Error fetching arrival check:', error);
    return c.json({ success: false, error: 'Error al obtener arrival check' }, 500);
  }
});

// GET /api/arrival-checks/:id/items - Obtener items del checklist
arrivalChecks.get('/:id/items', async (c) => {
  const id = c.req.param('id');
  const db = c.env.DB;

  try {
    const { results: items } = await db.prepare(`
      SELECT aci.*, u.name as checked_by_name
      FROM arrival_check_items aci
      LEFT JOIN users u ON aci.checked_by = u.id
      WHERE aci.arrival_check_id = ?
      ORDER BY aci.room, aci.system, aci.id
    `).bind(id).all();

    return c.json({ success: true, items });
  } catch (error: any) {
    console.error('Error fetching arrival check items:', error);
    return c.json({ success: false, error: 'Error al obtener items' }, 500);
  }
});

// PATCH /api/arrival-checks/:checkId/items/:itemId - Actualizar item
arrivalChecks.patch('/:checkId/items/:itemId', async (c) => {
  const { checkId, itemId } = c.req.param();
  const user = c.get('user');
  const { installed, functional, notes } = await c.req.json();
  const db = c.env.DB;

  try {
    await db.prepare(`
      UPDATE arrival_check_items
      SET installed = ?, functional = ?, notes = ?, checked_at = CURRENT_TIMESTAMP, checked_by = ?
      WHERE id = ? AND arrival_check_id = ?
    `).bind(
      installed ? 1 : 0,
      functional ? 1 : 0,
      notes || null,
      user.userId,
      itemId,
      checkId
    ).run();

    return c.json({ success: true, message: 'Item actualizado' });
  } catch (error: any) {
    console.error('Error updating item:', error);
    return c.json({ success: false, error: 'Error al actualizar item' }, 500);
  }
});

// PATCH /api/arrival-checks/:id - Actualizar estado del arrival check
arrivalChecks.patch('/:id', async (c) => {
  const id = c.req.param('id');
  const user = c.get('user');
  const { status, notes } = await c.req.json();
  const db = c.env.DB;

  try {
    let updateFields = ['status = ?'];
    let params: any[] = [status];

    if (notes !== undefined) {
      updateFields.push('notes = ?');
      params.push(notes);
    }

    if (status === 'in_progress') {
      updateFields.push('started_at = CURRENT_TIMESTAMP');
      updateFields.push('performed_by = ?');
      params.push(user.userId);
    } else if (status === 'completed') {
      updateFields.push('completed_at = CURRENT_TIMESTAMP');
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);

    await db.prepare(`
      UPDATE arrival_checks
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `).bind(...params).run();

    return c.json({ success: true, message: 'Arrival check actualizado' });
  } catch (error: any) {
    console.error('Error updating arrival check:', error);
    return c.json({ success: false, error: 'Error al actualizar arrival check' }, 500);
  }
});

export default arrivalChecks;
