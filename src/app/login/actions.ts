'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SESSION_COOKIE, SESSION_MAX_AGE, accessPassword, safeEqual, sessionToken } from '@/lib/auth';

export type LoginState = { error?: string };

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const expected = accessPassword();
  if (!expected) {
    return { error: 'Falta configurar ACCESS_PASSWORD en el servidor.' };
  }

  const submitted = String(formData.get('password') ?? '');
  if (!safeEqual(submitted, expected)) {
    return { error: 'Contraseña incorrecta.' };
  }

  const store = await cookies();
  store.set(SESSION_COOKIE, await sessionToken(expected), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  });

  const next = String(formData.get('next') ?? '/');
  redirect(next.startsWith('/') && !next.startsWith('//') ? next : '/');
}

export async function logout() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect('/login');
}
