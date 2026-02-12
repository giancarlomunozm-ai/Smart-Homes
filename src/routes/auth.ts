import { Hono } from 'hono';
import { signJWT } from '../utils/jwt';
import { hashPassword } from '../utils/password';

type Bindings = {
  DB: D1Database;
  JWT_SECRET: string;
};

const auth = new Hono<{ Bindings: Bindings }>();

// Login
auth.post('/login', async (c) => {
  try {
    const { email, password } = await c.req.json();

    if (!email || !password) {
      return c.json({ error: 'Email y contraseña requeridos' }, 400);
    }

    const db = c.env.DB;
    
    // Buscar usuario
    const result = await db.prepare(
      'SELECT id, email, password, name, role FROM users WHERE email = ?'
    ).bind(email).first();

    if (!result) {
      return c.json({ error: 'Credenciales inválidas' }, 401);
    }

    // Verificar contraseña
    const passwordHash = await hashPassword(password);
    if (result.password !== passwordHash) {
      return c.json({ error: 'Credenciales inválidas' }, 401);
    }

    // Generar JWT
    const jwtSecret = c.env.JWT_SECRET || 'your-secret-key-change-in-production';
    const token = await signJWT(
      {
        userId: result.id as number,
        email: result.email as string,
        role: result.role as 'admin' | 'client'
      },
      jwtSecret
    );

    return c.json({
      success: true,
      token,
      user: {
        id: result.id,
        email: result.email,
        name: result.name,
        role: result.role
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return c.json({ error: 'Error en el servidor' }, 500);
  }
});

// Registro (solo admin puede registrar nuevos usuarios)
auth.post('/register', async (c) => {
  try {
    const { email, password, name, role } = await c.req.json();

    if (!email || !password || !name || !role) {
      return c.json({ error: 'Todos los campos son requeridos' }, 400);
    }

    if (!['admin', 'client'].includes(role)) {
      return c.json({ error: 'Rol inválido' }, 400);
    }

    const db = c.env.DB;

    // Verificar si el usuario ya existe
    const existing = await db.prepare(
      'SELECT id FROM users WHERE email = ?'
    ).bind(email).first();

    if (existing) {
      return c.json({ error: 'El usuario ya existe' }, 400);
    }

    // Hash de la contraseña
    const passwordHash = await hashPassword(password);

    // Insertar usuario
    const result = await db.prepare(
      'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)'
    ).bind(email, passwordHash, name, role).run();

    if (!result.success) {
      return c.json({ error: 'Error al crear usuario' }, 500);
    }

    return c.json({
      success: true,
      message: 'Usuario creado exitosamente',
      userId: result.meta.last_row_id
    });

  } catch (error) {
    console.error('Register error:', error);
    return c.json({ error: 'Error en el servidor' }, 500);
  }
});

// Verificar token (para validación del frontend)
auth.get('/verify', async (c) => {
  const authHeader = c.req.header('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ valid: false, error: 'Token no proporcionado' }, 401);
  }

  const token = authHeader.substring(7);
  const jwtSecret = c.env.JWT_SECRET || 'your-secret-key-change-in-production';

  try {
    const { verifyJWT } = await import('../utils/jwt');
    const payload = await verifyJWT(token, jwtSecret);

    if (!payload) {
      return c.json({ valid: false, error: 'Token inválido' }, 401);
    }

    return c.json({
      valid: true,
      user: {
        id: payload.userId,
        email: payload.email,
        role: payload.role
      }
    });
  } catch (error) {
    return c.json({ valid: false, error: 'Error al verificar token' }, 500);
  }
});

export default auth;
