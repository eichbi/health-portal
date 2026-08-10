import 'server-only';
import { asc, desc, inArray } from 'drizzle-orm';
import { db } from '@/db';
import { labPanels, labResults, secaMeasurements, type SecaMeasurement } from '@/db/schema';
import type { ISODate } from '../date';

export type PanelWithResults = {
  id: number;
  date: ISODate;
  notes: string | null;
  results: Array<{ marker: string; value: number; unit: string }>;
};

export type MarkerMatrix = {
  /** Paneles de más reciente a más antiguo (el orden de las columnas). */
  panels: Array<{ id: number; date: ISODate }>;
  markers: string[];
  unitByMarker: Record<string, string>;
  /** `values[marcador][panelId]` */
  values: Record<string, Record<number, number>>;
};

export async function getLabPanels(): Promise<PanelWithResults[]> {
  const panels = await db.select().from(labPanels).orderBy(desc(labPanels.date), desc(labPanels.id));
  if (panels.length === 0) return [];

  const results = await db
    .select()
    .from(labResults)
    .where(
      inArray(
        labResults.panelId,
        panels.map((p) => p.id),
      ),
    )
    .orderBy(asc(labResults.sortOrder), asc(labResults.id));

  const byPanel = new Map<number, PanelWithResults['results']>();
  for (const row of results) {
    const list = byPanel.get(row.panelId) ?? [];
    list.push({ marker: row.marker, value: row.value, unit: row.unit });
    byPanel.set(row.panelId, list);
  }

  return panels.map((panel) => ({
    id: panel.id,
    date: panel.date,
    notes: panel.notes,
    results: byPanel.get(panel.id) ?? [],
  }));
}

/** Tabla marcador × fecha, al estilo del TableView de SECA (R7). */
export function buildMarkerMatrix(panels: PanelWithResults[], maxPanels = 6): MarkerMatrix {
  const visible = panels.slice(0, maxPanels);
  const markers: string[] = [];
  const unitByMarker: Record<string, string> = {};
  const values: Record<string, Record<number, number>> = {};

  for (const panel of visible) {
    for (const result of panel.results) {
      if (!markers.includes(result.marker)) markers.push(result.marker);
      if (result.unit && !unitByMarker[result.marker]) unitByMarker[result.marker] = result.unit;
      values[result.marker] ??= {};
      values[result.marker][panel.id] = result.value;
    }
  }

  return {
    panels: visible.map((panel) => ({ id: panel.id, date: panel.date })),
    markers,
    unitByMarker,
    values,
  };
}

export async function getSecaMeasurements(): Promise<SecaMeasurement[]> {
  return db.select().from(secaMeasurements).orderBy(desc(secaMeasurements.date));
}
