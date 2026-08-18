'use client';

import ProtectedRoute from '@/src/components/ProtectedRoute';
import Dashboard from '@/src/components/Dashboard';

export default function Home() {
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  );
}
