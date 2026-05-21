import { Hono } from 'hono';
import { authMiddleware, requireAdmin } from '../middleware/auth';

type Bindings = {
  DB: D1Database;
  JWT_SECRET: string;
};

const clients = new Hono<{ Bindings: Bindings }>();

clients.use('/*', authMiddleware);

clients.get('/', async (c) => {
  try {
    const search = c.req.query('search') || '';
    const db = c.env.DB;
    const like = `%${search}%`;
    const result = search
      ? await db.prepare(`
          SELECT c.*,
            COUNT(DISTINCT pc.project_id) as project_count,
            GROUP_CONCAT(DISTINCT pc.project_id) as project_ids,
            GROUP_CONCAT(DISTINCT r.name) as project_names
          FROM clients c
          LEFT JOIN project_clients pc ON c.id = pc.client_id
          LEFT JOIN residences r ON pc.project_id = r.id
          WHERE c.display_name LIKE ? OR c.company_name LIKE ? OR c.email LIKE ? OR c.phone LIKE ?
          GROUP BY c.id
          ORDER BY c.updated_at DESC, c.display_name ASC
        `).bind(like, like, like, like).all()
      : await db.prepare(`
          SELECT c.*,
            COUNT(DISTINCT pc.project_id) as project_count,
            GROUP_CONCAT(DISTINCT pc.project_id) as project_ids,
            GROUP_CONCAT(DISTINCT r.name) as project_names
          FROM clients c
          LEFT JOIN project_clients pc ON c.id = pc.client_id
          LEFT JOIN residences r ON pc.project_id = r.id
          GROUP BY c.id
          ORDER BY c.updated_at DESC, c.display_name ASC
        `).all();

    return c.json({ success: true, clients: result.results || [] });
  } catch (error) {
    console.error('Get clients error:', error);
    return c.json({ error: 'Error al obtener clientes' }, 500);
  }
});

clients.get('/:id', async (c) => {
  try {
    const id = Number(c.req.param('id'));
    const db = c.env.DB;
    const client = await db.prepare('SELECT * FROM clients WHERE id = ?').bind(id).first();
    if (!client) return c.json({ error: 'Cliente no encontrado' }, 404);

    const projects = await db.prepare(`
      SELECT pc.*, r.name as project_name, r.address
      FROM project_clients pc
      LEFT JOIN residences r ON pc.project_id = r.id
      WHERE pc.client_id = ?
      ORDER BY pc.is_primary DESC, r.name ASC
    `).bind(id).all();

    return c.json({ success: true, client, projects: projects.results || [] });
  } catch (error) {
    console.error('Get client error:', error);
    return c.json({ error: 'Error al obtener cliente' }, 500);
  }
});

clients.post('/', requireAdmin, async (c) => {
  try {
    const db = c.env.DB;
    const body = await c.req.json();
    const displayName = body.display_name || `${body.first_name || ''} ${body.last_name || ''}`.trim() || body.company_name;
    if (!displayName) return c.json({ error: 'Nombre requerido' }, 400);

    const result = await db.prepare(`
      INSERT INTO clients (
        display_name, first_name, last_name, company_name, email, phone,
        billing_email, billing_phone, preferred_language, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      displayName,
      body.first_name || null,
      body.last_name || null,
      body.company_name || null,
      body.email || null,
      body.phone || null,
      body.billing_email || body.email || null,
      body.billing_phone || body.phone || null,
      body.preferred_language || 'es',
      body.notes || null
    ).run();

    return c.json({ success: true, clientId: result.meta.last_row_id });
  } catch (error) {
    console.error('Create client error:', error);
    return c.json({ error: 'Error al crear cliente' }, 500);
  }
});

clients.put('/:id', requireAdmin, async (c) => {
  try {
    const id = Number(c.req.param('id'));
    const db = c.env.DB;
    const current = await db.prepare('SELECT * FROM clients WHERE id = ?').bind(id).first();
    if (!current) return c.json({ error: 'Cliente no encontrado' }, 404);

    const body = await c.req.json();
    await db.prepare(`
      UPDATE clients SET
        display_name = ?, first_name = ?, last_name = ?, company_name = ?,
        email = ?, phone = ?, billing_email = ?, billing_phone = ?,
        preferred_language = ?, notes = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(
      body.display_name ?? current.display_name,
      body.first_name ?? current.first_name,
      body.last_name ?? current.last_name,
      body.company_name ?? current.company_name,
      body.email ?? current.email,
      body.phone ?? current.phone,
      body.billing_email ?? current.billing_email,
      body.billing_phone ?? current.billing_phone,
      body.preferred_language ?? current.preferred_language,
      body.notes ?? current.notes,
      id
    ).run();

    return c.json({ success: true, message: 'Cliente actualizado' });
  } catch (error) {
    console.error('Update client error:', error);
    return c.json({ error: 'Error al actualizar cliente' }, 500);
  }
});

clients.delete('/:id', requireAdmin, async (c) => {
  try {
    const id = Number(c.req.param('id'));
    const db = c.env.DB;
    const linked = await db.prepare('SELECT COUNT(*) as count FROM project_clients WHERE client_id = ?').bind(id).first();
    if (Number(linked?.count || 0) > 0) {
      return c.json({ error: 'No se puede eliminar un cliente relacionado con proyectos. Quita las relaciones primero.' }, 409);
    }
    await db.prepare('DELETE FROM clients WHERE id = ?').bind(id).run();
    return c.json({ success: true, message: 'Cliente eliminado' });
  } catch (error) {
    console.error('Delete client error:', error);
    return c.json({ error: 'Error al eliminar cliente' }, 500);
  }
});

export default clients;
