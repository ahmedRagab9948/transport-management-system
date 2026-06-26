import { EditSectorPage } from '@/features/sectors';

interface EditSectorRouteProps {
  params: Promise<{ id: string }>;
}

export default async function EditSectorRoute({ params }: EditSectorRouteProps) {
  const { id } = await params;
  return <EditSectorPage sectorId={id} />;
}
