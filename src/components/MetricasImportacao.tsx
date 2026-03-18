'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Metricas {
  qtdCargas: number;
  valorCargas: number;
  qtdDivergencias: number;
  valorDivergencias: number;
  qtdJustificadas: number;
  valorJustificadas: number;
  qtdAutorizadas: number;
  valorAutorizadas: number;
  qtdSemDadosBI: number;
  valorSemDadosBI: number;
  qtdDivergeTabela: number;
  valorDivergeTabela: number;
  qtdSemValorTabela: number;
  valorSemValorTabela: number;
  vlrTotalApp: number;
  vlrTotalBI: number;
  vlrTotalDivergencia: number;
}

export function MetricasImportacao() {
  const [metricas, setMetricas] = useState<Metricas | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetricas();
  }, []);

  const fetchMetricas = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/fretes/metricas');
      const data = await res.json();
      setMetricas(data.metricas);
    } catch (error) {
      toast.error('Erro ao carregar métricas');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-[#0F5132]" />
      </div>
    );
  }

  if (!metricas) return null;

  const cards = [
    { label: 'Qtd. de Cargas', value: metricas.qtdCargas, subValue: formatCurrency(metricas.valorCargas), color: 'text-gray-900' },
    { label: 'Cargas com Divergências', value: metricas.qtdDivergencias, subValue: formatCurrency(metricas.valorDivergencias), color: 'text-red-600' },
    { label: 'Cargas Justificadas', value: metricas.qtdJustificadas, subValue: formatCurrency(metricas.valorJustificadas), color: 'text-blue-600' },
    { label: 'Cargas Autorizadas', value: metricas.qtdAutorizadas, subValue: formatCurrency(metricas.valorAutorizadas), color: 'text-green-600' },
    { label: 'Sem Dados BI', value: metricas.qtdSemDadosBI, subValue: formatCurrency(metricas.valorSemDadosBI), color: 'text-orange-600' },
    { label: 'Diverge Tabela', value: metricas.qtdDivergeTabela, subValue: formatCurrency(metricas.valorDivergeTabela), color: 'text-red-600' },
    { label: 'Sem Valor Tabela', value: metricas.qtdSemValorTabela, subValue: formatCurrency(metricas.valorSemValorTabela), color: 'text-yellow-600' },
    { label: 'Vlr Total APP', value: formatCurrency(metricas.vlrTotalApp), subValue: null, color: 'text-[#0F5132]' },
    { label: 'Vlr Total BI', value: formatCurrency(metricas.vlrTotalBI), subValue: null, color: 'text-[#0F5132]' },
    { label: 'Vlr Total Divergência', value: formatCurrency(metricas.vlrTotalDivergencia), subValue: null, color: 'text-red-600' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {cards.map((card, index) => (
        <Card key={index}>
          <CardContent className="p-4">
            <div className="text-xs text-gray-500 mb-1">{card.label}</div>
            <div className={`text-xl font-bold ${card.color}`}>
              {typeof card.value === 'number' ? card.value : card.value}
            </div>
            {card.subValue && (
              <div className="text-xs text-gray-600 mt-1">{card.subValue}</div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
