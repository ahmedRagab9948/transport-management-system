import { EditContractPage } from '@/features/contracts';

interface EditContractRouteProps {
  params: Promise<{ id: string }>;
}

export default async function EditContractRoute({ params }: EditContractRouteProps) {
  const { id } = await params;
  return <EditContractPage contractId={id} />;
}
