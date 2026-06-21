import { VehicleDetailsPage } from '@/features/vehicles';

interface VehicleDetailsRouteProps {
  params: Promise<{ id: string }>;
}

export default async function VehicleDetailsRoute({ params }: VehicleDetailsRouteProps) {
  const { id } = await params;
  return <VehicleDetailsPage vehicleId={id} />;
}
