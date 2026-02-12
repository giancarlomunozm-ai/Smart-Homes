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

const devices = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Middleware de autenticación
devices.use('/*', authMiddleware);

// Listar dispositivos de una residencia
devices.get('/residence/:residenceId', async (c) => {
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

    const result = await db.prepare(
      'SELECT * FROM devices WHERE residence_id = ? ORDER BY system_id, name'
    ).bind(residenceId).all();

    return c.json({
      success: true,
      devices: result.results
    });

  } catch (error) {
    console.error('Get devices error:', error);
    return c.json({ error: 'Error al obtener dispositivos' }, 500);
  }
});

// Obtener dispositivo específico
devices.get('/:id', async (c) => {
  try {
    const user = c.get('user');
    const deviceId = c.req.param('id');
    const db = c.env.DB;

    const device = await db.prepare(
      'SELECT * FROM devices WHERE id = ?'
    ).bind(deviceId).first();

    if (!device) {
      return c.json({ error: 'Dispositivo no encontrado' }, 404);
    }

    // Verificar acceso a la residencia del dispositivo
    if (user.role === 'client') {
      const access = await db.prepare(
        'SELECT id FROM user_residences WHERE user_id = ? AND residence_id = ?'
      ).bind(user.userId, device.residence_id).first();

      if (!access) {
        return c.json({ error: 'Acceso denegado a este dispositivo' }, 403);
      }
    }

    return c.json({
      success: true,
      device
    });

  } catch (error) {
    console.error('Get device error:', error);
    return c.json({ error: 'Error al obtener dispositivo' }, 500);
  }
});

