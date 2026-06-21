import { EditDriverPage } from '@/features/drivers';

interface EditDriverRouteProps {
  params: Promise<{ id: string }>;
}

export default async function EditDriverRoute({ params }: EditDriverRouteProps) {
  const { id } = await params;
  return <EditDriverPage driverId={id} />;
}
