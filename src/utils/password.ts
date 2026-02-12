// Utilidades de hashing de contraseñas usando Web Crypto API

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

// Contraseñas hasheadas correctas (SHA-256):
// admin123 -> 240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9
// cliente123 -> 09a31a7001e261ab1e056182a71d3cf57f582ca9a29cff5eb83be0f0549730a9
export const DEMO_PASSWORDS = {
  admin123: '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9',
  cliente123: '09a31a7001e261ab1e056182a71d3cf57f582ca9a29cff5eb83be0f0549730a9'
};
