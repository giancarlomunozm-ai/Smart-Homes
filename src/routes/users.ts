import { Hono } from 'hono';
import { authMiddleware, requireAdmin } from '../middleware/auth';
import { hashPassword } from '../utils/password';
import type { JWTPayload } from '../utils/jwt';

type Bindings = {
  DB: D1Database;
  JWT_SECRET: string;
};

type Variables = {
  user: JWTPayload;
};

const users = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Middleware de autenticación
users.use('/*', authMiddleware);

// Listar usuarios (admin ve todos, cliente ve solo de sus residencias)
users.get('/', async (c) => {
  try {
    const user = c.get('user');
    const db = c.env.DB;

    let query: D1PreparedStatement;

    if (user.role === 'admin') {
      // Admin ve todos los usuarios
      query = db.prepare(`
        SELECT 
          u.id, u.email, u.name, u.role, u.created_at,
          GROUP_CONCAT(ur.residence_id) as residences
        FROM users u
        LEFT JOIN user_residences ur ON u.id = ur.user_id
        WHERE u.id != ?
        GROUP BY u.id
        ORDER BY u.created_at DESC
      `).bind(user.userId);
    } else {
      // Cliente ve usuarios de sus residencias
      query = db.prepare(`
        SELECT DISTINCT
          u.id, u.email, u.name, u.role, u.created_at,
          GROUP_CONCAT(DISTINCT ur2.residence_id) as residences
        FROM users u
        INNER JOIN user_residences ur ON u.id = ur.user_id
        INNER JOIN user_residences ur1 ON ur.residence_id = ur1.residence_id
        LEFT JOIN user_residences ur2 ON u.id = ur2.user_id
        WHERE ur1.user_id = ? AND u.id != ?
        GROUP BY u.id
        ORDER BY u.created_at DESC
      `).bind(user.userId, user.userId);
    }

    const result = await query.all();

    // Procesar residencias como array
    const usersWithResidences = result.results.map(u => ({
      ...u,
      residences: u.residences ? u.residences.split(',') : []
    }));

    return c.json({
      success: true,
      users: usersWithResidences
    });

  } catch (error) {
    console.error('Get users error:', error);
    return c.json({ error: 'Error al obtener usuarios' }, 500);
  }
});

// Obtener residencias disponibles para invitar (según permisos del usuario)
users.get('/available-residences', async (c) => {
  try {
    const user = c.get('user');
    const db = c.env.DB;

    let query: D1PreparedStatement;

    if (user.role === 'admin') {
      // Admin puede asignar a cualquier residencia
      query = db.prepare(`
        SELECT id, name, address, status, subscription_status
        FROM residences
        WHERE subscription_status = 'active'
        ORDER BY name
      `);
    } else {
      // Cliente solo puede invitar a sus residencias asignadas
      query = db.prepare(`
        SELECT r.id, r.name, r.address, r.status, r.subscription_status
        FROM residences r
        INNER JOIN user_residences ur ON r.id = ur.residence_id
        WHERE ur.user_id = ? AND r.subscription_status = 'active'
        ORDER BY r.name
      `).bind(user.userId);
    }

    const result = await query.all();

    return c.json({
      success: true,
      residences: result.results
    });

  } catch (error) {
    console.error('Get available residences error:', error);
    return c.json({ error: 'Error al obtener residencias' }, 500);
  }
});

// Crear/Invitar nuevo usuario
users.post('/', async (c) => {
  try {
    const currentUser = c.get('user');
    const { email, password, name, role, residence_ids } = await c.req.json();
    const db = c.env.DB;

    if (!email || !password || !name || !role) {
      return c.json({ error: 'Campos requeridos: email, password, name, role' }, 400);
    }

    if (!['admin', 'client'].includes(role)) {
      return c.json({ error: 'Rol inválido' }, 400);
    }

    // Solo admin puede crear otros admins
    if (role === 'admin' && currentUser.role !== 'admin') {
      return c.json({ error: 'Solo administradores pueden crear otros administradores' }, 403);
    }

    // Verificar que el email no exista
    const existing = await db.prepare(
      'SELECT id FROM users WHERE email = ?'
    ).bind(email).first();

    if (existing) {
      return c.json({ error: 'El usuario ya existe' }, 400);
    }

    // Verificar permisos sobre las residencias
    if (residence_ids && residence_ids.length > 0) {
      if (currentUser.role === 'client') {
        // Cliente solo puede asignar a sus residencias
        for (const resId of residence_ids) {
          const access = await db.prepare(
            'SELECT id FROM user_residences WHERE user_id = ? AND residence_id = ?'
          ).bind(currentUser.userId, resId).first();

          if (!access) {
            return c.json({ 
              error: `No tienes permiso para asignar la residencia ${resId}` 
            }, 403);
          }
        }
      }
    }

    // Hash de contraseña
    const passwordHash = await hashPassword(password);

    // Crear usuario
    const result = await db.prepare(
      'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)'
    ).bind(email, passwordHash, name, role).run();

    const newUserId = result.meta.last_row_id;

    // Asignar residencias
    if (residence_ids && residence_ids.length > 0) {
      for (const resId of residence_ids) {
        await db.prepare(
          'INSERT INTO user_residences (user_id, residence_id) VALUES (?, ?)'
        ).bind(newUserId, resId).run();

        // Registrar evento
        await db.prepare(
          'INSERT INTO events (residence_id, user_id, event_type, description) VALUES (?, ?, ?, ?)'
        ).bind(
          resId,
          currentUser.userId,
          'user_invited',
          `Usuario ${name} invitado a la residencia`
        ).run();
      }
    }

    return c.json({
      success: true,
      message: 'Usuario creado exitosamente',
      userId: newUserId
    });

  } catch (error) {
    console.error('Create user error:', error);
    return c.json({ error: 'Error al crear usuario' }, 500);
  }
});

