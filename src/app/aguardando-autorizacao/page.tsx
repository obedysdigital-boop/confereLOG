'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, LogOut } from 'lucide-react';
import Image from 'next/image';

export default function AguardandoAutorizacaoPage() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (user.tipo !== 'novo') {
        router.push('/');
      }
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0F5132] to-[#16A34A] p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4">
          <div className="flex justify-center">
            <Image
              src="/logo.png"
              alt="ConfereLOG"
              width={80}
              height={80}
              className="rounded-lg"
            />
          </div>
          <div className="text-center">
            <CardTitle className="text-2xl font-bold">Aguardando Autorização</CardTitle>
            <CardDescription>Sua conta está pendente de aprovação</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center justify-center space-y-4 py-8">
            <div className="w-20 h-20 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center">
              <Clock className="w-10 h-10 text-yellow-600 dark:text-yellow-500" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                Olá, {user.nome_completo || user.usuario}!
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Sua conta foi criada com sucesso, mas ainda não foi autorizada pelo administrador.
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Você receberá acesso ao sistema assim que um administrador aprovar sua conta.
              </p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                <strong>Dica:</strong> Entre em contato com o administrador do sistema para acelerar o processo de aprovação.
              </p>
            </div>
            <Button
              onClick={logout}
              variant="outline"
              className="w-full"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
