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

const quotes = new Hono<{ Bindings: Bindings; Variables: Variables }>();

quotes.use('/*', authMiddleware);

function randomToken() {
  return crypto.randomUUID().replace(/-/g, '');
}

function buildQuoteNumber() {
  const year = new Date().getFullYear();
  const short = crypto.randomUUID().split('-')[0].toUpperCase();
  return `Q-${year}-${short}`;
}

async function recalcQuote(db: D1Database, quoteId: number) {
  const items = await db.prepare(
    'SELECT quantity, unit_price, taxable FROM quote_items WHERE quote_id = ?'
  ).bind(quoteId).all();

  const quote = await db.prepare(
    'SELECT tax_rate FROM quotes WHERE id = ?'
  ).bind(quoteId).first();

  const subtotal = (items.results || []).reduce((sum: number, item: any) => {
    return sum + (Number(item.quantity) * Number(item.unit_price));
  }, 0);

  const taxableSubtotal = (items.results || []).reduce((sum: number, item: any) => {
    const line = Number(item.quantity) * Number(item.unit_price);
    return sum + (item.taxable ? line : 0);
  }, 0);

  const taxRate = Number(quote?.tax_rate || 0.16);
  const taxAmount = taxableSubtotal * taxRate;
  const total = subtotal + taxAmount;

  await db.prepare(`
    UPDATE quotes
    SET subtotal = ?, tax_amount = ?, total = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(subtotal, taxAmount, total, quoteId).run();

  return { subtotal, taxAmount, total };
}

async function logServiceEvent(db: D1Database, projectId: string, quoteId: number | null, eventType: string, description: string, createdBy?: number, metadata?: any) {
  await db.prepare(`
    INSERT INTO service_logs (project_id, quote_id, event_type, description, metadata, created_by)
    VALUES (?, ?, ?, ?, ?, ?)
  `).bind(
    projectId,
    quoteId,
    eventType,
    description,
    metadata ? JSON.stringify(metadata) : null,
    createdBy || null
  ).run();
}

quotes.get('/', async (c) => {
  try {
    const user = c.get('user');
    const db = c.env.DB;

    let result;
    if (user.role === 'admin') {
      result = await db.prepare(`
        SELECT q.*, r.name as project_name
        FROM quotes q
        LEFT JOIN residences r ON q.project_id = r.id
        ORDER BY q.created_at DESC
      `).all();
    } else {
      result = await db.prepare(`
        SELECT q.*, r.name as project_name
        FROM quotes q
        INNER JOIN user_residences ur ON q.project_id = ur.residence_id
        LEFT JOIN residences r ON q.project_id = r.id
        WHERE ur.user_id = ?
        ORDER BY q.created_at DESC
      `).bind(user.userId).all();
    }

    return c.json({ success: true, quotes: result.results || [] });
  } catch (error) {
    console.error('Get quotes error:', error);
    return c.json({ error: 'Error al obtener cotizaciones' }, 500);
  }
});

quotes.get('/project/:projectId', async (c) => {
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

    const result = await db.prepare(`
      SELECT * FROM quotes
      WHERE project_id = ?
      ORDER BY created_at DESC
    `).bind(projectId).all();

    return c.json({ success: true, quotes: result.results || [] });
  } catch (error) {
    console.error('Get project quotes error:', error);
    return c.json({ error: 'Error al obtener cotizaciones del proyecto' }, 500);
  }
});

quotes.get('/:id', async (c) => {
  try {
    const user = c.get('user');
    const quoteId = Number(c.req.param('id'));
    const db = c.env.DB;

    const quote = await db.prepare(`
      SELECT q.*, r.name as project_name
      FROM quotes q
      LEFT JOIN residences r ON q.project_id = r.id
      WHERE q.id = ?
    `).bind(quoteId).first();

    if (!quote) {
      return c.json({ error: 'Cotización no encontrada' }, 404);
    }

    if (user.role === 'client') {
      const access = await db.prepare(
        'SELECT id FROM user_residences WHERE user_id = ? AND residence_id = ?'
      ).bind(user.userId, quote.project_id).first();

      if (!access) {
        return c.json({ error: 'Acceso denegado' }, 403);
      }
    }

    const items = await db.prepare(
      'SELECT * FROM quote_items WHERE quote_id = ? ORDER BY sort_order ASC, id ASC'
    ).bind(quoteId).all();

    return c.json({ success: true, quote, items: items.results || [] });
  } catch (error) {
    console.error('Get quote detail error:', error);
    return c.json({ error: 'Error al obtener cotización' }, 500);
  }
});

quotes.post('/', async (c) => {
  try {
    const user = c.get('user');
    const db = c.env.DB;
    const body = await c.req.json();
    const {
      project_id,
      title,
      description,
      client_name,
      client_email,
      client_id,
      ticket_id,
      language_default,
      notes_client_es,
      notes_client_en,
      notes_internal,
      estimated_hours_first,
      estimated_hours_extra,
      currency
    } = body;

    if (!project_id || !title) {
      return c.json({ error: 'Campos requeridos: project_id, title' }, 400);
    }

    if (user.role === 'client') {
      return c.json({ error: 'Solo administradores pueden crear cotizaciones' }, 403);
    }

    const project = await db.prepare(`
      SELECT r.id, r.client_name, r.billing_email, r.default_tax_rate, r.service_hour_rate_first,
        r.service_hour_rate_extra, r.preferred_language,
        c.id as primary_client_id, c.display_name as primary_client_name, c.email as primary_client_email, c.billing_email as primary_billing_email
      FROM residences r
      LEFT JOIN project_clients pc ON r.id = pc.project_id AND pc.is_primary = 1
      LEFT JOIN clients c ON pc.client_id = c.id
      WHERE r.id = ?
    `).bind(project_id).first();

    if (!project) {
      return c.json({ error: 'Proyecto no encontrado' }, 404);
    }

    const quoteNumber = buildQuoteNumber();
    const publicToken = randomToken();
    const taxRate = Number(project.default_tax_rate || 0.16);
    const firstRate = Number(project.service_hour_rate_first || 150);
    const extraRate = Number(project.service_hour_rate_extra || 95);

    const result = await db.prepare(`
      INSERT INTO quotes (
        project_id, quote_number, title, description, status, language_default, currency,
        tax_rate, first_hour_rate, extra_hour_rate,
        estimated_hours_first, estimated_hours_extra,
        client_name, client_email, client_id, ticket_id, public_token,
        notes_client_es, notes_client_en, notes_internal,
        created_by
      ) VALUES (?, ?, ?, ?, 'draft', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      project_id,
      quoteNumber,
      title,
      description || null,
      language_default || project.preferred_language || 'es',
      currency || 'USD',
      taxRate,
      firstRate,
      extraRate,
      Number(estimated_hours_first || 1),
      Number(estimated_hours_extra || 0),
      client_name || project.primary_client_name || project.client_name || null,
      client_email || project.primary_billing_email || project.primary_client_email || project.billing_email || null,
      client_id || project.primary_client_id || null,
      ticket_id || null,
      publicToken,
      notes_client_es || null,
      notes_client_en || null,
      notes_internal || null,
      user.userId
    ).run();

    const quoteId = Number(result.meta.last_row_id);

    await db.prepare(`
      INSERT INTO sales_records (quote_id, project_id, client_name, stage, expected_value, owner_user_id)
      VALUES (?, ?, ?, 'quoted', 0, ?)
    `).bind(quoteId, project_id, client_name || project.primary_client_name || project.client_name || null, user.userId).run();

    await logServiceEvent(db, project_id, quoteId, 'quote_created', `Cotización ${quoteNumber} creada`, user.userId, { title });

    return c.json({
      success: true,
      message: 'Cotización creada exitosamente',
      quoteId,
      quoteNumber,
      publicToken
    });
  } catch (error) {
    console.error('Create quote error:', error);
    return c.json({ error: 'Error al crear cotización' }, 500);
  }
});

