import { DriverDetailsPage } from '@/features/drivers';

interface DriverDetailsRouteProps {
  params: Promise<{ id: string }>;
}

export default async function DriverDetailsRoute({ params }: DriverDetailsRouteProps) {
  const { id } = await params;
  return <DriverDetailsPage driverId={id} />;
}
