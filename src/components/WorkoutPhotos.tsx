'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { deleteDocument, listWorkoutPhotos, uploadWorkoutPhoto } from '@/actions/documents';
import type { ActionState } from '@/lib/validation';
import type { StoredDocument } from '@/db/schema';

/**
 * Fotos de evidencia de un entreno ya guardado (captura de Apple Fitness,
 * Strava, etc.). Sólo aplica a entrenos existentes: hace falta el id para
 * vincular la foto, así que no está disponible al crear el registro.
 */
export function WorkoutPhotos({ workoutId }: { workoutId: number }) {
  const [photos, setPhotos] = useState<StoredDocument[] | null>(null);
  const [state, formAction] = useActionState<ActionState, FormData>(uploadWorkoutPhoto, {});
  const formRef = useRef<HTMLFormElement>(null);

  const refresh = () => {
    listWorkoutPhotos(workoutId).then(setPhotos);
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workoutId]);

  useEffect(() => {
    if (state.ok) {
      refresh();
      formRef.current?.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const remove = async (id: number) => {
    const formData = new FormData();
    formData.set('id', String(id));
    await deleteDocument({}, formData);
    refresh();
  };

  return (
    <div className="border-t border-line pt-3">
      <p className="term-label mb-2">Fotos de evidencia</p>

      {photos === null ? (
        <p className="text-[13px] text-ink-faint">Cargando…</p>
      ) : photos.length > 0 ? (
        <ul className="mb-3 flex flex-wrap gap-2">
          {photos.map((photo) => (
            <li key={photo.id} className="relative">
              <a href={`/api/documentos/${photo.id}`} target="_blank" rel="noreferrer">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/api/documentos/${photo.id}`}
                  alt={photo.title}
                  className="size-20 rounded-md border border-line object-cover"
                />
              </a>
              <button
                type="button"
                onClick={() => remove(photo.id)}
                aria-label={`Borrar ${photo.title}`}
                className="tap absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-bad text-[11px] font-bold text-canvas"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mb-3 text-[13px] text-ink-faint">
          Sin fotos. Adjunta la captura de tu app de fitness.
        </p>
      )}

      <form ref={formRef} action={formAction}>
        <input type="hidden" name="workoutId" value={workoutId} />
        <label className="tap block w-full cursor-pointer rounded-md border border-dashed border-line bg-field py-2.5 text-center text-[14px] font-semibold text-brand">
          + Adjuntar foto
          <input
            type="file"
            name="file"
            accept="image/*"
            capture="environment"
            className="sr-only"
            onChange={() => formRef.current?.requestSubmit()}
          />
        </label>
      </form>
      {state.error && <p className="mt-2 text-[13px] text-bad">✗ {state.error}</p>}
    </div>
  );
}
