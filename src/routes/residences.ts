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

const residences = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Middleware de autenticación para todas las rutas
residences.use('/*', authMiddleware);

// Listar residencias (admin ve todas, cliente solo las asignadas)
residences.get('/', async (c) => {
  try {
    const user = c.get('user');
    const db = c.env.DB;

    let query: D1PreparedStatement;

    if (user.role === 'admin') {
      // Admin ve todas las residencias
      query = db.prepare(`
        SELECT 
          r.*,
          COUNT(d.id) as systems
        FROM residences r
        LEFT JOIN devices d ON r.id = d.residence_id
        GROUP BY r.id
        ORDER BY r.created_at DESC
      `);
    } else {
      // Cliente solo ve sus residencias asignadas
      query = db.prepare(`
        SELECT 
          r.*,
          COUNT(d.id) as systems
        FROM residences r
        INNER JOIN user_residences ur ON r.id = ur.residence_id
        LEFT JOIN devices d ON r.id = d.residence_id
        WHERE ur.user_id = ?
        GROUP BY r.id
        ORDER BY r.created_at DESC
      `).bind(user.userId);
    }

    const result = await query.all();

    return c.json({
      success: true,
      residences: result.results
    });

  } catch (error) {
    console.error('Get residences error:', error);
    return c.json({ error: 'Error al obtener residencias' }, 500);
  }
});

// Obtener una residencia específica
residences.get('/:id', async (c) => {
  try {
    const user = c.get('user');
    const residenceId = c.req.param('id');
    const db = c.env.DB;

    // Verificar acceso
    if (user.role === 'client') {
      const access = await db.prepare(
        'SELECT id FROM user_residences WHERE user_id = ? AND residence_id = ?'
      ).bind(user.userId, residenceId).first();

      if (!access) {
        return c.json({ error: 'Acceso denegado a esta residencia' }, 403);
      }
    }

    const residence = await db.prepare(
      'SELECT * FROM residences WHERE id = ?'
    ).bind(residenceId).first();

    if (!residence) {
      return c.json({ error: 'Residencia no encontrada' }, 404);
    }

    // Obtener dispositivos por sistema
    const devices = await db.prepare(
      'SELECT * FROM devices WHERE residence_id = ? ORDER BY system_id, name'
    ).bind(residenceId).all();

    // Obtener sistemas
    const systems = await db.prepare(
      'SELECT * FROM systems'
    ).all();

    const clients = await db.prepare(`
      SELECT pc.relationship, pc.is_primary, c.*
      FROM project_clients pc
      LEFT JOIN clients c ON pc.client_id = c.id
      WHERE pc.project_id = ?
      ORDER BY pc.is_primary DESC, pc.relationship ASC, c.display_name ASC
    `).bind(residenceId).all();

    return c.json({
      success: true,
      residence,
      devices: devices.results,
      systems: systems.results,
      clients: clients.results
    });

  } catch (error) {
    console.error('Get residence error:', error);
    return c.json({ error: 'Error al obtener residencia' }, 500);
  }
});

