'use client';

import { useFormStatus } from 'react-dom';
import type { ReactNode } from 'react';

export function Label({ children, htmlFor }: { children: ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-1 block text-[15px] font-medium text-ink-soft">
      {children}
    </label>
  );
}

const inputClass =
  'w-full rounded-xl border border-line bg-white px-3 py-3 text-ink outline-none ' +
  'focus:border-brand focus:ring-2 focus:ring-brand-soft disabled:opacity-50';

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputClass} ${props.className ?? ''}`} />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${inputClass} ${props.className ?? ''}`} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${inputClass} ${props.className ?? ''}`} />;
}

export function Field({
  label,
  hint,
  children,
}: {
  label: ReactNode;
  hint?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div>
      <Label>{label}</Label>
      {children}
      {hint && <p className="mt-1 text-[13px] text-ink-faint">{hint}</p>}
    </div>
  );
}

export function SubmitButton({
  children,
  pendingLabel = 'Guardando…',
  variant = 'primary',
  className = '',
}: {
  children: ReactNode;
  pendingLabel?: string;
  variant?: 'primary' | 'ghost' | 'danger';
  className?: string;
}) {
  const { pending } = useFormStatus();
  const styles = {
    primary: 'bg-brand text-white',
    ghost: 'border border-line bg-white text-ink',
    danger: 'border border-bad/30 bg-bad-bg text-bad',
  }[variant];

  return (
    <button
      type="submit"
      disabled={pending}
      className={`tap w-full rounded-xl px-4 py-3 text-center font-semibold disabled:opacity-60 ${styles} ${className}`}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}

export function FormError({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-xl bg-bad-bg px-3 py-2 text-[15px] font-medium text-bad">
      {message}
    </p>
  );
}
