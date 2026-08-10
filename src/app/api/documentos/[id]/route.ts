import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { documents } from '@/db/schema';

/**
 * Sirve el archivo haciendo de intermediario con Vercel Blob: la URL del blob
 * nunca llega al navegador, así que el documento sólo se alcanza con sesión
 * válida (el middleware protege esta ruta como cualquier otra).
 */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId < 1) {
    return new NextResponse('Documento no válido', { status: 400 });
  }

  const [document] = await db
    .select()
    .from(documents)
    .where(eq(documents.id, numericId))
    .limit(1);

  if (!document) return new NextResponse('Documento no encontrado', { status: 404 });

  const upstream = await fetch(document.blobUrl);
  if (!upstream.ok || !upstream.body) {
    return new NextResponse('No se pudo leer el archivo', { status: 502 });
  }

  return new NextResponse(upstream.body, {
    headers: {
      'Content-Type': document.contentType,
      'Content-Disposition': `inline; filename="${encodeURIComponent(document.filename)}"`,
      'Cache-Control': 'private, max-age=0, must-revalidate',
    },
  });
}
