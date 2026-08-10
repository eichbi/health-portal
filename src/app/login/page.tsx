import { accessPassword } from '@/lib/auth';
import { LoginForm } from './LoginForm';

export const metadata = { title: 'Entrar · FitTrack' };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const configured = Boolean(accessPassword());

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 px-5 py-10">
      <div>
        <h1 className="text-xl font-bold">
          <span className="text-brand">$</span> fittrack <span aria-hidden className="caret" />
        </h1>
        <p className="mt-1 text-[14px] text-ink-soft">portal personal de alberto · acceso restringido</p>
      </div>

      {configured ? (
        <LoginForm next={next && next.startsWith('/') ? next : '/'} />
      ) : (
        <div className="card p-4 text-[14px] text-ink-soft">
          <p className="font-semibold text-bad">✗ Falta configurar el acceso</p>
          <p className="mt-2">
            Define la variable de entorno <code className="font-mono">ACCESS_PASSWORD</code> en el
            proyecto de Vercel (o en <code className="font-mono">.env.local</code>) y vuelve a
            cargar.
          </p>
        </div>
      )}
    </main>
  );
}
