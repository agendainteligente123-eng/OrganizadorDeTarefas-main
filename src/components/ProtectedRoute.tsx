'use client';

import { useAuth } from '@/src/components/AuthProvider';
import AuthScreen from '@/src/components/AuthScreen';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-secondary rounded-full mb-4"></div>
          <p className="text-secondary font-medium">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  return <>{children}</>;
}
