'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Activity } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface LogAtividade {
  id: string;
  usuario: string;
  tipo_usuario: string;
  acao: string;
  tabela: string;
  registro_id: string;
  detalhes: Record<string, any>;
  created_at: string;
}

export function LogsAtividades() {
  const [logs, setLogs] = useState<LogAtividade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/logs-atividades');
      const data = await res.json();
      setLogs(data.logs || []);
    } catch (error) {
      toast.error('Erro ao carregar logs');
    } finally {
      setLoading(false);
    }
  };

  const getAcaoLabel = (acao: string) => {
    const labels: Record<string, string> = {
      'IMPORTAR_DADOS': 'Importação',
      'ADICIONAR_JUSTIFICATIVA': 'Justificativa Adicionada',
      'ATUALIZAR_JUSTIFICATIVA': 'Justificativa Atualizada',
      'AUTORIZAR_FRETE': 'Frete Autorizado',
      'DESAUTORIZAR_FRETE': 'Autorização Removida',
    };
    return labels[acao] || acao;
  };

  const getAcaoColor = (acao: string) => {
    const colors: Record<string, string> = {
      'IMPORTAR_DADOS': 'bg-blue-600',
      'ADICIONAR_JUSTIFICATIVA': 'bg-green-600',
      'ATUALIZAR_JUSTIFICATIVA': 'bg-yellow-600',
      'AUTORIZAR_FRETE': 'bg-green-600',
      'DESAUTORIZAR_FRETE': 'bg-red-600',
    };
    return colors[acao] || 'bg-gray-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#0F5132]" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-5 h-5 text-[#0F5132]" />
        <h2 className="text-lg font-semibold">Logs de Atividades</h2>
        <Badge variant="outline" className="ml-auto">
          {logs.length} registros
        </Badge>
      </div>

      <Card className="overflow-hidden dark:bg-[#434343] dark:border-[#606060]">
        <div className="max-h-[600px] overflow-y-auto">
          {logs.length === 0 ? (
            <div className="text-center py-8 text-sm text-gray-500">
              Nenhum log de atividade
            </div>
          ) : (
            <div className="divide-y">
              {logs.map((log) => (
                <div key={log.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={`text-xs ${getAcaoColor(log.acao)}`}>
                          {getAcaoLabel(log.acao)}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {log.tabela}
                        </span>
                      </div>
                      
                      <div className="text-sm font-medium mb-1">
                        {log.usuario}
                        <span className="text-xs text-gray-500 ml-2">
                          ({log.tipo_usuario})
                        </span>
                      </div>

                      {log.detalhes && (
                        <div className="text-xs text-gray-600 mt-2 space-y-1">
                          {log.detalhes.id_carga && (
                            <div>Carga: {log.detalhes.id_carga}</div>
                          )}
                          {log.detalhes.nome_arquivo && (
                            <div>Arquivo: {log.detalhes.nome_arquivo}</div>
                          )}
                          {log.detalhes.qtd_registros !== undefined && (
                            <div>Registros: {log.detalhes.qtd_registros}</div>
                          )}
                          {log.detalhes.justificativa_nova && (
                            <div className="italic">
                              "{log.detalhes.justificativa_nova.substring(0, 100)}
                              {log.detalhes.justificativa_nova.length > 100 ? '...' : ''}"
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="text-xs text-gray-500 text-right whitespace-nowrap">
                      {format(new Date(log.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
