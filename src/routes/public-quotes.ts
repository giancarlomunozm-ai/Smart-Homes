import { Hono } from 'hono';

type Bindings = {
  DB: D1Database;
};

const publicQuotes = new Hono<{ Bindings: Bindings }>();

publicQuotes.get('/:token', async (c) => {
  try {
    const token = c.req.param('token');
    const db = c.env.DB;

    const quote = await db.prepare(`
      SELECT q.*, r.name as project_name, r.address as project_address, r.project_type
      FROM quotes q
      LEFT JOIN residences r ON q.project_id = r.id
      WHERE q.public_token = ?
    `).bind(token).first();

    if (!quote) {
      return c.json({ success: false, error: 'Cotización no encontrada' }, 404);
    }

    if (quote.public_expires_at) {
      const now = new Date();
      const expires = new Date(String(quote.public_expires_at));
      if (now > expires) {
        return c.json({ success: false, error: 'Esta cotización ha expirado' }, 410);
      }
    }

    const items = await db.prepare(
      'SELECT * FROM quote_items WHERE quote_id = ? ORDER BY sort_order ASC, id ASC'
    ).bind(quote.id).all();

    const language = (c.req.query('lang') === 'en' ? 'en' : (quote.language_default || 'es')) as 'es' | 'en';
    const ip = c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For') || null;
    const userAgent = c.req.header('User-Agent') || null;
    const alreadyViewed = await db.prepare(
      'SELECT id FROM quote_views WHERE quote_id = ? AND ip IS ? AND language = ? ORDER BY viewed_at DESC LIMIT 1'
    ).bind(quote.id, ip, language).first();

    if (!alreadyViewed) {
      await db.prepare(`
        INSERT INTO quote_views (quote_id, language, ip, user_agent)
        VALUES (?, ?, ?, ?)
      `).bind(quote.id, language, ip, userAgent).run();
    }

    if (quote.status === 'draft' || quote.status === 'sent') {
      await db.prepare(`
        UPDATE quotes SET status = 'viewed', updated_at = CURRENT_TIMESTAMP WHERE id = ?
      `).bind(quote.id).run();

      await db.prepare(`
        INSERT INTO service_logs (project_id, quote_id, event_type, description, metadata)
        VALUES (?, ?, 'quote_viewed', ?, ?)
      `).bind(
        quote.project_id,
        quote.id,
        `Cotización ${quote.quote_number} visualizada por cliente`,
        JSON.stringify({ language, ip })
      ).run();
    }

    return c.json({
      success: true,
      quote: {
        ...quote,
        view_url: `/quote/${token}`
      },
      items: items.results || [],
      language
    });
  } catch (error) {
    console.error('Public quote error:', error);
    return c.json({ success: false, error: 'Error al cargar cotización pública' }, 500);
  }
});

publicQuotes.post('/:token/sign', async (c) => {
  try {
    const token = c.req.param('token');
    const db = c.env.DB;
    const { signer_name, signer_email, signature_data, accepted_terms } = await c.req.json();

    if (!signer_name || !accepted_terms) {
      return c.json({ success: false, error: 'Nombre del firmante y aceptación requeridos' }, 400);
    }

    const quote = await db.prepare(`
      SELECT * FROM quotes WHERE public_token = ?
    `).bind(token).first();

    if (!quote) {
      return c.json({ success: false, error: 'Cotización no encontrada' }, 404);
    }

    const ip = c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For') || null;
    const userAgent = c.req.header('User-Agent') || null;

    const existingSignature = await db.prepare(
      'SELECT id FROM quote_signatures WHERE quote_id = ? ORDER BY signed_at DESC LIMIT 1'
    ).bind(quote.id).first();

    if (existingSignature) {
      return c.json({ success: false, error: 'Esta cotización ya fue firmada' }, 409);
    }

    await db.prepare(`
      INSERT INTO quote_signatures (quote_id, signer_name, signer_email, signature_data, ip, user_agent)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
      quote.id,
      signer_name,
      signer_email || null,
      signature_data || null,
      ip,
      userAgent
    ).run();

    await db.prepare(`
      UPDATE quotes
      SET status = 'signed', signed_at = CURRENT_TIMESTAMP, signature_name = ?, signature_ip = ?, signature_user_agent = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(
      signer_name,
      ip,
      userAgent,
      quote.id
    ).run();

    await db.prepare(`
      UPDATE sales_records SET stage = 'signed', updated_at = CURRENT_TIMESTAMP WHERE quote_id = ?
    `).bind(quote.id).run();

    await db.prepare(`
      INSERT INTO service_logs (project_id, quote_id, event_type, description, metadata)
      VALUES (?, ?, 'quote_signed', ?, ?)
    `).bind(
      quote.project_id,
      quote.id,
      `Cotización ${quote.quote_number} firmada por cliente`,
      JSON.stringify({ signer_name, signer_email: signer_email || null, ip })
    ).run();

    return c.json({
      success: true,
      message: 'Cotización firmada exitosamente',
      signed_at: new Date().toISOString(),
      signer_name
    });
  } catch (error) {
    console.error('Public quote signature error:', error);
    return c.json({ success: false, error: 'Error al firmar cotización' }, 500);
  }
});

export default publicQuotes;
