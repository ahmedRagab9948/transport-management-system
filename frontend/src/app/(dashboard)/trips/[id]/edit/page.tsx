import { EditTripPage } from '@/features/trips';

interface EditTripRouteProps {
  params: Promise<{ id: string }>;
}

export default async function EditTripRoute({ params }: EditTripRouteProps) {
  const { id } = await params;
  return <EditTripPage tripId={id} />;
}
