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

const support = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Middleware de autenticación
support.use('/*', authMiddleware);

// Listar tickets de una residencia
support.get('/residence/:residenceId', async (c) => {
  try {
    const user = c.get('user');
    const residenceId = c.req.param('residenceId');
    const db = c.env.DB;

    // Verificar acceso a la residencia
    if (user.role === 'client') {
      const access = await db.prepare(
        'SELECT id FROM user_residences WHERE user_id = ? AND residence_id = ?'
      ).bind(user.userId, residenceId).first();

      if (!access) {
        return c.json({ error: 'Acceso denegado a esta residencia' }, 403);
      }
    }

    const result = await db.prepare(`
      SELECT 
        t.*,
        u.name as user_name,
        u.email as user_email,
        a.name as assigned_name
      FROM support_tickets t
      LEFT JOIN users u ON t.user_id = u.id
      LEFT JOIN users a ON t.assigned_to = a.id
      WHERE t.residence_id = ?
      ORDER BY 
        CASE t.status 
          WHEN 'open' THEN 1
          WHEN 'in_progress' THEN 2
          WHEN 'resolved' THEN 3
          WHEN 'closed' THEN 4
        END,
        t.created_at DESC
    `).bind(residenceId).all();

    return c.json({
      success: true,
      tickets: result.results
    });

  } catch (error) {
    console.error('Get tickets error:', error);
    return c.json({ error: 'Error al obtener tickets' }, 500);
  }
});

// Obtener detalles de un ticket con respuestas
support.get('/:ticketId', async (c) => {
  try {
    const user = c.get('user');
    const ticketId = c.req.param('ticketId');
    const db = c.env.DB;

    const ticket = await db.prepare(`
      SELECT 
        t.*,
        u.name as user_name,
        u.email as user_email,
        a.name as assigned_name
      FROM support_tickets t
      LEFT JOIN users u ON t.user_id = u.id
      LEFT JOIN users a ON t.assigned_to = a.id
      WHERE t.id = ?
    `).bind(ticketId).first();

    if (!ticket) {
      return c.json({ error: 'Ticket no encontrado' }, 404);
    }

    // Verificar acceso
    if (user.role === 'client') {
      const access = await db.prepare(
        'SELECT id FROM user_residences WHERE user_id = ? AND residence_id = ?'
      ).bind(user.userId, ticket.residence_id).first();

      if (!access) {
        return c.json({ error: 'Acceso denegado' }, 403);
      }
    }

    // Obtener respuestas
    const responses = await db.prepare(`
      SELECT 
        r.*,
        u.name as user_name,
        u.email as user_email,
        u.role as user_role
      FROM ticket_responses r
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.ticket_id = ?
      ORDER BY r.created_at ASC
    `).bind(ticketId).all();

    return c.json({
      success: true,
      ticket,
      responses: responses.results
    });

  } catch (error) {
    console.error('Get ticket error:', error);
    return c.json({ error: 'Error al obtener ticket' }, 500);
  }
});

// Crear nuevo ticket
support.post('/', async (c) => {
  try {
    const user = c.get('user');
    const { residence_id, title, description, priority, category } = await c.req.json();
    const db = c.env.DB;

    if (!residence_id || !title || !description) {
      return c.json({ error: 'Campos requeridos faltantes' }, 400);
    }

    // Verificar acceso a la residencia
    if (user.role === 'client') {
      const access = await db.prepare(
        'SELECT id FROM user_residences WHERE user_id = ? AND residence_id = ?'
      ).bind(user.userId, residence_id).first();

      if (!access) {
        return c.json({ error: 'Acceso denegado a esta residencia' }, 403);
      }
    }

    const result = await db.prepare(`
      INSERT INTO support_tickets (
        residence_id, user_id, title, description, priority, status, category
      ) VALUES (?, ?, ?, ?, ?, 'open', ?)
    `).bind(
      residence_id,
      user.userId,
      title,
      description,
      priority || 'medium',
      category || 'General'
    ).run();

    // Registrar evento
    await db.prepare(
      'INSERT INTO events (residence_id, user_id, event_type, description) VALUES (?, ?, ?, ?)'
    ).bind(
      residence_id,
      user.userId,
      'support_ticket_created',
      `Ticket creado: ${title}`
    ).run();

    return c.json({
      success: true,
      message: 'Ticket creado exitosamente',
      ticketId: result.meta.last_row_id
    });

  } catch (error) {
    console.error('Create ticket error:', error);
    return c.json({ error: 'Error al crear ticket' }, 500);
  }
});

