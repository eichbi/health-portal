'use client';

import { useActionState } from 'react';
import { FormError, SubmitButton, TextInput } from '@/components/form';
import { login, type LoginState } from './actions';

export function LoginForm({ next }: { next: string }) {
  const [state, formAction] = useActionState<LoginState, FormData>(login, {});

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="next" value={next} />
      <TextInput
        name="password"
        type="password"
        autoComplete="current-password"
        placeholder="Contraseña"
        aria-label="Contraseña"
        required
        autoFocus
      />
      <FormError message={state.error} />
      <SubmitButton pendingLabel="Entrando…">Entrar</SubmitButton>
    </form>
  );
}
