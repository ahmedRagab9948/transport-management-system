import { EditVehiclePage } from '@/features/vehicles';

interface EditVehicleRouteProps {
  params: Promise<{ id: string }>;
}

export default async function EditVehicleRoute({ params }: EditVehicleRouteProps) {
  const { id } = await params;
  return <EditVehiclePage vehicleId={id} />;
}
