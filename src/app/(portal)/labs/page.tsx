import { LabPanelsManager, SecaManager } from '@/components/labs/LabsManager';
import { MarkerTable } from '@/components/labs/MarkerTable';
import { SecaTable } from '@/components/labs/SecaTable';
import { Card, ScreenHeader } from '@/components/ui';
import { todayISO } from '@/lib/date';
import { buildMarkerMatrix, getLabPanels, getSecaMeasurements } from '@/lib/queries/labs';

export const dynamic = 'force-dynamic';

export default async function LabsPage() {
  const today = todayISO();
  const [panels, seca] = await Promise.all([getLabPanels(), getSecaMeasurements()]);
  const matrix = buildMarkerMatrix(panels);

  return (
    <main className="flex flex-col gap-4">
      <ScreenHeader path="labs" meta="panel contra panel, medición contra medición" />

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
