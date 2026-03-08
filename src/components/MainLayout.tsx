'use client';

import { ProtectedRoute } from './ProtectedRoute';
import { UserHeader } from './UserHeader';

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <UserHeader />
        <main className="container mx-auto px-4 py-6">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
