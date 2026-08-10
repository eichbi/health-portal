import { desc } from 'drizzle-orm';
import { db } from '@/db';
import { documents } from '@/db/schema';
import { DocumentsManager } from '@/components/DocumentsManager';
import { Card } from '@/components/ui';

export const dynamic = 'force-dynamic';

export default async function DocumentsPage() {
  const rows = await db
    .select()
    .from(documents)
    .orderBy(desc(documents.docDate), desc(documents.uploadedAt));

  const blobReady = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

  return (
    <main className="flex flex-col gap-4">
      <header>
        <h1 className="text-xl font-bold leading-tight">Documentos</h1>
        <p className="text-[15px] text-ink-soft">
          El plan original y lo que quieras guardar de respaldo.
        </p>
      </header>

      <Card>
        <DocumentsManager documents={rows} blobReady={blobReady} />
      </Card>

      <p className="px-1 text-[13px] text-ink-faint">
        Los archivos se guardan en almacenamiento privado y se sirven a través del portal, así que
        quedan detrás de tu contraseña igual que el resto de tus datos.
      </p>
    </main>
  );
}
