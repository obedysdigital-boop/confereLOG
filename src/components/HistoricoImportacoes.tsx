'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, FileSpreadsheet, Calendar, Hash, TrendingUp, TrendingDown } from 'lucide-react';
import { HistoricoImportacao } from '@/lib/supabase';

export function HistoricoImportacoes() {
  const [historico, setHistorico] = useState<HistoricoImportacao[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistorico();
  }, []);

  const fetchHistorico = async () => {
    try {
      const res = await fetch('/api/historico');
      const data = await res.json();
      setHistorico(data.data || []);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTipoLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      'dados_bi': 'BI',
      'dados_app_fretes': 'APP',
      'tabela_fretes': 'Tabela',
    };
    return labels[tipo] || tipo;
  };

  const getTipoColor = (tipo: string) => {
    const colors: Record<string, string> = {
      'dados_bi': 'bg-blue-600',
      'dados_app_fretes': 'bg-[#0F5132]',
      'tabela_fretes': 'bg-[#D4AF37]',
    };
    return colors[tipo] || 'bg-gray-600';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-[#0F5132]" />
        </CardContent>
      </Card>
    );
  }

  if (historico.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Histórico de Importações</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
            Nenhuma importação realizada ainda
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4" />
          Histórico de Importações
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Header */}
            <div className="grid grid-cols-[140px_200px_80px_100px_100px_100px_120px] gap-2 p-2 bg-gray-50 dark:bg-gray-800 text-xs font-medium text-gray-600 dark:text-gray-300 border-b dark:border-gray-700 rounded-t">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Data/Hora
              </div>
              <div>Arquivo</div>
              <div>Tipo</div>
              <div className="flex items-center gap-1">
                <Hash className="w-3 h-3" />
                Linhas
              </div>
              <div className="flex items-center gap-1">
                <TrendingDown className="w-3 h-3" />
                Menor
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Maior
              </div>
              <div>Quinzena</div>
            </div>
            {/* Body */}
            <div className="max-h-[300px] overflow-y-auto">
              {historico.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-[140px_200px_80px_100px_100px_100px_120px] gap-2 p-2 items-center text-xs border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="text-gray-600 dark:text-gray-300 font-mono text-[10px]">
                    {formatDate(item.data_importacao)}
                  </div>
                  <div className="truncate" title={item.nome_arquivo}>
                    {item.nome_arquivo}
                  </div>
                  <div>
                    <Badge className={`${getTipoColor(item.tipo_importacao)} text-white text-[10px] px-2 py-0`}>
                      {getTipoLabel(item.tipo_importacao)}
                    </Badge>
                  </div>
                  <div className="font-mono font-medium">{item.qtd_linhas}</div>
                  <div className="font-mono text-gray-600 dark:text-gray-400">
                    {item.menor_carga || '-'}
                  </div>
                  <div className="font-mono text-gray-600 dark:text-gray-400">
                    {item.maior_carga || '-'}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400 text-[10px] truncate" title={item.id_quinzenal || ''}>
                    {item.id_quinzenal || '-'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
