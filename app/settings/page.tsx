'use client';

import ProtectedRoute from '@/src/components/ProtectedRoute';
import Settings from '@/src/components/Settings';

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <Settings />
    </ProtectedRoute>
  );
}