quotes.put('/:id', async (c) => {
  try {
    const user = c.get('user');
    const quoteId = Number(c.req.param('id'));
    const db = c.env.DB;
    const body = await c.req.json();

    if (user.role === 'client') {
      return c.json({ error: 'Solo administradores pueden editar cotizaciones' }, 403);
    }

    const existing = await db.prepare('SELECT * FROM quotes WHERE id = ?').bind(quoteId).first();
    if (!existing) {
      return c.json({ error: 'Cotización no encontrada' }, 404);
    }

    const {
      title,
      description,
      status,
      language_default,
      currency,
      tax_rate,
      first_hour_rate,
      extra_hour_rate,
      estimated_hours_first,
      estimated_hours_extra,
      client_name,
      client_email,
      client_id,
      ticket_id,
      notes_internal,
      notes_client_es,
      notes_client_en,
      public_expires_at
    } = body;

    await db.prepare(`
      UPDATE quotes SET
        title = ?,
        description = ?,
        status = ?,
        language_default = ?,
        currency = ?,
        tax_rate = ?,
        first_hour_rate = ?,
        extra_hour_rate = ?,
        estimated_hours_first = ?,
        estimated_hours_extra = ?,
        client_name = ?,
        client_email = ?,
        client_id = ?,
        ticket_id = ?,
        notes_internal = ?,
        notes_client_es = ?,
        notes_client_en = ?,
        public_expires_at = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(
      title || existing.title,
      description ?? existing.description,
      status || existing.status,
      language_default || existing.language_default,
      currency || existing.currency,
      Number(tax_rate ?? existing.tax_rate),
      Number(first_hour_rate ?? existing.first_hour_rate),
      Number(extra_hour_rate ?? existing.extra_hour_rate),
      Number(estimated_hours_first ?? existing.estimated_hours_first),
      Number(estimated_hours_extra ?? existing.estimated_hours_extra),
      client_name ?? existing.client_name,
      client_email ?? existing.client_email,
      client_id ?? existing.client_id,
      ticket_id ?? existing.ticket_id,
      notes_internal ?? existing.notes_internal,
      notes_client_es ?? existing.notes_client_es,
      notes_client_en ?? existing.notes_client_en,
      public_expires_at ?? existing.public_expires_at,
      quoteId
    ).run();

    const totals = await recalcQuote(db, quoteId);

    await db.prepare(`
      UPDATE sales_records SET expected_value = ?, updated_at = CURRENT_TIMESTAMP WHERE quote_id = ?
    `).bind(totals.total, quoteId).run();

    if (status) {
      if (status === 'paid') {
        await db.prepare('UPDATE quotes SET paid_at = COALESCE(paid_at, CURRENT_TIMESTAMP) WHERE id = ?').bind(quoteId).run();
        await db.prepare(`
          UPDATE sales_records SET stage = 'paid', expected_value = ?, closed_value = ?, updated_at = CURRENT_TIMESTAMP WHERE quote_id = ?
        `).bind(totals.total, totals.total, quoteId).run();
      } else if (status === 'signed') {
        await db.prepare("UPDATE sales_records SET stage = 'signed', expected_value = ?, updated_at = CURRENT_TIMESTAMP WHERE quote_id = ?").bind(totals.total, quoteId).run();
      } else if (status === 'cancelled' || status === 'expired') {
        await db.prepare("UPDATE sales_records SET stage = 'lost', updated_at = CURRENT_TIMESTAMP WHERE quote_id = ?").bind(quoteId).run();
      } else {
        await db.prepare("UPDATE sales_records SET stage = 'quoted', expected_value = ?, updated_at = CURRENT_TIMESTAMP WHERE quote_id = ?").bind(totals.total, quoteId).run();
      }
    }

    await logServiceEvent(db, existing.project_id as string, quoteId, 'quote_updated', `Cotización ${existing.quote_number} actualizada`, user.userId, { status: status || existing.status });

    return c.json({ success: true, message: 'Cotización actualizada', totals });
  } catch (error) {
    console.error('Update quote error:', error);
    return c.json({ error: 'Error al actualizar cotización' }, 500);
  }
});

quotes.post('/:id/items', async (c) => {
  try {
    const user = c.get('user');
    const quoteId = Number(c.req.param('id'));
    const db = c.env.DB;
    const body = await c.req.json();

    if (user.role === 'client') {
      return c.json({ error: 'Solo administradores pueden editar partidas' }, 403);
    }

    const quote = await db.prepare('SELECT * FROM quotes WHERE id = ?').bind(quoteId).first();
    if (!quote) {
      return c.json({ error: 'Cotización no encontrada' }, 404);
    }

    const {
      sort_order,
      item_type,
      title_es,
      title_en,
      description_es,
      description_en,
      quantity,
      unit,
      unit_price,
      taxable,
      service_catalog_id
    } = body;

    if (!title_es) {
      return c.json({ error: 'title_es es requerido' }, 400);
    }

    const qty = Number(quantity || 1);
    const unitPrice = Number(unit_price || 0);
    const lineTotal = qty * unitPrice;

    const result = await db.prepare(`
      INSERT INTO quote_items (
        quote_id, sort_order, item_type, title_es, title_en,
        description_es, description_en, quantity, unit, unit_price, taxable, line_total
        , service_catalog_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      quoteId,
      Number(sort_order || 0),
      item_type || 'service',
      title_es,
      title_en || null,
      description_es || null,
      description_en || null,
      qty,
      unit || 'unit',
      unitPrice,
      taxable === false ? 0 : 1,
      lineTotal,
      service_catalog_id || null
    ).run();

    const totals = await recalcQuote(db, quoteId);
    await db.prepare('UPDATE sales_records SET expected_value = ?, updated_at = CURRENT_TIMESTAMP WHERE quote_id = ?').bind(totals.total, quoteId).run();
    await logServiceEvent(db, quote.project_id as string, quoteId, 'quote_item_added', `Partida agregada a ${quote.quote_number}`, user.userId, { itemId: result.meta.last_row_id, title_es });

    return c.json({ success: true, message: 'Partida agregada', itemId: result.meta.last_row_id, totals });
  } catch (error) {
    console.error('Create quote item error:', error);
    return c.json({ error: 'Error al agregar partida' }, 500);
  }
});

quotes.put('/:id/items/:itemId', async (c) => {
  try {
    const user = c.get('user');
    const quoteId = Number(c.req.param('id'));
    const itemId = Number(c.req.param('itemId'));
    const db = c.env.DB;
    const body = await c.req.json();

    if (user.role === 'client') {
      return c.json({ error: 'Solo administradores pueden editar partidas' }, 403);
    }

    const item = await db.prepare('SELECT * FROM quote_items WHERE id = ? AND quote_id = ?').bind(itemId, quoteId).first();
    const quote = await db.prepare('SELECT * FROM quotes WHERE id = ?').bind(quoteId).first();
    if (!item || !quote) {
      return c.json({ error: 'Partida o cotización no encontrada' }, 404);
    }

    const qty = Number(body.quantity ?? item.quantity);
    const unitPrice = Number(body.unit_price ?? item.unit_price);
    const lineTotal = qty * unitPrice;

    await db.prepare(`
      UPDATE quote_items SET
        sort_order = ?,
        item_type = ?,
        title_es = ?,
        title_en = ?,
        description_es = ?,
        description_en = ?,
        quantity = ?,
        unit = ?,
        unit_price = ?,
        taxable = ?,
        line_total = ?,
        service_catalog_id = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND quote_id = ?
    `).bind(
      Number(body.sort_order ?? item.sort_order),
      body.item_type || item.item_type,
      body.title_es || item.title_es,
      body.title_en ?? item.title_en,
      body.description_es ?? item.description_es,
      body.description_en ?? item.description_en,
      qty,
      body.unit || item.unit,
      unitPrice,
      body.taxable === false ? 0 : (body.taxable === true ? 1 : item.taxable),
      lineTotal,
      body.service_catalog_id ?? item.service_catalog_id,
      itemId,
      quoteId
    ).run();

    const totals = await recalcQuote(db, quoteId);
    await db.prepare('UPDATE sales_records SET expected_value = ?, updated_at = CURRENT_TIMESTAMP WHERE quote_id = ?').bind(totals.total, quoteId).run();
    await logServiceEvent(db, quote.project_id as string, quoteId, 'quote_item_updated', `Partida actualizada en ${quote.quote_number}`, user.userId, { itemId });

    return c.json({ success: true, message: 'Partida actualizada', totals });
  } catch (error) {
    console.error('Update quote item error:', error);
    return c.json({ error: 'Error al actualizar partida' }, 500);
  }
});

quotes.delete('/:id/items/:itemId', async (c) => {
  try {
    const user = c.get('user');
    const quoteId = Number(c.req.param('id'));
    const itemId = Number(c.req.param('itemId'));
    const db = c.env.DB;

    if (user.role === 'client') {
      return c.json({ error: 'Solo administradores pueden eliminar partidas' }, 403);
    }

    const quote = await db.prepare('SELECT * FROM quotes WHERE id = ?').bind(quoteId).first();
    if (!quote) {
      return c.json({ error: 'Cotización no encontrada' }, 404);
    }

    await db.prepare('DELETE FROM quote_items WHERE id = ? AND quote_id = ?').bind(itemId, quoteId).run();
    const totals = await recalcQuote(db, quoteId);
    await db.prepare('UPDATE sales_records SET expected_value = ?, updated_at = CURRENT_TIMESTAMP WHERE quote_id = ?').bind(totals.total, quoteId).run();
    await logServiceEvent(db, quote.project_id as string, quoteId, 'quote_item_deleted', `Partida eliminada de ${quote.quote_number}`, user.userId, { itemId });

    return c.json({ success: true, message: 'Partida eliminada', totals });
  } catch (error) {
    console.error('Delete quote item error:', error);
    return c.json({ error: 'Error al eliminar partida' }, 500);
  }
});

quotes.delete('/:id', async (c) => {
  try {
    const user = c.get('user');
    const quoteId = Number(c.req.param('id'));
    const db = c.env.DB;

    if (user.role === 'client') {
      return c.json({ error: 'Solo administradores pueden eliminar cotizaciones' }, 403);
    }

    const quote = await db.prepare('SELECT * FROM quotes WHERE id = ?').bind(quoteId).first();
    if (!quote) {
      return c.json({ error: 'CotizaciÃ³n no encontrada' }, 404);
    }

    await db.prepare('DELETE FROM quote_items WHERE quote_id = ?').bind(quoteId).run();
    await db.prepare('DELETE FROM quote_views WHERE quote_id = ?').bind(quoteId).run();
    await db.prepare('DELETE FROM quote_signatures WHERE quote_id = ?').bind(quoteId).run();
    await db.prepare('DELETE FROM sales_records WHERE quote_id = ?').bind(quoteId).run();
    await db.prepare('UPDATE service_logs SET quote_id = NULL WHERE quote_id = ?').bind(quoteId).run();
    await db.prepare('DELETE FROM quotes WHERE id = ?').bind(quoteId).run();
    await logServiceEvent(db, quote.project_id as string, null, 'quote_deleted', `CotizaciÃ³n ${quote.quote_number} eliminada`, user.userId);

    return c.json({ success: true, message: 'CotizaciÃ³n eliminada' });
  } catch (error) {
    console.error('Delete quote error:', error);
    return c.json({ error: 'Error al eliminar cotizaciÃ³n' }, 500);
  }
});

export default quotes;
