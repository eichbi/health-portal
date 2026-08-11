'use server';

import { del, put } from '@vercel/blob';
import { asc, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { db } from '@/db';
import { DOCUMENT_KINDS, documents, type StoredDocument } from '@/db/schema';
import {
  oneOf,
  optionalText,
  requiredId,
  requiredNumber,
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

const ALLOWED_PHOTO_TYPES = new Set(['image/jpeg', 'image/png', 'image/heic', 'image/webp']);

function blobToken(): string | undefined {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  return token && token.length > 0 ? token : undefined;
}

function readFile(formData: FormData, maxBytes: number, allowed: Set<string>): File {
  const file = formData.get('file');
  if (!(file instanceof File) || file.size === 0) {
    throw new ValidationError('Elige un archivo.');
  }
  if (file.size > maxBytes) {
    throw new ValidationError(`El archivo pasa de ${Math.round(maxBytes / (1024 * 1024))} MB.`);
  }
  if (!allowed.has(file.type)) {
    throw new ValidationError('Tipo de archivo no admitido.');
  }
  return file;
}

async function uploadToBlob(file: File) {
  const token = blobToken();
  if (!token) {
    throw new ValidationError(
      'Falta conectar Vercel Blob: crea el store en Vercel → Storage y vuelve a intentar.',
    );
  }
  // Blob privado: la URL por sí sola no sirve, hay que presentar el token
  // del store. El portal lo hace desde el servidor en /api/documentos/<id>.
  const blob = await put(`documentos/${file.name}`, file, {
    access: 'private',
    addRandomSuffix: true,
    contentType: file.type,
    token,
  });
  return blob;
}

export async function uploadDocument(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return run(async () => {
    const file = readFile(formData, MAX_BYTES, ALLOWED_TYPES);

    const rawDate = String(formData.get('docDate') ?? '').trim();
    if (rawDate && !isISODate(rawDate)) {
      throw new ValidationError('La fecha del documento no es válida.');
    }

    const blob = await uploadToBlob(file);

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

/** Foto de evidencia de un entreno ya guardado (captura de Apple Fitness, etc.). */
export async function uploadWorkoutPhoto(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return run(async () => {
    const workoutId = requiredNumber(formData, 'workoutId', 'El entreno', {
      integer: true,
      min: 1,
    });
    // Fotos de cámara, no documentos: más pequeño y sólo imágenes.
    const file = readFile(formData, 10 * 1024 * 1024, ALLOWED_PHOTO_TYPES);
    const blob = await uploadToBlob(file);

    await db.insert(documents).values({
      title: `Foto · ${new Date().toLocaleDateString('es-MX')}`,
      kind: 'OTHER',
      filename: file.name,
      contentType: file.type,
      sizeBytes: file.size,
      blobUrl: blob.url,
      blobPathname: blob.pathname,
      workoutId,
    });

    revalidatePath('/', 'layout');
  });
}

export async function listWorkoutPhotos(workoutId: number): Promise<StoredDocument[]> {
  return db
    .select()
    .from(documents)
    .where(eq(documents.workoutId, workoutId))
    .orderBy(asc(documents.uploadedAt));
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