// Crear residencia (solo admin)
residences.post('/', requireAdmin, async (c) => {
  try {
    const { id, name, address, image, status, subscription_status, subscription_expires_at, development, property_manager, owner_name, project_type, client_name, client_company, billing_email, billing_phone, preferred_language, default_tax_rate, service_hour_rate_first, service_hour_rate_extra } = await c.req.json();
    const db = c.env.DB;

    if (!id || !name || !address) {
      return c.json({ error: 'Campos requeridos: id, name, address' }, 400);
    }

    const result = await db.prepare(`
      INSERT INTO residences (
        id, name, address, image, status, subscription_status, subscription_expires_at,
        development, property_manager, owner_name, project_type, client_name, client_company,
        billing_email, billing_phone, preferred_language, default_tax_rate,
        service_hour_rate_first, service_hour_rate_extra
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      name,
      address,
      image || 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80&w=1200',
      status || 'Operational',
      subscription_status || 'active',
      subscription_expires_at || null,
      development || null,
      property_manager || null,
      owner_name || null,
      project_type || 'house',
      client_name || owner_name || null,
      client_company || null,
      billing_email || null,
      billing_phone || null,
      preferred_language || 'es',
      Number(default_tax_rate ?? 0.16),
      Number(service_hour_rate_first ?? 150),
      Number(service_hour_rate_extra ?? 95)
    ).run();

    if (!result.success) {
      return c.json({ error: 'Error al crear residencia' }, 500);
    }

    return c.json({
      success: true,
      message: 'Residencia creada exitosamente',
      residenceId: id
    });

  } catch (error) {
    console.error('Create residence error:', error);
    return c.json({ error: 'Error al crear residencia' }, 500);
  }
});

// Actualizar residencia (solo admin)
residences.put('/:id', requireAdmin, async (c) => {
  try {
    const residenceId = c.req.param('id');
    const body = await c.req.json();
    const db = c.env.DB;

    const current = await db.prepare('SELECT * FROM residences WHERE id = ?').bind(residenceId).first();
    if (!current) {
      return c.json({ error: 'Residencia no encontrada' }, 404);
    }

    const result = await db.prepare(`
      UPDATE residences SET
        name = ?, address = ?, image = ?, status = ?, subscription_status = ?, subscription_expires_at = ?,
        development = ?, property_manager = ?, owner_name = ?, project_type = ?, client_name = ?,
        client_company = ?, billing_email = ?, billing_phone = ?, preferred_language = ?,
        default_tax_rate = ?, service_hour_rate_first = ?, service_hour_rate_extra = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(
      body.name ?? current.name,
      body.address ?? current.address,
      body.image ?? current.image,
      body.status ?? current.status,
      body.subscription_status ?? current.subscription_status,
      body.subscription_expires_at ?? current.subscription_expires_at,
      body.development ?? current.development,
      body.property_manager ?? current.property_manager,
      body.owner_name ?? current.owner_name,
      body.project_type ?? current.project_type,
      body.client_name ?? current.client_name,
      body.client_company ?? current.client_company,
      body.billing_email ?? current.billing_email,
      body.billing_phone ?? current.billing_phone,
      body.preferred_language ?? current.preferred_language,
      Number(body.default_tax_rate ?? current.default_tax_rate ?? 0.16),
      Number(body.service_hour_rate_first ?? current.service_hour_rate_first ?? 150),
      Number(body.service_hour_rate_extra ?? current.service_hour_rate_extra ?? 95),
      residenceId
    ).run();

    if (result.meta.changes === 0) {
      return c.json({ error: 'Residencia no encontrada' }, 404);
    }

    return c.json({
      success: true,
      message: 'Residencia actualizada exitosamente'
    });

  } catch (error) {
    console.error('Update residence error:', error);
    return c.json({ error: 'Error al actualizar residencia' }, 500);
  }
});

// Eliminar residencia (solo admin)
residences.delete('/:id', requireAdmin, async (c) => {
  try {
    const residenceId = c.req.param('id');
    const db = c.env.DB;

    const result = await db.prepare(
      'DELETE FROM residences WHERE id = ?'
    ).bind(residenceId).run();

    if (result.meta.changes === 0) {
      return c.json({ error: 'Residencia no encontrada' }, 404);
    }

    return c.json({
      success: true,
      message: 'Residencia eliminada exitosamente'
    });

  } catch (error) {
    console.error('Delete residence error:', error);
    return c.json({ error: 'Error al eliminar residencia' }, 500);
  }
});

// Asignar residencia a usuario (solo admin)
residences.post('/:id/assign', requireAdmin, async (c) => {
  try {
    const residenceId = c.req.param('id');
    const { userId } = await c.req.json();
    const db = c.env.DB;

    if (!userId) {
      return c.json({ error: 'userId requerido' }, 400);
    }

    const result = await db.prepare(
      'INSERT INTO user_residences (user_id, residence_id) VALUES (?, ?)'
    ).bind(userId, residenceId).run();

    if (!result.success) {
      return c.json({ error: 'Error al asignar residencia' }, 500);
    }

    return c.json({
      success: true,
      message: 'Residencia asignada exitosamente'
    });

  } catch (error) {
    console.error('Assign residence error:', error);
    return c.json({ error: 'Error al asignar residencia' }, 500);
  }
});

// Desasignar residencia de usuario (solo admin)
residences.delete('/:id/assign/:userId', requireAdmin, async (c) => {
  try {
    const residenceId = c.req.param('id');
    const userId = c.req.param('userId');
    const db = c.env.DB;

    const result = await db.prepare(
      'DELETE FROM user_residences WHERE user_id = ? AND residence_id = ?'
    ).bind(userId, residenceId).run();

    if (result.meta.changes === 0) {
      return c.json({ error: 'Asignación no encontrada' }, 404);
    }

    return c.json({
      success: true,
      message: 'Residencia desasignada exitosamente'
    });

  } catch (error) {
    console.error('Unassign residence error:', error);
    return c.json({ error: 'Error al desasignar residencia' }, 500);
  }
});

residences.post('/:id/clients', requireAdmin, async (c) => {
  try {
    const residenceId = c.req.param('id');
    const { client_id, relationship, is_primary } = await c.req.json();
    const db = c.env.DB;

    if (!client_id) {
      return c.json({ error: 'client_id requerido' }, 400);
    }

    if (is_primary) {
      await db.prepare('UPDATE project_clients SET is_primary = 0 WHERE project_id = ?').bind(residenceId).run();
    }

    await db.prepare(`
      INSERT INTO project_clients (project_id, client_id, relationship, is_primary)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(project_id, client_id, relationship) DO UPDATE SET is_primary = excluded.is_primary
    `).bind(residenceId, client_id, relationship || 'owner', is_primary ? 1 : 0).run();

    const client = await db.prepare('SELECT * FROM clients WHERE id = ?').bind(client_id).first();
    if (is_primary && client) {
      await db.prepare(`
        UPDATE residences SET
          owner_name = ?,
          client_name = ?,
          client_company = ?,
          billing_email = ?,
          billing_phone = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(
        client.display_name,
        client.display_name,
        client.company_name || null,
        client.billing_email || client.email || null,
        client.billing_phone || client.phone || null,
        residenceId
      ).run();
    }

    return c.json({ success: true, message: 'Cliente relacionado al proyecto' });
  } catch (error) {
    console.error('Assign project client error:', error);
    return c.json({ error: 'Error al relacionar cliente' }, 500);
  }
});

residences.delete('/:id/clients/:clientId/:relationship', requireAdmin, async (c) => {
  try {
    const residenceId = c.req.param('id');
    const clientId = c.req.param('clientId');
    const relationship = c.req.param('relationship');
    const db = c.env.DB;

    await db.prepare(
      'DELETE FROM project_clients WHERE project_id = ? AND client_id = ? AND relationship = ?'
    ).bind(residenceId, clientId, relationship).run();

    return c.json({ success: true, message: 'Relacion eliminada' });
  } catch (error) {
    console.error('Remove project client error:', error);
    return c.json({ error: 'Error al eliminar relacion' }, 500);
  }
});

export default residences;
