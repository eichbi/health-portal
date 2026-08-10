import { get } from '@vercel/blob';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { documents } from '@/db/schema';

/**
 * Sirve el archivo haciendo de intermediario con Vercel Blob. El blob es
 * privado: su URL no se puede leer sin el token del store, que sólo existe en
 * el servidor. Así el documento exige sesión válida por dos caminos — el
 * middleware protege esta ruta, y el almacenamiento no responde sin token.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId < 1) {
    return new NextResponse('Documento no válido', { status: 400 });
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    return new NextResponse('Falta configurar el almacenamiento', { status: 503 });
  }

  const [document] = await db.select().from(documents).where(eq(documents.id, numericId)).limit(1);
  if (!document) return new NextResponse('Documento no encontrado', { status: 404 });

  const result = await get(document.blobPathname, { access: 'private', token });
  if (!result || !result.stream) {
    return new NextResponse('No se pudo leer el archivo', { status: 502 });
  }

  return new NextResponse(result.stream, {
    headers: {
      'Content-Type': document.contentType,
      'Content-Disposition': `inline; filename="${encodeURIComponent(document.filename)}"`,
      // Nada de caché compartida: es contenido personal detrás de sesión.
      'Cache-Control': 'private, no-store',
    },
  });
}
