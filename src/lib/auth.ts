export const SESSION_COOKIE = 'fittrack_session';
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 días (R9)

const TOKEN_PREFIX = 'fittrack.v1|';

/**
 * El token de sesión es un hash de la contraseña, no la contraseña: si alguien
 * lee la cookie no obtiene el secreto en claro. Vale en Edge y en Node porque
 * usa Web Crypto.
 */
export async function sessionToken(password: string): Promise<string> {
  const data = new TextEncoder().encode(TOKEN_PREFIX + password);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/** Comparación en tiempo constante para no filtrar el prefijo correcto. */
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export function accessPassword(): string | undefined {
  const value = process.env.ACCESS_PASSWORD;
  return value && value.length > 0 ? value : undefined;
}

export async function isValidSession(cookieValue: string | undefined): Promise<boolean> {
  const password = accessPassword();
  if (!password || !cookieValue) return false;
  return safeEqual(cookieValue, await sessionToken(password));
}
