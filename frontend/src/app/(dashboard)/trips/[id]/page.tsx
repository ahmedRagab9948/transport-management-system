import { TripDetailsPage } from '@/features/trips';

interface TripDetailsRouteProps {
  params: Promise<{ id: string }>;
}

export default async function TripDetailsRoute({ params }: TripDetailsRouteProps) {
  const { id } = await params;
  return <TripDetailsPage tripId={id} />;
}
