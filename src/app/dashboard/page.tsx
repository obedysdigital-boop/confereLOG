'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, TrendingUp, Package, Weight, DollarSign, Percent, Activity } from 'lucide-react';
import { toast } from 'sonner';
import { FilterBar, FilterValues } from '@/components/FilterBar';
import { ExportButton } from '@/components/ExportButton';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardMetrics {
  totalValor: number;
  qtdFretes: number;
  pesoBrutoTotal: number;
  faturamentoBruto: number;
  percDespesaFrete: number;
  txOcupacaoMedia: number;
  custoMedioKg: number;
}

interface GraficoFretista {
  fretista: string;
  valor: number;
}

interface GraficoRota {
  rota: string;
  count: number;
}

interface TopFrete {
  idCarga: string;
  fretista: string;
  rota: string;
  percDespesa: number;
}

interface TabelaResumo {
  fretista: string;
  valorTotal: number;
  qtdEntregas: number;
  percDespesaFrete: number;
  percOcupacao: number;
  custoKg: number;
  pesoTotal: number;
  pesoMedio: number;
}

interface DashboardData {
  metricas: DashboardMetrics;
  graficoPorFretista: GraficoFretista[];
  graficoPorRota: GraficoRota[];
  top5Piores: TopFrete[];
  top5Melhores: TopFrete[];
  tabelaResumo: TabelaResumo[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterValues>({
    quinzena: '',
    data: '',
    fretista: '',
    rota: '',
    veiculo: '',
  });
  const [quinzenas, setQuinzenas] = useState<string[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.quinzena) {
        params.append('idQuinzenal', filters.quinzena);
      }

      const res = await fetch(`/api/dashboard?${params.toString()}`);
      const result = await res.json();
      
      if (result.error) {
        toast.error('Erro ao carregar dashboard');
      } else {
        setData(result);
      }
    } catch (error) {
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  }, [filters.quinzena]);

  // Buscar quinzenas disponíveis
  useEffect(() => {
    const fetchQuinzenas = async () => {
      try {
        const res = await fetch('/api/quinzenas');
        const result = await res.json();
        if (result.quinzenas) {
          setQuinzenas(result.quinzenas.map((q: { id_quinzenal: string }) => q.id_quinzenal));
        }
      } catch (error) {
        console.error('Erro ao buscar quinzenas:', error);
      }
    };
    fetchQuinzenas();
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const formatNumber = (value: number) => {
    return value.toLocaleString('pt-BR', { maximumFractionDigits: 2 });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#0F5132]" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12 text-gray-500">
        Nenhum dado disponível
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex items-center justify-between">
        <FilterBar
          onFilterChange={setFilters}
          quinzenas={quinzenas}
          fretistas={[]}
          rotas={[]}
          veiculos={[]}
        />
      </div>

      {/* Cards de Métricas */}
      <div className="grid gap-3 md:grid-cols-4 lg:grid-cols-7">
        <Card className="dark:bg-gray-900 dark:border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Total Valor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(data.metricas.totalValor)}
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-900 dark:border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <Package className="w-4 h-4" />
              Qtd Fretes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-gray-900 dark:text-white">
              {data.metricas.qtdFretes}
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-900 dark:border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <Weight className="w-4 h-4" />
              Peso Bruto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-gray-900 dark:text-white">
              {formatNumber(data.metricas.pesoBrutoTotal)} kg
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-900 dark:border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Faturamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(data.metricas.faturamentoBruto)}
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-900 dark:border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <Percent className="w-4 h-4" />
              % Despesa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-gray-900 dark:text-white">
              {formatNumber(data.metricas.percDespesaFrete)}%
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-900 dark:border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <Activity className="w-4 h-4" />
              % Ocupação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-gray-900 dark:text-white">
              {formatNumber(data.metricas.txOcupacaoMedia)}%
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-900 dark:border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Custo KG
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(data.metricas.custoMedioKg)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Gráfico 1: Valor por Fretista */}
        <Card className="dark:bg-gray-900 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Valor por Fretista (Top 10)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.graficoPorFretista}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis 
                  dataKey="fretista" 
                  angle={-45} 
                  textAnchor="end" 
                  height={100}
                  className="text-xs fill-gray-600 dark:fill-gray-400"
                />
                <YAxis className="text-xs fill-gray-600 dark:fill-gray-400" />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
                />
                <Bar dataKey="valor" fill="#0F5132" name="Valor Total" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico 2: Quantidade por Rota */}
        <Card className="dark:bg-gray-900 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Quantidade por Rota (Top 10)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.graficoPorRota}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis 
                  dataKey="rota" 
                  angle={-45} 
                  textAnchor="end" 
                  height={100}
                  className="text-xs fill-gray-600 dark:fill-gray-400"
                />
                <YAxis className="text-xs fill-gray-600 dark:fill-gray-400" />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }} />
                <Bar dataKey="count" fill="#D4AF37" name="Quantidade" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico 3: TOP 5 Piores Fretes */}
        <Card className="dark:bg-gray-900 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">TOP 5 Piores Fretes (% Despesa)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.top5Piores}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis 
                  dataKey="idCarga" 
                  className="text-xs fill-gray-600 dark:fill-gray-400"
                />
                <YAxis className="text-xs fill-gray-600 dark:fill-gray-400" />
                <Tooltip 
                  formatter={(value: number) => `${formatNumber(value)}%`}
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
                />
                <Bar dataKey="percDespesa" fill="#DC2626" name="% Despesa" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico 4: TOP 5 Melhores Fretes */}
        <Card className="dark:bg-gray-900 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">TOP 5 Melhores Fretes (% Despesa)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.top5Melhores}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis 
                  dataKey="idCarga" 
                  className="text-xs fill-gray-600 dark:fill-gray-400"
                />
                <YAxis className="text-xs fill-gray-600 dark:fill-gray-400" />
                <Tooltip 
                  formatter={(value: number) => `${formatNumber(value)}%`}
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
                />
                <Bar dataKey="percDespesa" fill="#16A34A" name="% Despesa" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tabela Resumida */}
      <Card className="dark:bg-gray-900 dark:border-gray-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">Resumo por Fretista</CardTitle>
            <ExportButton
              data={data.tabelaResumo.map(item => ({
                Fretista: item.fretista,
                'Valor Total': item.valorTotal,
                'Qtd Entregas': item.qtdEntregas,
                '% Despesa Frete': item.percDespesaFrete,
                '% Ocupação': item.percOcupacao,
                'Custo KG': item.custoKg,
                'Peso Total': item.pesoTotal,
                'Peso Médio': item.pesoMedio,
              }))}
              filename="dashboard-resumo-fretistas"
              label="Exportar"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b dark:border-gray-700">
                  <th className="text-left p-2 font-medium text-gray-600 dark:text-gray-400">Fretista</th>
                  <th className="text-right p-2 font-medium text-gray-600 dark:text-gray-400">Valor Total</th>
                  <th className="text-right p-2 font-medium text-gray-600 dark:text-gray-400">Qtd</th>
                  <th className="text-right p-2 font-medium text-gray-600 dark:text-gray-400">% Despesa</th>
                  <th className="text-right p-2 font-medium text-gray-600 dark:text-gray-400">% Ocupação</th>
                  <th className="text-right p-2 font-medium text-gray-600 dark:text-gray-400">Custo KG</th>
                  <th className="text-right p-2 font-medium text-gray-600 dark:text-gray-400">Peso Total</th>
                  <th className="text-right p-2 font-medium text-gray-600 dark:text-gray-400">Peso Médio</th>
                </tr>
              </thead>
              <tbody>
                {data.tabelaResumo.map((item, index) => (
                  <tr key={index} className="border-b dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="p-2 text-gray-900 dark:text-white">{item.fretista}</td>
                    <td className="p-2 text-right font-mono text-gray-900 dark:text-white">{formatCurrency(item.valorTotal)}</td>
                    <td className="p-2 text-right text-gray-900 dark:text-white">{item.qtdEntregas}</td>
                    <td className="p-2 text-right font-mono text-gray-900 dark:text-white">{formatNumber(item.percDespesaFrete)}%</td>
                    <td className="p-2 text-right font-mono text-gray-900 dark:text-white">{formatNumber(item.percOcupacao)}%</td>
                    <td className="p-2 text-right font-mono text-gray-900 dark:text-white">{formatCurrency(item.custoKg)}</td>
                    <td className="p-2 text-right font-mono text-gray-900 dark:text-white">{formatNumber(item.pesoTotal)} kg</td>
                    <td className="p-2 text-right font-mono text-gray-900 dark:text-white">{formatNumber(item.pesoMedio)} kg</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
