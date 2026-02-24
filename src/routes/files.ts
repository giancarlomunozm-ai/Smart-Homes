import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';
import type { JWTPayload } from '../utils/jwt';

type Bindings = {
  DB: D1Database;
  R2?: R2Bucket; // Opcional por ahora
};

type Variables = {
  user: JWTPayload;
};

const files = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Middleware de autenticación
files.use('/*', authMiddleware);

// Listar archivos de una residencia
files.get('/residence/:residenceId', async (c) => {
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
        return c.json({ error: 'No tienes acceso a esta residencia' }, 403);
      }
    }

    // Obtener archivos
    const result = await db.prepare(`
      SELECT 
        rf.*,
        u.name as uploaded_by_name
      FROM residence_files rf
      LEFT JOIN users u ON rf.uploaded_by = u.id
      WHERE rf.residence_id = ?
      ORDER BY rf.created_at DESC
    `).bind(residenceId).all();

    return c.json({
      success: true,
      files: result.results
    });

  } catch (error) {
    console.error('Get files error:', error);
    return c.json({ error: 'Error al obtener archivos' }, 500);
  }
});

// Subir archivo (base64)
files.post('/upload', async (c) => {
  try {
    const user = c.get('user');
    const db = c.env.DB;
    const body = await c.req.json();

    const {
      residence_id,
      file_name,
      file_data, // base64
      file_category,
      description,
      mime_type
    } = body;

    if (!residence_id || !file_name || !file_data || !file_category) {
      return c.json({ error: 'Faltan campos requeridos' }, 400);
    }

    // Verificar acceso (solo admin puede subir)
    if (user.role !== 'admin') {
      return c.json({ error: 'Solo administradores pueden subir archivos' }, 403);
    }

    // Verificar que la residencia existe
    const residence = await db.prepare(
      'SELECT id FROM residences WHERE id = ?'
    ).bind(residence_id).first();

    if (!residence) {
      return c.json({ error: 'Residencia no encontrada' }, 404);
    }

    // Determinar tipo de archivo
    let file_type = 'other';
    if (mime_type?.includes('pdf')) {
      file_type = 'pdf';
    } else if (mime_type?.includes('image')) {
      file_type = 'image';
    } else if (mime_type?.includes('document') || mime_type?.includes('word') || mime_type?.includes('excel')) {
      file_type = 'document';
    }

    // Calcular tamaño (aproximado del base64)
    const file_size = Math.floor((file_data.length * 3) / 4);

    // Limitar a 5MB
    if (file_size > 5 * 1024 * 1024) {
      return c.json({ error: 'El archivo excede el límite de 5MB' }, 400);
    }

    // Guardar en D1 (el base64 se guarda como URL data:)
    const dataUrl = `data:${mime_type || 'application/octet-stream'};base64,${file_data}`;

    const result = await db.prepare(`
      INSERT INTO residence_files (
        residence_id,
        file_name,
        file_type,
        file_category,
        file_url,
        file_size,
        mime_type,
        description,
        uploaded_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      residence_id,
      file_name,
      file_type,
      file_category,
      dataUrl,
      file_size,
      mime_type,
      description || null,
      user.userId
    ).run();

    // Crear evento
    await db.prepare(`
      INSERT INTO events (
        residence_id,
        user_id,
        event_type,
        description
      ) VALUES (?, ?, ?, ?)
    `).bind(
      residence_id,
      user.userId,
      'file_uploaded',
      `Archivo subido: ${file_name} (${file_category})`
    ).run();

    return c.json({
      success: true,
      message: 'Archivo subido exitosamente',
      file_id: result.meta.last_row_id
    });

  } catch (error) {
    console.error('Upload file error:', error);
    return c.json({ error: 'Error al subir archivo' }, 500);
  }
});

// Eliminar archivo (solo admin)
files.delete('/:fileId', async (c) => {
  try {
    const user = c.get('user');
    const fileId = c.req.param('fileId');
    const db = c.env.DB;

    if (user.role !== 'admin') {
      return c.json({ error: 'Solo administradores pueden eliminar archivos' }, 403);
    }

    // Obtener info del archivo antes de eliminar
    const file = await db.prepare(
      'SELECT residence_id, file_name FROM residence_files WHERE id = ?'
    ).bind(fileId).first();

    if (!file) {
      return c.json({ error: 'Archivo no encontrado' }, 404);
    }

    // Eliminar
    await db.prepare('DELETE FROM residence_files WHERE id = ?').bind(fileId).run();

    // Crear evento
    await db.prepare(`
      INSERT INTO events (
        residence_id,
        user_id,
        event_type,
        description
      ) VALUES (?, ?, ?, ?)
    `).bind(
      file.residence_id,
      user.userId,
      'file_deleted',
      `Archivo eliminado: ${file.file_name}`
    ).run();

    return c.json({
      success: true,
      message: 'Archivo eliminado exitosamente'
    });

  } catch (error) {
    console.error('Delete file error:', error);
    return c.json({ error: 'Error al eliminar archivo' }, 500);
  }
});

export default files;
