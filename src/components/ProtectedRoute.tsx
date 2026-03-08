'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, hasAccess } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (!hasAccess()) {
        router.push('/aguardando-autorizacao');
      }
    }
  }, [user, loading, hasAccess, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#0F5132]" />
      </div>
    );
  }

  if (!user || !hasAccess()) {
    return null;
  }

  return <>{children}</>;
}
