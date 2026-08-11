import { NotesList } from '@/components/NotesList';
import { Card, Empty, ScreenHeader } from '@/components/ui';
import { getNotes } from '@/lib/queries/notes';

export const dynamic = 'force-dynamic';

export default async function NotesPage() {
  const notes = await getNotes();

  return (
    <main className="flex flex-col gap-4">
      <ScreenHeader
        path="notas"
        meta={notes.length === 0 ? 'sin nada guardado todavía' : `${notes.length} guardada${notes.length === 1 ? '' : 's'}`}
      />

      <Card>
        {notes.length === 0 ? (
          <Empty>Captura una idea desde el botón + en Hoy.</Empty>
        ) : (
          <NotesList notes={notes} />
        )}
      </Card>
    </main>
  );
}
