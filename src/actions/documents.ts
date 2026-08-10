'use server';

import { del, put } from '@vercel/blob';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { db } from '@/db';
import { DOCUMENT_KINDS, documents } from '@/db/schema';
import {
  oneOf,
  optionalText,
  requiredId,
  requiredText,
  run,
  ValidationError,
  type ActionState,
} from '@/lib/validation';
import { isISODate } from '@/lib/date';

const MAX_BYTES = 25 * 1024 * 1024;

const ALLOWED_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/heic',
  'image/webp',
  'text/csv',
  'application/vnd.ms-excel',
]);

function blobToken(): string | undefined {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  return token && token.length > 0 ? token : undefined;
}

export async function uploadDocument(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return run(async () => {
    const token = blobToken();
    if (!token) {
      throw new ValidationError(
        'Falta conectar Vercel Blob: crea el store en Vercel → Storage y vuelve a intentar.',
      );
    }

    const file = formData.get('file');
    if (!(file instanceof File) || file.size === 0) {
      throw new ValidationError('Elige un archivo.');
    }
    if (file.size > MAX_BYTES) {
      throw new ValidationError('El archivo pasa de 25 MB.');
    }
    if (!ALLOWED_TYPES.has(file.type)) {
      throw new ValidationError('Sólo se aceptan PDF, imágenes o CSV.');
    }

    const rawDate = String(formData.get('docDate') ?? '').trim();
    if (rawDate && !isISODate(rawDate)) {
      throw new ValidationError('La fecha del documento no es válida.');
    }

    // Blob privado: la URL por sí sola no sirve, hay que presentar el token
    // del store. El portal lo hace desde el servidor en /api/documentos/<id>.
    const blob = await put(`documentos/${file.name}`, file, {
      access: 'private',
      addRandomSuffix: true,
      contentType: file.type,
      token,
    });

    await db.insert(documents).values({
      title: requiredText(formData, 'title', 'el título del documento'),
      kind: oneOf(formData, 'kind', 'El tipo de documento', DOCUMENT_KINDS),
      filename: file.name,
      contentType: file.type,
      sizeBytes: file.size,
      blobUrl: blob.url,
      blobPathname: blob.pathname,
      docDate: rawDate || null,
      notes: optionalText(formData, 'notes'),
    });

    revalidatePath('/', 'layout');
  });
}

export async function deleteDocument(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return run(async () => {
    const id = requiredId(formData);
    const [row] = await db.select().from(documents).where(eq(documents.id, id)).limit(1);
    if (!row) throw new ValidationError('El documento ya no existe.');

    const token = blobToken();
    if (token) {
      // Si el borrado del blob falla, la fila se borra igual: un archivo
      // huérfano molesta menos que un registro que no se puede quitar.
      await del(row.blobPathname, { token }).catch(() => {});
    }

    await db.delete(documents).where(eq(documents.id, id));
    revalidatePath('/', 'layout');
  });
}
