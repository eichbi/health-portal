'use client';

import { useActionState, useEffect, useState } from 'react';
import { deleteNote } from '@/actions/notes';
import { FormError, SubmitButton } from '@/components/form';
import { Sheet } from '@/components/Sheet';
import { formatDateTime } from '@/lib/date';
import type { ActionState } from '@/lib/validation';
import type { Note } from '@/db/schema';

export function NotesList({ notes }: { notes: Note[] }) {
  const [deleting, setDeleting] = useState<Note | null>(null);

  return (
    <>
      <ul className="flex flex-col gap-2">
        {notes.map((note) => (
          <li key={note.id} className="rounded-md border border-line bg-field px-3 py-3">
            <div className="flex items-start justify-between gap-3">
              <p className="text-[13px] text-ink-faint">{formatDateTime(note.createdAt)}</p>
              <button
                type="button"
                onClick={() => setDeleting(note)}
                className="tap shrink-0 text-[13px] font-semibold text-bad"
              >
                Borrar
              </button>
            </div>
            <p className="mt-1 whitespace-pre-wrap text-[15px] text-ink">{note.body}</p>
          </li>
        ))}
      </ul>

      <Sheet open={deleting !== null} title="Borrar nota" onClose={() => setDeleting(null)}>
        {deleting && <DeleteForm note={deleting} onDone={() => setDeleting(null)} />}
      </Sheet>
    </>
  );
}

function DeleteForm({ note, onDone }: { note: Note; onDone: () => void }) {
  const [state, formAction] = useActionState<ActionState, FormData>(deleteNote, {});

  useEffect(() => {
    if (state.ok) onDone();
  }, [state, onDone]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="id" value={note.id} />
      <p className="text-[15px] text-ink-soft">Se borrará esta nota. No se puede deshacer.</p>
      <FormError message={state.error} />
      <SubmitButton variant="danger" pendingLabel="Borrando…">
        Borrar nota
      </SubmitButton>
    </form>
  );
}
