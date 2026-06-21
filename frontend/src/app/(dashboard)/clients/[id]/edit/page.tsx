import { EditClientPage } from '@/features/clients';

interface EditClientRouteProps {
  params: Promise<{ id: string }>;
}

export default async function EditClientRoute({ params }: EditClientRouteProps) {
  const { id } = await params;
  return <EditClientPage clientId={id} />;
}
