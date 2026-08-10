import { desc } from 'drizzle-orm';
import { db } from '@/db';
import { documents } from '@/db/schema';
import { DocumentsManager } from '@/components/DocumentsManager';
import { Card, ScreenHeader } from '@/components/ui';

export const dynamic = 'force-dynamic';

export default async function DocumentsPage() {
  const rows = await db
    .select()
    .from(documents)
    .orderBy(desc(documents.docDate), desc(documents.uploadedAt));

  const blobReady = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

  return (
    <main className="flex flex-col gap-4">
      <ScreenHeader path="documentos" meta="el plan original y tus respaldos" />

      <Card>
        <DocumentsManager documents={rows} blobReady={blobReady} />
      </Card>

      <p className="px-1 text-[13px] text-ink-faint">
        Los archivos se guardan con acceso privado y se sirven a través del portal: su URL de
        almacenamiento no abre sin credenciales del servidor, así que quedan detrás de tu
        contraseña igual que el resto de tus datos.
      </p>
    </main>
  );
}
