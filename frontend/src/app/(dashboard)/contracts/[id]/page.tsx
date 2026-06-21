import { ContractDetailsPage } from '@/features/contracts';

interface ContractDetailsRouteProps {
  params: Promise<{ id: string }>;
}

export default async function ContractDetailsRoute({ params }: ContractDetailsRouteProps) {
  const { id } = await params;
  return <ContractDetailsPage contractId={id} />;
}
