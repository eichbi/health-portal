'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { db } from '@/db';
import { supplementDefs, supplementLogs } from '@/db/schema';
import {
  optionalText,
  requiredDate,
  requiredId,
  requiredNumber,
  requiredText,
  run,
  type ActionState,
} from '@/lib/validation';

/** R3: un tap marca o desmarca; el estado persiste por día. */
export async function toggleSupplement(formData: FormData): Promise<void> {
  const date = requiredDate(formData);
  const supplementDefId = requiredNumber(formData, 'supplementDefId', 'El suplemento', {
    integer: true,
    min: 1,
  });
  const taken = formData.get('taken') === '1';

  await db
    .insert(supplementLogs)
    .values({ date, supplementDefId, taken })
    .onConflictDoUpdate({
      target: [supplementLogs.date, supplementLogs.supplementDefId],
      set: { taken },
    });

  revalidatePath('/', 'layout');
}

export async function markAllSupplements(formData: FormData): Promise<void> {
  const date = requiredDate(formData);
  const taken = formData.get('taken') === '1';
  const defs = await db
    .select({ id: supplementDefs.id })
    .from(supplementDefs)
    .where(eq(supplementDefs.active, true));

  if (defs.length > 0) {
    await db
      .insert(supplementLogs)
      .values(defs.map((d) => ({ date, supplementDefId: d.id, taken })))
      .onConflictDoUpdate({
        target: [supplementLogs.date, supplementLogs.supplementDefId],
        set: { taken },
      });
  }
  revalidatePath('/', 'layout');
}

export async function saveSupplementDef(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return run(async () => {
    const values = {
      name: requiredText(formData, 'name', 'el nombre del suplemento'),
      timingLabel: optionalText(formData, 'timingLabel', 120) ?? '',
      active: formData.getAll('active').includes('1'),
    };

    const id = formData.get('id');
    if (id) {
      await db.update(supplementDefs).set(values).where(eq(supplementDefs.id, requiredId(formData)));
    } else {
      const rows = await db.select({ id: supplementDefs.id }).from(supplementDefs);
      await db.insert(supplementDefs).values({ ...values, sortOrder: rows.length });
    }
    revalidatePath('/', 'layout');
  });
}

export async function deleteSupplementDef(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return run(async () => {
    await db.delete(supplementDefs).where(eq(supplementDefs.id, requiredId(formData)));
    revalidatePath('/', 'layout');
  });
}
