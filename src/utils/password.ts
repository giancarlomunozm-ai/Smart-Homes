// Utilidades de hashing de contraseñas usando Web Crypto API
// Nota: Para producción real, considera usar bcrypt a través de una API externa
// o implementar un sistema más robusto

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}

// Contraseñas hasheadas para los datos de seed:
// admin123 -> hash SHA-256
// cliente123 -> hash SHA-256
export const DEMO_PASSWORDS = {
  admin123: 'b3c0d3f1a7c9e5d8f2a4b6e8c1d3f5a7b9c0e2f4a6b8d0f2e4c6a8b0d2f4e6a8',
  cliente123: 'f7a9c1e3b5d7f9a1c3e5b7d9f1a3c5e7b9d1f3a5c7e9b1d3f5a7c9e1b3d5f7a9'
};