// Actualizar usuario (solo admin o el mismo usuario)
users.put('/:userId', async (c) => {
  try {
    const currentUser = c.get('user');
    const userId = parseInt(c.req.param('userId'));
    const { name, email } = await c.req.json();
    const db = c.env.DB;

    // Verificar permisos
    if (currentUser.role !== 'admin' && currentUser.userId !== userId) {
      return c.json({ error: 'No tienes permiso para editar este usuario' }, 403);
    }

    await db.prepare(
      'UPDATE users SET name = ?, email = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).bind(name, email, userId).run();

    return c.json({
      success: true,
      message: 'Usuario actualizado exitosamente'
    });

  } catch (error) {
    console.error('Update user error:', error);
    return c.json({ error: 'Error al actualizar usuario' }, 500);
  }
});

// Eliminar usuario (solo admin)
users.delete('/:userId', requireAdmin, async (c) => {
  try {
    const userId = c.req.param('userId');
    const db = c.env.DB;

    await db.prepare('DELETE FROM users WHERE id = ?').bind(userId).run();

    return c.json({
      success: true,
      message: 'Usuario eliminado exitosamente'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    return c.json({ error: 'Error al eliminar usuario' }, 500);
  }
});

// Agregar residencia a usuario
users.post('/:userId/residences', async (c) => {
  try {
    const currentUser = c.get('user');
    const userId = parseInt(c.req.param('userId'));
    const { residence_id } = await c.req.json();
    const db = c.env.DB;

    if (!residence_id) {
      return c.json({ error: 'residence_id requerido' }, 400);
    }

    // Verificar permisos
    if (currentUser.role === 'client') {
      // Cliente solo puede asignar sus propias residencias
      const access = await db.prepare(
        'SELECT id FROM user_residences WHERE user_id = ? AND residence_id = ?'
      ).bind(currentUser.userId, residence_id).first();

      if (!access) {
        return c.json({ error: 'No tienes permiso para asignar esta residencia' }, 403);
      }
    }

    // Verificar que la asignación no exista
    const existing = await db.prepare(
      'SELECT id FROM user_residences WHERE user_id = ? AND residence_id = ?'
    ).bind(userId, residence_id).first();

    if (existing) {
      return c.json({ error: 'La residencia ya está asignada a este usuario' }, 400);
    }

    await db.prepare(
      'INSERT INTO user_residences (user_id, residence_id) VALUES (?, ?)'
    ).bind(userId, residence_id).run();

    // Registrar evento
    await db.prepare(
      'INSERT INTO events (residence_id, user_id, event_type, description) VALUES (?, ?, ?, ?)'
    ).bind(
      residence_id,
      currentUser.userId,
      'user_access_granted',
      `Acceso otorgado a usuario ID ${userId}`
    ).run();

    return c.json({
      success: true,
      message: 'Residencia asignada exitosamente'
    });

  } catch (error) {
    console.error('Add residence error:', error);
    return c.json({ error: 'Error al asignar residencia' }, 500);
  }
});

// Remover residencia de usuario
users.delete('/:userId/residences/:residenceId', async (c) => {
  try {
    const currentUser = c.get('user');
    const userId = c.req.param('userId');
    const residenceId = c.req.param('residenceId');
    const db = c.env.DB;

    // Verificar permisos
    if (currentUser.role === 'client') {
      // Cliente solo puede remover de sus propias residencias
      const access = await db.prepare(
        'SELECT id FROM user_residences WHERE user_id = ? AND residence_id = ?'
      ).bind(currentUser.userId, residenceId).first();

      if (!access) {
        return c.json({ error: 'No tienes permiso para remover esta residencia' }, 403);
      }
    }

    await db.prepare(
      'DELETE FROM user_residences WHERE user_id = ? AND residence_id = ?'
    ).bind(userId, residenceId).run();

    return c.json({
      success: true,
      message: 'Residencia removida exitosamente'
    });

  } catch (error) {
    console.error('Remove residence error:', error);
    return c.json({ error: 'Error al remover residencia' }, 500);
  }
});

// Actualizar usuario (admin only)
users.put('/:userId', requireAdmin, async (c) => {
  try {
    const userId = c.req.param('userId');
    const { name, email, residences } = await c.req.json();
    const db = c.env.DB;

    // Validar campos requeridos
    if (!name || !email) {
      return c.json({ error: 'Nombre y email son requeridos' }, 400);
    }

    // Verificar que el usuario existe
    const user = await db.prepare(
      'SELECT id, role FROM users WHERE id = ?'
    ).bind(userId).first();

    if (!user) {
      return c.json({ error: 'Usuario no encontrado' }, 404);
    }

    // Actualizar datos del usuario
    await db.prepare(
      'UPDATE users SET name = ?, email = ? WHERE id = ?'
    ).bind(name, email, userId).run();

    // Si se proporcionaron residencias, actualizar asignaciones
    if (residences && Array.isArray(residences)) {
      // Eliminar asignaciones anteriores
      await db.prepare(
        'DELETE FROM user_residences WHERE user_id = ?'
      ).bind(userId).run();

      // Agregar nuevas asignaciones
      for (const residenceId of residences) {
        await db.prepare(
          'INSERT INTO user_residences (user_id, residence_id) VALUES (?, ?)'
        ).bind(userId, residenceId).run();
      }
    }

    return c.json({
      success: true,
      message: 'Usuario actualizado exitosamente'
    });

  } catch (error) {
    console.error('Update user error:', error);
    return c.json({ error: 'Error al actualizar usuario' }, 500);
  }
});

export default users;
