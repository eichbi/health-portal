'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { db } from '@/db';
import { labPanels, labResults } from '@/db/schema';
import { computeHomaIr, HOMA_IR, GLUCOSE, INSULIN } from '@/lib/labs';
import {
  optionalText,
  requiredDate,
  requiredId,
  run,
  ValidationError,
  type ActionState,
} from '@/lib/validation';

type ParsedResult = { marker: string; value: number; unit: string };

/**
 * Las filas llegan como arrays paralelos (marker[i], value[i], unit[i]).
 * Las que vienen sin valor simplemente no se guardan.
 */
function parseResults(formData: FormData): ParsedResult[] {
  const markers = formData.getAll('marker').map(String);
  const values = formData.getAll('value').map(String);
  const units = formData.getAll('unit').map(String);

  const results: ParsedResult[] = [];
  for (let i = 0; i < markers.length; i++) {
    const marker = markers[i]?.trim();
    const rawValue = (values[i] ?? '').trim().replace(',', '.');
    if (!rawValue) continue;
    if (!marker) throw new ValidationError('Hay un valor sin nombre de marcador.');

    const value = Number(rawValue);
    if (!Number.isFinite(value)) {
      throw new ValidationError(`El valor de ${marker} no es un número.`);
    }
    if (results.some((r) => r.marker.toLowerCase() === marker.toLowerCase())) {
      throw new ValidationError(`El marcador ${marker} está repetido.`);
    }
    results.push({ marker, value, unit: (units[i] ?? '').trim() });
  }
  return results;
}

/** R7: HOMA-IR se calcula solo, pero un valor capturado a mano manda. */
function withHomaIr(results: ParsedResult[]): ParsedResult[] {
  if (results.some((r) => r.marker === HOMA_IR)) return results;

  const glucose = results.find((r) => r.marker === GLUCOSE)?.value;
  const insulin = results.find((r) => r.marker === INSULIN)?.value;
  const homa = computeHomaIr(glucose, insulin);
  if (homa === null) return results;

  return [...results, { marker: HOMA_IR, value: homa, unit: '' }];
}

export async function saveLabPanel(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return run(async () => {
    const date = requiredDate(formData);
    const notes = optionalText(formData, 'notes');
    const results = withHomaIr(parseResults(formData));

    if (results.length === 0) {
      throw new ValidationError('Captura al menos un marcador con valor.');
    }

    const rawId = formData.get('id');
    const panelId = rawId
      ? await (async () => {
          const id = requiredId(formData);
          await db.update(labPanels).set({ date, notes }).where(eq(labPanels.id, id));
          await db.delete(labResults).where(eq(labResults.panelId, id));
          return id;
        })()
      : (await db.insert(labPanels).values({ date, notes }).returning({ id: labPanels.id }))[0].id;

    await db
      .insert(labResults)
      .values(results.map((r, index) => ({ panelId, ...r, sortOrder: index })));

    revalidatePath('/', 'layout');
  });
}

export async function deleteLabPanel(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return run(async () => {
    await db.delete(labPanels).where(eq(labPanels.id, requiredId(formData)));
    revalidatePath('/', 'layout');
  });
}
