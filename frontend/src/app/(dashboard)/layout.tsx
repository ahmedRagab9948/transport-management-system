import { DashboardShell } from '@/components/layout/dashboard-shell';
import { ErrorBoundary } from '@/components/shared/error-boundary';
import { ProtectedRoute } from '@/features/auth/components/protected-route';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <DashboardShell>
        <ErrorBoundary>{children}</ErrorBoundary>
      </DashboardShell>
    </ProtectedRoute>
  );
}
