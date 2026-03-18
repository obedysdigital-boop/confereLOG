'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Bell, Shield, User, Database, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GerenciarUsuarios } from '@/components/GerenciarUsuarios';
import { GerenciarTabelaFretes } from '@/components/GerenciarTabelaFretes';

export default function ConfiguracoesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.tipo !== 'administrador')) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#0F5132]" />
      </div>
    );
  }

  if (!user || user.tipo !== 'administrador') {
    return null;
  }

  return (
    <MainLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
          <p className="text-muted-foreground">
            Gerencie as configurações do sistema (Acesso Administrador)
          </p>
        </div>

        <Tabs defaultValue="usuarios" className="space-y-4">
          <TabsList>
            <TabsTrigger value="usuarios">
              <User className="w-4 h-4 mr-2" />
              Usuários
            </TabsTrigger>
            <TabsTrigger value="tabela-fretes">
              <Database className="w-4 h-4 mr-2" />
              Tabela de Fretes
            </TabsTrigger>
            <TabsTrigger value="sistema">
              <Settings className="w-4 h-4 mr-2" />
              Sistema
            </TabsTrigger>
          </TabsList>

          <TabsContent value="usuarios" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Gerenciamento de Usuários</CardTitle>
                <CardDescription>
                  Cadastre, edite ou remova usuários do sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <GerenciarUsuarios />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tabela-fretes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Tabela de Fretes</CardTitle>
                <CardDescription>
                  Visualize e edite os valores da tabela de fretes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <GerenciarTabelaFretes />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sistema" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-[#0F5132]" />
                    <CardTitle>Notificações</CardTitle>
                  </div>
                  <CardDescription>
                    Configure suas preferências de notificação
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Em desenvolvimento...
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-[#0F5132]" />
                    <CardTitle>Segurança</CardTitle>
                  </div>
                  <CardDescription>
                    Gerencie senha e autenticação
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Em desenvolvimento...
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