// Agregar respuesta a ticket
support.post('/:ticketId/responses', async (c) => {
  try {
    const user = c.get('user');
    const ticketId = c.req.param('ticketId');
    const { message, is_internal } = await c.req.json();
    const db = c.env.DB;

    if (!message) {
      return c.json({ error: 'Mensaje requerido' }, 400);
    }

    // Verificar que el ticket existe y usuario tiene acceso
    const ticket = await db.prepare(
      'SELECT residence_id FROM support_tickets WHERE id = ?'
    ).bind(ticketId).first();

    if (!ticket) {
      return c.json({ error: 'Ticket no encontrado' }, 404);
    }

    if (user.role === 'client') {
      const access = await db.prepare(
        'SELECT id FROM user_residences WHERE user_id = ? AND residence_id = ?'
      ).bind(user.userId, ticket.residence_id).first();

      if (!access) {
        return c.json({ error: 'Acceso denegado' }, 403);
      }
    }

    await db.prepare(`
      INSERT INTO ticket_responses (ticket_id, user_id, message, is_internal)
      VALUES (?, ?, ?, ?)
    `).bind(ticketId, user.userId, message, is_internal || 0).run();

    // Actualizar timestamp del ticket
    await db.prepare(
      'UPDATE support_tickets SET updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).bind(ticketId).run();

    return c.json({
      success: true,
      message: 'Respuesta agregada exitosamente'
    });

  } catch (error) {
    console.error('Add response error:', error);
    return c.json({ error: 'Error al agregar respuesta' }, 500);
  }
});

// Actualizar estado de ticket
support.put('/:ticketId/status', async (c) => {
  try {
    const user = c.get('user');
    const ticketId = c.req.param('ticketId');
    const { status } = await c.req.json();
    const db = c.env.DB;

    // Solo admin puede cambiar estados
    if (user.role !== 'admin') {
      return c.json({ error: 'Solo administradores pueden cambiar estados' }, 403);
    }

    const updates: string[] = ['updated_at = CURRENT_TIMESTAMP'];
    if (status === 'resolved' || status === 'closed') {
      updates.push('resolved_at = CURRENT_TIMESTAMP');
    }

    await db.prepare(`
      UPDATE support_tickets 
      SET status = ?, ${updates.join(', ')}
      WHERE id = ?
    `).bind(status, ticketId).run();

    return c.json({
      success: true,
      message: 'Estado actualizado exitosamente'
    });

  } catch (error) {
    console.error('Update status error:', error);
    return c.json({ error: 'Error al actualizar estado' }, 500);
  }
});

// Asignar ticket a técnico
support.put('/:ticketId/assign', async (c) => {
  try {
    const user = c.get('user');
    const ticketId = c.req.param('ticketId');
    const { assigned_to } = await c.req.json();
    const db = c.env.DB;

    // Solo admin puede asignar
    if (user.role !== 'admin') {
      return c.json({ error: 'Solo administradores pueden asignar tickets' }, 403);
    }

    await db.prepare(`
      UPDATE support_tickets 
      SET assigned_to = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(assigned_to, ticketId).run();

    return c.json({
      success: true,
      message: 'Ticket asignado exitosamente'
    });

  } catch (error) {
    console.error('Assign ticket error:', error);
    return c.json({ error: 'Error al asignar ticket' }, 500);
  }
});

export default support;
