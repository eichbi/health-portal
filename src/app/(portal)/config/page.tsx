import { asc } from 'drizzle-orm';
import Link from 'next/link';
import { db } from '@/db';
import { supplementDefs } from '@/db/schema';
import { SettingsForm } from '@/components/SettingsForm';
import { SupplementSettings } from '@/components/SupplementSettings';
import { Card } from '@/components/ui';
import { TIME_ZONE } from '@/lib/defaults';
import { getSettings } from '@/lib/settings';
import { logout } from '@/app/login/actions';

export const dynamic = 'force-dynamic';

export default async function ConfigPage() {
  const [settings, supplements] = await Promise.all([
    getSettings(),
    db.select().from(supplementDefs).orderBy(asc(supplementDefs.sortOrder), asc(supplementDefs.id)),
  ]);

  return (
    <main className="flex flex-col gap-4">
      <header>
        <h1 className="text-xl font-bold leading-tight">Configuración</h1>
        <p className="text-[15px] text-ink-soft">Metas, fechas y suplementos.</p>
      </header>

      <Card title="Metas y fechas">
        <SettingsForm settings={settings} />
      </Card>

      <Card title="Suplementos">
        <SupplementSettings supplements={supplements} />
      </Card>

      <Card title="Documentos">
        <p className="mb-3 text-[15px] text-ink-soft">
          El plan en PDF y cualquier archivo de respaldo que quieras tener a la mano.
        </p>
        <Link
          href="/documentos"
          className="tap block w-full rounded-xl border border-line bg-white py-3 text-center font-semibold text-brand"
        >
          Ir a Documentos
        </Link>
      </Card>

      <Card title="Sesión">
        <p className="mb-3 text-[15px] text-ink-soft">
          Zona horaria del portal: <strong>{TIME_ZONE}</strong>.
        </p>
        <form action={logout}>
          <button
            type="submit"
            className="tap w-full rounded-xl border border-line bg-white py-3 font-semibold text-ink"
          >
            Cerrar sesión
          </button>
        </form>
      </Card>
    </main>
  );
}
