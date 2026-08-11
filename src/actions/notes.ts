'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { db } from '@/db';
import { notes } from '@/db/schema';
import { requiredId, requiredText, run, ValidationError, type ActionState } from '@/lib/validation';

const MAX_BODY_LENGTH = 500;

export async function createNote(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return run(async () => {
    const body = requiredText(formData, 'body', 'la nota');
    if (body.length > MAX_BODY_LENGTH) {
      throw new ValidationError(`La nota pasa de ${MAX_BODY_LENGTH} caracteres.`);
    }

    // Sin campo de fecha en el formulario a propósito: el momento de la
    // captura es el dato, no algo que se pueda ajustar después.
    await db.insert(notes).values({ body });

    revalidatePath('/', 'layout');
  });
}

export async function deleteNote(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return run(async () => {
    await db.delete(notes).where(eq(notes.id, requiredId(formData)));
    revalidatePath('/', 'layout');
  });
}
