'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
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

interface StatusButtonProps {
  id: string;
  idCarga: string;
  currentStatus: string;
  statusAtual: string; // Status do frete (OK, Diverge, etc)
  onStatusChanged: () => void;
}

export function StatusButton({ id, idCarga, currentStatus, statusAtual, onStatusChanged }: StatusButtonProps) {
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const { user } = useAuth();

  const handleStatusChange = async () => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return;
    }

    setLoading(true);
    try {
      const newStatus = currentStatus === 'Não autorizado' ? 'Validado e Autorizado' : 'Não autorizado';

      const res = await fetch('/api/fretes/status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          status_validacao: newStatus,
          validado_por_usuario: user.usuario,
          validado_por_tipo: user.tipo,
          status_atual: statusAtual, // Enviar status atual para API decidir se marca como Justificado
        }),
      });

      if (!res.ok) {
        throw new Error('Erro ao atualizar status');
      }

      // Registrar log
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario_id: user.id,
          usuario: user.usuario,
          tipo_usuario: user.tipo,
          acao: 'mudanca_status',
          tabela: 'dados_fretes',
          registro_id: id,
          detalhes: {
            id_carga: idCarga,
            status_anterior: currentStatus,
            status_novo: newStatus,
          },
        }),
      });

      toast.success('Status atualizado com sucesso!');
      onStatusChanged();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar status');
    } finally {
      setLoading(false);
      setShowDialog(false);
    }
  };

  const isAutorizado = currentStatus === 'Validado e Autorizado';

  return (
    <>
      <Button
        size="sm"
        variant={isAutorizado ? 'default' : 'outline'}
        className={`h-7 text-xs ${
          isAutorizado
            ? 'bg-green-600 hover:bg-green-700 text-white'
            : 'border-red-300 text-red-600 hover:bg-red-50'
        }`}
        onClick={() => setShowDialog(true)}
        disabled={loading}
      >
        {loading ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : isAutorizado ? (
          <>
            <CheckCircle className="w-3 h-3 mr-1" />
            Autorizado
          </>
        ) : (
          'Não autorizado'
        )}
      </Button>

      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar mudança de status</AlertDialogTitle>
            <AlertDialogDescription>
              Você está prestes a mudar o status da carga <strong>{idCarga}</strong> de{' '}
              <strong>{currentStatus}</strong> para{' '}
              <strong>{isAutorizado ? 'Não autorizado' : 'Validado e Autorizado'}</strong>.
              <br />
              <br />
              Esta ação será registrada no sistema com seu usuário.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleStatusChange}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
