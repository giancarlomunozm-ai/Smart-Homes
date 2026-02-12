import { Context, Next } from 'hono';
import { verifyJWT, JWTPayload } from '../utils/jwt';

export interface AuthContext {
  Variables: {
    user: JWTPayload;
  };
}

export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'No autorizado', message: 'Token requerido' }, 401);
  }

  const token = authHeader.substring(7);
  const jwtSecret = c.env.JWT_SECRET || 'your-secret-key-change-in-production';

  const payload = await verifyJWT(token, jwtSecret);
  
  if (!payload) {
    return c.json({ error: 'No autorizado', message: 'Token inválido o expirado' }, 401);
  }

  c.set('user', payload);
  await next();
}

export function requireAdmin(c: Context, next: Next) {
  const user = c.get('user') as JWTPayload;
  
  if (user.role !== 'admin') {
    return c.json({ error: 'Acceso denegado', message: 'Se requieren permisos de administrador' }, 403);
  }

  return next();
}