// Crear dispositivo (solo admin)
devices.post('/', requireAdmin, async (c) => {
  try {
    const {
      residence_id,
      system_id,
      name,
      brand,
      model,
      serial,
      ip,
      mac,
      firmware,
      username,
      password,
      status
    } = await c.req.json();

    const db = c.env.DB;

    if (!residence_id || !system_id || !name || !brand || !model) {
      return c.json({ error: 'Campos requeridos faltantes' }, 400);
    }

    const result = await db.prepare(`
      INSERT INTO devices (
        residence_id, system_id, name, brand, model, serial, 
        ip, mac, firmware, username, password, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      residence_id,
      system_id,
      name,
      brand,
      model,
      serial || '',
      ip || '',
      mac || '',
      firmware || '',
      username || '',
      password || '',
      status || 'Online'
    ).run();

    if (!result.success) {
      return c.json({ error: 'Error al crear dispositivo' }, 500);
    }

    // Registrar evento
    await db.prepare(
      'INSERT INTO events (residence_id, device_id, user_id, event_type, description) VALUES (?, ?, ?, ?, ?)'
    ).bind(
      residence_id,
      result.meta.last_row_id,
      c.get('user').userId,
      'device_added',
      `Dispositivo ${name} agregado al sistema`
    ).run();

    return c.json({
      success: true,
      message: 'Dispositivo creado exitosamente',
      deviceId: result.meta.last_row_id
    });

  } catch (error) {
    console.error('Create device error:', error);
    return c.json({ error: 'Error al crear dispositivo' }, 500);
  }
});

// Actualizar dispositivo (solo admin)
devices.put('/:id', requireAdmin, async (c) => {
  try {
    const deviceId = c.req.param('id');
    const {
      name,
      brand,
      model,
      serial,
      ip,
      mac,
      firmware,
      username,
      password,
      status
    } = await c.req.json();

    const db = c.env.DB;

    const device = await db.prepare(
      'SELECT residence_id FROM devices WHERE id = ?'
    ).bind(deviceId).first();

    if (!device) {
      return c.json({ error: 'Dispositivo no encontrado' }, 404);
    }

    const result = await db.prepare(`
      UPDATE devices SET 
        name = ?, brand = ?, model = ?, serial = ?, 
        ip = ?, mac = ?, firmware = ?, username = ?, 
        password = ?, status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(
      name, brand, model, serial, ip, mac, firmware, 
      username, password, status, deviceId
    ).run();

    if (result.meta.changes === 0) {
      return c.json({ error: 'Error al actualizar dispositivo' }, 500);
    }

    // Registrar evento
    await db.prepare(
      'INSERT INTO events (residence_id, device_id, user_id, event_type, description) VALUES (?, ?, ?, ?, ?)'
    ).bind(
      device.residence_id,
      deviceId,
      c.get('user').userId,
      'device_updated',
      `Dispositivo ${name} actualizado`
    ).run();

    return c.json({
      success: true,
      message: 'Dispositivo actualizado exitosamente'
    });

  } catch (error) {
    console.error('Update device error:', error);
    return c.json({ error: 'Error al actualizar dispositivo' }, 500);
  }
});

// Eliminar dispositivo (solo admin)
devices.delete('/:id', requireAdmin, async (c) => {
  try {
    const deviceId = c.req.param('id');
    const db = c.env.DB;

    const device = await db.prepare(
      'SELECT residence_id, name FROM devices WHERE id = ?'
    ).bind(deviceId).first();

    if (!device) {
      return c.json({ error: 'Dispositivo no encontrado' }, 404);
    }

    const result = await db.prepare(
      'DELETE FROM devices WHERE id = ?'
    ).bind(deviceId).run();

    if (result.meta.changes === 0) {
      return c.json({ error: 'Error al eliminar dispositivo' }, 500);
    }

    // Registrar evento
    await db.prepare(
      'INSERT INTO events (residence_id, user_id, event_type, description) VALUES (?, ?, ?, ?)'
    ).bind(
      device.residence_id,
      c.get('user').userId,
      'device_removed',
      `Dispositivo ${device.name} eliminado del sistema`
    ).run();

    return c.json({
      success: true,
      message: 'Dispositivo eliminado exitosamente'
    });

  } catch (error) {
    console.error('Delete device error:', error);
    return c.json({ error: 'Error al eliminar dispositivo' }, 500);
  }
});

// Listar dispositivos por sistema
devices.get('/system/:systemId', async (c) => {
  try {
    const user = c.get('user');
    const systemId = c.req.param('systemId');
    const db = c.env.DB;

    let query: D1PreparedStatement;

    if (user.role === 'admin') {
      query = db.prepare(
        'SELECT * FROM devices WHERE system_id = ? ORDER BY residence_id, name'
      ).bind(systemId);
    } else {
      query = db.prepare(`
        SELECT d.* FROM devices d
        INNER JOIN user_residences ur ON d.residence_id = ur.residence_id
        WHERE d.system_id = ? AND ur.user_id = ?
        ORDER BY d.residence_id, d.name
      `).bind(systemId, user.userId);
    }

    const result = await query.all();

    return c.json({
      success: true,
      devices: result.results
    });

  } catch (error) {
    console.error('Get devices by system error:', error);
    return c.json({ error: 'Error al obtener dispositivos' }, 500);
  }
});

// Crear nuevo dispositivo
devices.post('/', async (c) => {
  try {
    const user = c.get('user');
    const db = c.env.DB;
    const {
      residence_id,
      system_id,
      name,
      brand,
      model,
      serial,
      ip,
      mac,
      firmware,
      username,
      password,
      status
    } = await c.req.json();

    // Validar campos requeridos
    if (!residence_id || !system_id || !name) {
      return c.json({ error: 'Campos requeridos: residence_id, system_id, name' }, 400);
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

    // Insertar dispositivo
    const result = await db.prepare(`
      INSERT INTO devices (
        residence_id, system_id, name, brand, model, serial, 
        ip, mac, firmware, username, password, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      residence_id,
      system_id,
      name,
      brand || '',
      model || '',
      serial || '',
      ip || '',
      mac || '',
      firmware || '',
      username || '',
      password || '',
      status || 'Online'
    ).run();

    // Registrar evento
    await db.prepare(
      'INSERT INTO events (residence_id, device_id, user_id, event_type, description) VALUES (?, ?, ?, ?, ?)'
    ).bind(
      residence_id,
      result.meta.last_row_id,
      user.userId,
      'device_added',
      `Dispositivo ${name} agregado al sistema`
    ).run();

    return c.json({
      success: true,
      message: 'Dispositivo creado exitosamente',
      deviceId: result.meta.last_row_id
    });

  } catch (error) {
    console.error('Create device error:', error);
    return c.json({ error: 'Error al crear dispositivo' }, 500);
  }
});

export default devices;
