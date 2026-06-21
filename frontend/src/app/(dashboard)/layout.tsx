import { DashboardShell } from '@/components/layout/dashboard-shell';
import { ProtectedRoute } from '@/features/auth/components/protected-route';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <DashboardShell>{children}</DashboardShell>
    </ProtectedRoute>
  );
}
