import { LabPanelsManager, SecaManager } from '@/components/labs/LabsManager';
import { MarkerTable } from '@/components/labs/MarkerTable';
import { SecaTable } from '@/components/labs/SecaTable';
import { Card } from '@/components/ui';
import { todayISO } from '@/lib/date';
import { buildMarkerMatrix, getLabPanels, getSecaMeasurements } from '@/lib/queries/labs';

export const dynamic = 'force-dynamic';

export default async function LabsPage() {
  const today = todayISO();
  const [panels, seca] = await Promise.all([getLabPanels(), getSecaMeasurements()]);
  const matrix = buildMarkerMatrix(panels);

  return (
    <main className="flex flex-col gap-4">
      <header>
        <h1 className="text-xl font-bold leading-tight">Laboratorio y SECA</h1>
        <p className="text-[15px] text-ink-soft">Panel contra panel, medición contra medición.</p>
      </header>

      <Card title="Laboratorio · comparativa">
        <MarkerTable matrix={matrix} />
        <div className="mt-4 border-t border-line pt-4">
          <LabPanelsManager today={today} panels={panels} />
        </div>
      </Card>

      <Card title="Composición corporal (SECA)">
        <SecaTable measurements={seca} />
        <div className="mt-4 border-t border-line pt-4">
          <SecaManager today={today} measurements={seca} />
        </div>
      </Card>
    </main>
  );
}
