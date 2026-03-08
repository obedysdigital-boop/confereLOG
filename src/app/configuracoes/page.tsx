'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, UserCheck, UserX, Shield, Users } from 'lucide-react';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Usuario {
  id: string;
  usuario: string;
  nome_completo: string | null;
  tipo: 'novo' | 'supervisor' | 'administrador';
  ativo: boolean;
  created_at: string;
}

export default function ConfiguracoesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [actionType, setActionType] = useState<'tipo' | 'ativo'>('tipo');
  const [newValue, setNewValue] = useState<string>('');

  useEffect(() => {
    if (!authLoading && (!user || user.tipo !== 'administrador')) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  const fetchUsuarios = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/usuarios');
      const data = await res.json();
      if (data.usuarios) {
        setUsuarios(data.usuarios);
      }
    } catch (error) {
      toast.error('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.tipo === 'administrador') {
      fetchUsuarios();
    }
  }, [user]);

  const handleChangeTipo = (usuario: Usuario, novoTipo: string) => {
    setSelectedUser(usuario);
    setActionType('tipo');
    setNewValue(novoTipo);
    setShowDialog(true);
  };

  const handleToggleAtivo = (usuario: Usuario) => {
    setSelectedUser(usuario);
    setActionType('ativo');
    setNewValue((!usuario.ativo).toString());
    setShowDialog(true);
  };

  const confirmAction = async () => {
    if (!selectedUser || !user) return;

    try {
      const updateData: any = {};
      
      if (actionType === 'tipo') {
        updateData.tipo = newValue;
      } else {
        updateData.ativo = newValue === 'true';
      }

      const res = await fetch('/api/usuarios', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedUser.id,
          ...updateData,
        }),
      });

      if (!res.ok) {
        throw new Error('Erro ao atualizar usuário');
      }

      // Registrar log
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario_id: user.id,
          usuario: user.usuario,
          tipo_usuario: user.tipo,
          acao: actionType === 'tipo' ? 'mudanca_tipo_usuario' : 'mudanca_status_usuario',
          tabela: 'usuarios',
          registro_id: selectedUser.id,
          detalhes: {
            usuario_alterado: selectedUser.usuario,
            valor_anterior: actionType === 'tipo' ? selectedUser.tipo : selectedUser.ativo,
            valor_novo: actionType === 'tipo' ? newValue : newValue === 'true',
          },
        }),
      });

      toast.success('Usuário atualizado com sucesso!');
      fetchUsuarios();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar usuário');
    } finally {
      setShowDialog(false);
      setSelectedUser(null);
    }
  };

  const getTipoBadge = (tipo: string) => {
    switch (tipo) {
      case 'administrador':
        return <Badge className="bg-red-100 text-red-800">Administrador</Badge>;
      case 'supervisor':
        return <Badge className="bg-blue-100 text-blue-800">Supervisor</Badge>;
      case 'novo':
        return <Badge className="bg-yellow-100 text-yellow-800">Novo</Badge>;
      default:
        return <Badge>{tipo}</Badge>;
    }
  };

  if (authLoading || loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[#0F5132]" />
        </div>
      </MainLayout>
    );
  }

  if (!user || user.tipo !== 'administrador') {
    return null;
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Configurações</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">Gerencie usuários e permissões do sistema</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Gerenciamento de Usuários
            </CardTitle>
            <CardDescription>
              Total de {usuarios.length} usuários cadastrados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 text-sm font-medium text-gray-600 dark:text-gray-400">Usuário</th>
                    <th className="text-left p-3 text-sm font-medium text-gray-600 dark:text-gray-400">Nome</th>
                    <th className="text-left p-3 text-sm font-medium text-gray-600 dark:text-gray-400">Tipo</th>
                    <th className="text-left p-3 text-sm font-medium text-gray-600 dark:text-gray-400">Status</th>
                    <th className="text-left p-3 text-sm font-medium text-gray-600 dark:text-gray-400">Cadastro</th>
                    <th className="text-right p-3 text-sm font-medium text-gray-600 dark:text-gray-400">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map((usuario) => (
                    <tr key={usuario.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="p-3 text-sm font-medium">{usuario.usuario}</td>
                      <td className="p-3 text-sm">{usuario.nome_completo || '-'}</td>
                      <td className="p-3">
                        <Select
                          value={usuario.tipo}
                          onValueChange={(value) => handleChangeTipo(usuario, value)}
                          disabled={usuario.id === user.id}
                        >
                          <SelectTrigger className="w-[150px] h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="novo">Novo</SelectItem>
                            <SelectItem value="supervisor">Supervisor</SelectItem>
                            <SelectItem value="administrador">Administrador</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="p-3">
                        {usuario.ativo ? (
                          <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-800">Inativo</Badge>
                        )}
                      </td>
                      <td className="p-3 text-sm text-gray-600">
                        {new Date(usuario.created_at).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="p-3 text-right">
                        <Button
                          size="sm"
                          variant={usuario.ativo ? 'outline' : 'default'}
                          onClick={() => handleToggleAtivo(usuario)}
                          disabled={usuario.id === user.id}
                          className="h-8"
                        >
                          {usuario.ativo ? (
                            <>
                              <UserX className="w-3 h-3 mr-1" />
                              Desativar
                            </>
                          ) : (
                            <>
                              <UserCheck className="w-3 h-3 mr-1" />
                              Ativar
                            </>
                          )}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar alteração</AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === 'tipo' ? (
                <>
                  Você está prestes a alterar o tipo do usuário <strong>{selectedUser?.usuario}</strong> para{' '}
                  <strong>{newValue}</strong>.
                </>
              ) : (
                <>
                  Você está prestes a {newValue === 'true' ? 'ativar' : 'desativar'} o usuário{' '}
                  <strong>{selectedUser?.usuario}</strong>.
                </>
              )}
              <br />
              <br />
              Esta ação será registrada no sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmAction}>Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
}
