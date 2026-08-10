'use client';

import { useActionState, useEffect, useState } from 'react';
import { deleteDocument, uploadDocument } from '@/actions/documents';
import { Field, FormError, SubmitButton, TextArea, TextInput, Select } from '@/components/form';
import { Sheet } from '@/components/Sheet';
import { formatLong } from '@/lib/date';
import type { ActionState } from '@/lib/validation';
import type { DocumentKind, StoredDocument } from '@/db/schema';

const KIND_LABELS: Record<DocumentKind, string> = {
  PLAN: 'Plan',
  LAB: 'Laboratorio',
  SECA: 'SECA',
  OTHER: 'Otro',
};

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DocumentsManager({
  documents,
  blobReady,
}: {
  documents: StoredDocument[];
  blobReady: boolean;
}) {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<StoredDocument | null>(null);

  return (
    <>
      {documents.length > 0 && (
        <ul className="mb-3 flex flex-col gap-2">
          {documents.map((document) => (
            <li
              key={document.id}
              className="flex items-center gap-3 rounded-md border border-line bg-field px-3 py-3"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-idle-bg text-[11px] font-bold text-ink-soft">
                {document.contentType.includes('pdf')
                  ? 'PDF'
                  : document.contentType.startsWith('image/')
                    ? 'IMG'
                    : 'CSV'}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold leading-tight">{document.title}</p>
                <p className="text-[13px] text-ink-soft">
                  {KIND_LABELS[document.kind]} · {formatSize(document.sizeBytes)}
                  {document.docDate ? ` · ${formatLong(document.docDate)}` : ''}
                </p>
              </div>
              <a
                href={`/api/documentos/${document.id}`}
                target="_blank"
                rel="noreferrer"
                className="tap rounded-lg px-2 py-1 text-[14px] font-semibold text-brand"
              >
                Abrir
              </a>
              <button
                type="button"
                onClick={() => setDeleting(document)}
                className="tap rounded-lg px-2 py-1 text-[14px] font-semibold text-bad"
              >
                Borrar
              </button>
            </li>
          ))}
        </ul>
      )}

      {blobReady ? (
        <button
          type="button"
          onClick={() => setUploading(true)}
          className="tap w-full rounded-md border border-dashed border-line bg-field py-3 font-semibold text-brand"
        >
          + Subir documento
        </button>
      ) : (
        <div className="rounded-md bg-warn-bg p-3 text-[14px] text-warn">
          <p className="font-semibold">Falta conectar el almacenamiento</p>
          <p className="mt-1">
            En Vercel → Storage → Create Blob, conéctalo a este proyecto y vuelve a desplegar. Sin
            eso no se pueden guardar archivos.
          </p>
        </div>
      )}

      <Sheet open={uploading} title="Subir documento" onClose={() => setUploading(false)}>
        <UploadForm onDone={() => setUploading(false)} />
      </Sheet>

      <Sheet open={deleting !== null} title="Borrar documento" onClose={() => setDeleting(null)}>
        {deleting && <DeleteForm document={deleting} onDone={() => setDeleting(null)} />}
      </Sheet>
    </>
  );
}

function UploadForm({ onDone }: { onDone: () => void }) {
  const [state, formAction] = useActionState<ActionState, FormData>(uploadDocument, {});

  useEffect(() => {
    if (state.ok) onDone();
  }, [state, onDone]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Field label="Archivo" hint="PDF, imagen o CSV · máximo 25 MB">
        <TextInput type="file" name="file" accept=".pdf,image/*,.csv" required />
      </Field>
      <Field label="Título">
        <TextInput name="title" placeholder="Ej. Panel de sangre septiembre" required />
      </Field>
      <Field label="Tipo">
        <Select name="kind" defaultValue="OTHER">
          <option value="PLAN">Plan</option>
          <option value="LAB">Laboratorio</option>
          <option value="SECA">SECA</option>
          <option value="OTHER">Otro</option>
        </Select>
      </Field>
      <Field label="Fecha del documento" hint="Opcional">
        <TextInput type="date" name="docDate" />
      </Field>
      <Field label="Notas" hint="Opcional">
        <TextArea name="notes" rows={2} />
      </Field>
      <FormError message={state.error} />
      <SubmitButton pendingLabel="Subiendo…">Subir</SubmitButton>
    </form>
  );
}

function DeleteForm({ document, onDone }: { document: StoredDocument; onDone: () => void }) {
  const [state, formAction] = useActionState<ActionState, FormData>(deleteDocument, {});

  useEffect(() => {
    if (state.ok) onDone();
  }, [state, onDone]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="id" value={document.id} />
      <p className="text-[15px] text-ink-soft">
        Se borrará «{document.title}» y su archivo. No se puede deshacer.
      </p>
      <FormError message={state.error} />
      <SubmitButton variant="danger" pendingLabel="Borrando…">
        Borrar documento
      </SubmitButton>
    </form>
  );
}
