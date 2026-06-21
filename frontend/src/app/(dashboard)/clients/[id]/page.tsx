import { ClientDetailsPage } from '@/features/clients';

interface ClientDetailsRouteProps {
  params: Promise<{ id: string }>;
}

export default async function ClientDetailsRoute({ params }: ClientDetailsRouteProps) {
  const { id } = await params;
  return <ClientDetailsPage clientId={id} />;
}
