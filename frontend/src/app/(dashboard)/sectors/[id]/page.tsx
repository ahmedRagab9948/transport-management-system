import { SectorDetailPage } from '@/features/sectors';

interface SectorDetailRouteProps {
  params: Promise<{ id: string }>;
}

export default async function SectorDetailRoute({ params }: SectorDetailRouteProps) {
  const { id } = await params;
  return <SectorDetailPage sectorId={id} />;
}
