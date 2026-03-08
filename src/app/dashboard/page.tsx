'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, TrendingUp, Package, Weight, DollarSign, Percent, Activity, FileText, Printer } from 'lucide-react';
import { toast } from 'sonner';
import { FilterBar, FilterValues } from '@/components/FilterBar';
import { ExportButton } from '@/components/ExportButton';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import Image from 'next/image';

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
  const [fretistas, setFretistas] = useState<string[]>([]);
  const [rotas, setRotas] = useState<string[]>([]);
  const [veiculos, setVeiculos] = useState<string[]>([]);
  const dashboardRef = useRef<HTMLDivElement>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.quinzena) params.append('idQuinzenal', filters.quinzena);
      if (filters.data) params.append('data', filters.data);
      if (filters.fretista) params.append('fretista', filters.fretista);
      if (filters.rota) params.append('rota', filters.rota);
      if (filters.veiculo) params.append('veiculo', filters.veiculo);

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
  }, [filters.quinzena, filters.data, filters.fretista, filters.rota, filters.veiculo]);

  // Buscar dados para filtros
  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        // Buscar quinzenas
        const resQuinzenas = await fetch('/api/quinzenas');
        const resultQuinzenas = await resQuinzenas.json();
        if (resultQuinzenas.quinzenas) {
          setQuinzenas(resultQuinzenas.quinzenas.map((q: { id_quinzenal: string }) => q.id_quinzenal));
        }

        // Buscar fretistas, rotas e veículos
        const resValidacao = await fetch('/api/fretes/validacao');
        const resultValidacao = await resValidacao.json();
        if (resultValidacao.data) {
          const uniqueFretistas = Array.from(new Set(resultValidacao.data.map((d: any) => d.fretista))).sort();
          const uniqueRotas = Array.from(new Set(resultValidacao.data.map((d: any) => d.rota))).sort();
          const uniqueVeiculos = Array.from(new Set(resultValidacao.data.map((d: any) => d.placa).filter(Boolean))).sort();
          
          setFretistas(uniqueFretistas as string[]);
          setRotas(uniqueRotas as string[]);
          setVeiculos(uniqueVeiculos as string[]);
        }
      } catch (error) {
        console.error('Erro ao buscar dados dos filtros:', error);
      }
    };
    fetchFilterData();
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Função para gerar HTML para impressão - Arquitetura Profissional
  const handleGenerateHTML = async () => {
    if (!data) {
      toast.error('Nenhum dado disponível para gerar relatório');
      return;
    }

    // Buscar dados de validação
    let dadosValidacao: any[] = [];
    try {
      const res = await fetch('/api/fretes/validacao');
      const result = await res.json();
      if (result.data) {
        // Filtrar apenas os que têm status de validação
        dadosValidacao = result.data.filter((item: any) => 
          item.statusValidacao === 'Validado e Autorizado' && 
          item.validadoPorUsuario
        );
      }
    } catch (error) {
      console.error('Erro ao buscar dados de validação:', error);
    }

    // 1️⃣ CAPTURAR ESTADO DO DASHBOARD
    const estado = {
      filtros: {
        quinzena: filters.quinzena || 'Todas',
        data: filters.data || 'Todas',
        fretista: filters.fretista || 'Todos',
        rota: filters.rota || 'Todas',
        veiculo: filters.veiculo || 'Todos'
      },
      metricas: data.metricas,
      graficos: {
        fretistas: data.graficoPorFretista,
        rotas: data.graficoPorRota,
        piores: data.top5Piores,
        melhores: data.top5Melhores
      },
      tabela: data.tabelaResumo,
      validacoes: dadosValidacao
    };

    const dataGeracao = new Date().toLocaleString('pt-BR');

    // 2️⃣ MONTAR TEMPLATE DO RELATÓRIO
    const htmlContent = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dashboard ConfereLOG - ${dataGeracao}</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels@2.2.0/dist/chartjs-plugin-datalabels.min.js"></script>
  <style>
    @page { size: A4 portrait; margin: 0; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
      background: white;
      font-size: 7.5pt;
      color: #111827;
      line-height: 1.3;
      max-width: 210mm;
      margin: 0 auto;
      padding: 0;
    }
    .container { 
      max-width: 210mm;
      margin: 0 auto;
      background: white;
      padding: 0 10mm 10mm 10mm;
    }
    @media print {
      body { background: white; max-width: 100%; padding: 0; }
      .no-print { display: none !important; }
      .container { page-break-after: avoid; max-width: 100%; padding: 0 10mm 10mm 10mm; }
      /* Forçar cores na impressão */
      * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        color-adjust: exact !important;
      }
    }
    
    /* Header com fundo verde - Sem cortes */
    .header {
      background: linear-gradient(135deg, #0F5132 0%, #16A34A 100%) !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
      padding: 12px 10mm;
      margin: 0 0 10px 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: white !important;
      box-shadow: 0 2px 4px rgba(0,0,0,0.15);
      width: 100%;
    }
    .header-left { display: flex; align-items: center; gap: 10px; }
    .logo {
      width: 42px;
      height: 42px;
      background: white !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      border-radius: 5px;
      padding: 3px;
    }
    .header-title h1 {
      font-size: 15pt;
      font-weight: 700;
      line-height: 1;
      margin-bottom: 2px;
      color: white !important;
    }
    .header-title p { 
      font-size: 7.5pt; 
      color: rgba(255,255,255,0.95) !important;
    }
    .header-right { 
      text-align: right; 
      font-size: 6.5pt; 
      color: rgba(255,255,255,0.9) !important;
    }
    
    /* Info Box - Cores forçadas */
    .info-box {
      background: #f0fdf4 !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      border-left: 3px solid #0F5132 !important;
      padding: 6px 10px;
      margin-bottom: 8px;
      border-radius: 3px;
    }
    .info-box-title { 
      font-size: 7pt; 
      color: #0F5132 !important; 
      font-weight: 700; 
      margin-bottom: 2px; 
    }
    .info-box-content { 
      font-size: 6pt; 
      color: #374151 !important; 
      line-height: 1.4; 
    }
    
    /* Metrics - Grid ajustado */
    .metrics {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 5px;
      margin-bottom: 8px;
    }
    .metric-card {
      background: white !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      border: 1px solid #e5e7eb !important;
      border-radius: 4px;
      padding: 5px 4px;
      text-align: center;
      box-shadow: 0 1px 2px rgba(0,0,0,0.05);
    }
    .metric-label {
      font-size: 5pt;
      color: #6b7280 !important;
      text-transform: uppercase;
      letter-spacing: 0.2px;
      margin-bottom: 3px;
      font-weight: 600;
    }
    .metric-value {
      font-size: 9pt;
      color: #0F5132 !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      font-weight: 700;
      line-height: 1;
    }
    
    /* Section */
    .section { margin-bottom: 8px; }
    .section-title {
      font-size: 8pt;
      color: #111827 !important;
      font-weight: 700;
      margin-bottom: 5px;
      padding-bottom: 2px;
      border-bottom: 1.5px solid #e5e7eb !important;
    }
    
    /* Charts - Largura ajustada */
    .charts-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 6px;
      margin-bottom: 8px;
    }
    .chart-card {
      background: white !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      border: 1px solid #e5e7eb !important;
      border-radius: 4px;
      padding: 6px;
      box-shadow: 0 1px 2px rgba(0,0,0,0.05);
    }
    .chart-title {
      font-size: 7pt;
      color: #374151 !important;
      font-weight: 600;
      margin-bottom: 5px;
      text-align: center;
    }
    .chart-container {
      position: relative;
      height: 130px;
      width: 100%;
    }
    
    /* Table - Fonte aumentada */
    .table-card {
      background: white !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      border: 1px solid #e5e7eb !important;
      border-radius: 4px;
      padding: 6px;
      box-shadow: 0 1px 2px rgba(0,0,0,0.05);
      overflow-x: auto;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 6.5pt;
    }
    thead {
      background: #f9fafb !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      border-bottom: 1.5px solid #e5e7eb !important;
    }
    th {
      padding: 4px 3px;
      text-align: left;
      font-weight: 600;
      font-size: 6pt;
      color: #6b7280 !important;
      text-transform: uppercase;
      letter-spacing: 0.2px;
    }
    td {
      padding: 4px 3px;
      border-bottom: 1px solid #f3f4f6 !important;
      color: #374151 !important;
    }
    tbody tr:nth-child(even) { 
      background: #fafafa !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    tbody tr:hover { background: #f9fafb !important; }
    .text-right { text-align: right; }
    .font-mono { font-family: 'Courier New', monospace; }
    
    /* Footer */
    .footer {
      margin-top: 6px;
      padding-top: 5px;
      border-top: 1px solid #e5e7eb !important;
      text-align: center;
      font-size: 5pt;
      color: #9ca3af !important;
    }
    
    /* Print Button */
    .print-btn {
      position: fixed;
      top: 16px;
      right: 16px;
      background: #0F5132 !important;
      color: white !important;
      border: none;
      padding: 10px 20px;
      border-radius: 6px;
      font-size: 9pt;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 4px 6px rgba(15,81,50,0.3);
      z-index: 1000;
      transition: all 0.2s;
    }
    .print-btn:hover {
      background: #0D4229 !important;
      transform: translateY(-2px);
      box-shadow: 0 6px 8px rgba(15,81,50,0.4);
    }
  </style>
</head>
<body>
  <button class="print-btn no-print" onclick="window.print()">🖨️ Imprimir / Salvar PDF</button>
  
  <div class="container">
    <div class="header">
      <div class="header-left">
        <img src="/logo.png" alt="ConfereLOG" class="logo">
        <div class="header-title">
          <h1>ConfereLOG</h1>
          <p>Dashboard de Análise de Fretes</p>
        </div>
      </div>
      <div class="header-right">
        <p><strong>Gerado:</strong> ${dataGeracao}</p>
        <p><strong>Grupo Doce Mel</strong></p>
      </div>
    </div>
    
    <div class="info-box">
      <div class="info-box-title">📊 Filtros Aplicados</div>
      <div class="info-box-content">
        Quinzena: ${estado.filtros.quinzena} | 
        Data: ${estado.filtros.data} | 
        Fretista: ${estado.filtros.fretista} | 
        Rota: ${estado.filtros.rota} | 
        Veículo: ${estado.filtros.veiculo}
      </div>
    </div>
    
    <div class="metrics">
      <div class="metric-card">
        <div class="metric-label">Total Valor</div>
        <div class="metric-value">${formatCurrency(data.metricas.totalValor)}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Qtd Fretes</div>
        <div class="metric-value">${data.metricas.qtdFretes}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Peso Bruto</div>
        <div class="metric-value">${formatNumber(data.metricas.pesoBrutoTotal)} kg</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Faturamento</div>
        <div class="metric-value">${formatCurrency(data.metricas.faturamentoBruto)}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">% Despesa</div>
        <div class="metric-value">${formatNumber(data.metricas.percDespesaFrete * 100)}%</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">% Ocupação</div>
        <div class="metric-value">${formatNumber(data.metricas.txOcupacaoMedia * 100)}%</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Custo KG</div>
        <div class="metric-value">${formatCurrency(data.metricas.custoMedioKg)}</div>
      </div>
    </div>
    
    <div class="section">
      <h2 class="section-title">Análise por Fretista e Rota</h2>
      <div class="charts-grid">
        <div class="chart-card">
          <h3 class="chart-title">Valor por Fretista (Top 10)</h3>
          <div class="chart-container">
            <canvas id="chartFretistas"></canvas>
          </div>
        </div>
        <div class="chart-card">
          <h3 class="chart-title">Quantidade por Rota (Top 10)</h3>
          <div class="chart-container">
            <canvas id="chartRotas"></canvas>
          </div>
        </div>
      </div>
    </div>
    
    <div class="section">
      <h2 class="section-title">TOP 5 Fretes por % Despesa</h2>
      <div class="charts-grid">
        <div class="chart-card">
          <h3 class="chart-title">TOP 5 Piores Fretes (% Despesa)</h3>
          <div class="chart-container">
            <canvas id="chartPiores"></canvas>
          </div>
        </div>
        <div class="chart-card">
          <h3 class="chart-title">TOP 5 Melhores Fretes (% Despesa)</h3>
          <div class="chart-container">
            <canvas id="chartMelhores"></canvas>
          </div>
        </div>
      </div>
    </div>
    
    <div class="section">
      <h2 class="section-title">Resumo por Fretista</h2>
      <div class="table-card">
        <table>
          <thead>
            <tr>
              <th>Fretista</th>
              <th class="text-right">Valor Total</th>
              <th class="text-right">Qtd</th>
              <th class="text-right">% Despesa</th>
              <th class="text-right">% Ocupação</th>
              <th class="text-right">Custo KG</th>
              <th class="text-right">Peso Total</th>
              <th class="text-right">Peso Médio</th>
            </tr>
          </thead>
          <tbody>
            ${estado.tabela.map(item => `
              <tr>
                <td>${item.fretista}</td>
                <td class="text-right font-mono">${formatCurrency(item.valorTotal)}</td>
                <td class="text-right">${item.qtdEntregas}</td>
                <td class="text-right font-mono">${formatNumber(item.percDespesaFrete * 100)}%</td>
                <td class="text-right font-mono">${formatNumber(item.percOcupacao * 100)}%</td>
                <td class="text-right font-mono">${formatCurrency(item.custoKg)}</td>
                <td class="text-right font-mono">${formatNumber(item.pesoTotal)} kg</td>
                <td class="text-right font-mono">${formatNumber(item.pesoMedio)} kg</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
    
    ${estado.validacoes && estado.validacoes.length > 0 ? `
    <div class="section">
      <h2 class="section-title">Divergências Autorizadas</h2>
      <div class="table-card">
        <table>
          <thead>
            <tr>
              <th>Carga</th>
              <th>Justificativa</th>
              <th class="text-right">Valor APP</th>
              <th class="text-right">Valor Tabela</th>
              <th>Status</th>
              <th>Usuário</th>
              <th>Tipo</th>
              <th class="text-right">Data Validação</th>
            </tr>
          </thead>
          <tbody>
            ${estado.validacoes.map(item => `
              <tr>
                <td class="font-mono">${item.idCarga}</td>
                <td class="truncate" style="max-width: 200px;" title="${item.justificativa || ''}">${item.justificativa || '-'}</td>
                <td class="text-right font-mono">${formatCurrency(item.valorApp)}</td>
                <td class="text-right font-mono">${formatCurrency(item.valorTabela)}</td>
                <td><span style="background: #dcfce7; color: #166534; padding: 2px 6px; border-radius: 3px; font-size: 5.5pt;">Autorizado</span></td>
                <td>${item.validadoPorUsuario}</td>
                <td>${item.validadoPorTipo}</td>
                <td class="text-right">${item.dataValidacao ? new Date(item.dataValidacao).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
    ` : ''}
    
    <div class="footer">
      <p><strong>ConfereLOG</strong> - Sistema de Validação de Fretes | Grupo Doce Mel © ${new Date().getFullYear()}</p>
      <p>Relatório gerado em ${dataGeracao}</p>
    </div>
  </div>
  
  <script>
    // Garantir que o plugin está disponível
    if (typeof ChartDataLabels === 'undefined') {
      console.error('ChartDataLabels plugin não carregado!');
    }
    
    // 3️⃣ RECRIAR GRÁFICOS COM OS MESMOS DADOS
    const formatCurrency = (value) => {
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };
    
    const formatNumber = (value) => {
      return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 }).format(value);
    };

    // Configuração padrão dos gráficos - Compactos
    const defaultOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          padding: 8,
          titleFont: { size: 10, weight: 'bold' },
          bodyFont: { size: 9 },
          cornerRadius: 3,
          displayColors: false
        },
        datalabels: {
          display: true,
          anchor: 'center',
          align: 'center',
          color: '#000000',
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
          borderRadius: 3,
          padding: 2,
          font: {
            size: function(context) {
              // Tamanho menor para gráficos com muitas colunas
              if (context.chart.canvas.id === 'chartFretistas' || context.chart.canvas.id === 'chartRotas') {
                return 6;
              }
              return 9;
            },
            weight: 'bold'
          },
          formatter: function(value, context) {
            if (context.chart.canvas.id === 'chartFretistas') {
              return formatCurrency(value);
            } else if (context.chart.canvas.id === 'chartRotas') {
              return value;
            } else if (context.chart.canvas.id === 'chartPiores' || context.chart.canvas.id === 'chartMelhores') {
              return formatNumber(value) + '%';
            }
            return value;
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { 
            font: { size: 7 }, 
            color: '#6b7280',
            maxRotation: 0,
            minRotation: 0,
            autoSkip: false,
            callback: function(value, index) {
              const label = this.getLabelForValue(value);
              // Quebrar em no máximo 3 palavras
              const words = label.split(' ').slice(0, 3);
              return words;
            }
          }
        },
        y: {
          grid: { color: '#f3f4f6', lineWidth: 0.5 },
          ticks: { 
            font: { size: 7 }, 
            color: '#6b7280',
            padding: 4
          }
        }
      },
      layout: {
        padding: { top: 5, bottom: 5, left: 5, right: 5 }
      }
    };

    // Gráfico 1: Valor por Fretista
    new Chart(document.getElementById('chartFretistas'), {
      type: 'bar',
      data: {
        labels: ${JSON.stringify(estado.graficos.fretistas.map(f => f.fretista))},
        datasets: [{
          data: ${JSON.stringify(estado.graficos.fretistas.map(f => f.valor))},
          backgroundColor: '#ff794b',
          borderRadius: 3,
          barThickness: 18,
          datalabels: {
            color: '#000000',
            font: { size: 6, weight: 'bold' },
            formatter: (value) => formatCurrency(value)
          }
        }]
      },
      options: {
        ...defaultOptions,
        plugins: {
          ...defaultOptions.plugins,
          tooltip: {
            ...defaultOptions.plugins.tooltip,
            callbacks: {
              label: (context) => 'Valor: ' + formatCurrency(context.parsed.y)
            }
          }
        },
        scales: {
          ...defaultOptions.scales,
          y: {
            ...defaultOptions.scales.y,
            ticks: {
              ...defaultOptions.scales.y.ticks,
              callback: (value) => formatCurrency(value)
            }
          }
        }
      },
      plugins: [ChartDataLabels]
    });

    // Gráfico 2: Quantidade por Rota
    new Chart(document.getElementById('chartRotas'), {
      type: 'bar',
      data: {
        labels: ${JSON.stringify(estado.graficos.rotas.map(r => r.rota))},
        datasets: [{
          data: ${JSON.stringify(estado.graficos.rotas.map(r => r.count))},
          backgroundColor: '#ff794b',
          borderRadius: 3,
          barThickness: 18,
          datalabels: {
            color: '#000000',
            font: { size: 6, weight: 'bold' },
            formatter: (value) => value
          }
        }]
      },
      options: {
        ...defaultOptions,
        plugins: {
          ...defaultOptions.plugins,
          tooltip: {
            ...defaultOptions.plugins.tooltip,
            callbacks: {
              label: (context) => 'Quantidade: ' + context.parsed.y
            }
          }
        }
      },
      plugins: [ChartDataLabels]
    });

    // Gráfico 3: TOP 5 Piores
    new Chart(document.getElementById('chartPiores'), {
      type: 'bar',
      data: {
        labels: ${JSON.stringify(estado.graficos.piores.map(p => p.idCarga))},
        datasets: [{
          data: ${JSON.stringify(estado.graficos.piores.map(p => p.percDespesa * 100))},
          backgroundColor: '#ff794b',
          borderRadius: 3,
          barThickness: 22,
          datalabels: {
            color: '#000000',
            font: { size: 9, weight: 'bold' },
            formatter: (value) => formatNumber(value) + '%'
          }
        }]
      },
      options: {
        ...defaultOptions,
        plugins: {
          ...defaultOptions.plugins,
          tooltip: {
            ...defaultOptions.plugins.tooltip,
            callbacks: {
              title: (items) => {
                const idx = items[0].dataIndex;
                const item = ${JSON.stringify(estado.graficos.piores)}[idx];
                return 'Carga: ' + item.idCarga;
              },
              label: (context) => {
                const idx = context.dataIndex;
                const item = ${JSON.stringify(estado.graficos.piores)}[idx];
                return [
                  'Fretista: ' + item.fretista,
                  'Rota: ' + item.rota,
                  '% Despesa: ' + formatNumber(context.parsed.y) + '%'
                ];
              }
            }
          }
        },
        scales: {
          ...defaultOptions.scales,
          y: {
            ...defaultOptions.scales.y,
            ticks: {
              ...defaultOptions.scales.y.ticks,
              callback: (value) => formatNumber(value) + '%'
            }
          }
        }
      },
      plugins: [ChartDataLabels]
    });

    // Gráfico 4: TOP 5 Melhores
    new Chart(document.getElementById('chartMelhores'), {
      type: 'bar',
      data: {
        labels: ${JSON.stringify(estado.graficos.melhores.map(m => m.idCarga))},
        datasets: [{
          data: ${JSON.stringify(estado.graficos.melhores.map(m => m.percDespesa * 100))},
          backgroundColor: '#ff794b',
          borderRadius: 3,
          barThickness: 22,
          datalabels: {
            color: '#000000',
            font: { size: 9, weight: 'bold' },
            formatter: (value) => formatNumber(value) + '%'
          }
        }]
      },
      options: {
        ...defaultOptions,
        plugins: {
          ...defaultOptions.plugins,
          tooltip: {
            ...defaultOptions.plugins.tooltip,
            callbacks: {
              title: (items) => {
                const idx = items[0].dataIndex;
                const item = ${JSON.stringify(estado.graficos.melhores)}[idx];
                return 'Carga: ' + item.idCarga;
              },
              label: (context) => {
                const idx = context.dataIndex;
                const item = ${JSON.stringify(estado.graficos.melhores)}[idx];
                return [
                  'Fretista: ' + item.fretista,
                  'Rota: ' + item.rota,
                  '% Despesa: ' + formatNumber(context.parsed.y) + '%'
                ];
              }
            }
          }
        },
        scales: {
          ...defaultOptions.scales,
          y: {
            ...defaultOptions.scales.y,
            ticks: {
              ...defaultOptions.scales.y.ticks,
              callback: (value) => formatNumber(value) + '%'
            }
          }
        }
      },
      plugins: [ChartDataLabels]
    });
  </script>
</body>
</html>`;

    // 3️⃣ ABRIR RELATÓRIO
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(htmlContent);
      newWindow.document.close();
      toast.success('Relatório gerado! Use Ctrl+P ou clique no botão para imprimir/salvar PDF');
    } else {
      toast.error('Bloqueador de pop-ups ativo. Permita pop-ups para gerar o relatório.');
    }
  };

  // Função para quebrar texto em até 3 palavras
  const formatXAxisLabel = (value: string) => {
    const words = value.split(' ').slice(0, 3);
    return words;
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const formatNumber = (value: number) => {
    return value.toLocaleString('pt-BR', { maximumFractionDigits: 2 });
  };

  // Função auxiliar para calcular cor de contraste
  const getContrastColor = (hexColor: string | undefined) => {
    // Validar se hexColor existe e é uma string válida
    if (!hexColor || typeof hexColor !== 'string' || hexColor.length < 7) {
      return '#FFFFFF'; // Retorna branco como padrão
    }

    try {
      // Converter hex para RGB
      const r = parseInt(hexColor.slice(1, 3), 16);
      const g = parseInt(hexColor.slice(3, 5), 16);
      const b = parseInt(hexColor.slice(5, 7), 16);
      
      // Validar se os valores são números válidos
      if (isNaN(r) || isNaN(g) || isNaN(b)) {
        return '#FFFFFF';
      }
      
      // Calcular luminância
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      
      return luminance > 0.5 ? '#000000' : '#FFFFFF';
    } catch (error) {
      return '#FFFFFF'; // Retorna branco em caso de erro
    }
  };

  // Componente customizado para label nas barras
  const renderCustomLabel = (props: any) => {
    const { x, y, width, height, value, fill } = props;
    
    // Validar props
    if (!value || !width || !height) return null;
    
    const textColor = getContrastColor(fill);
    
    return (
      <text
        x={x + width / 2}
        y={y + height / 2}
        fill={textColor}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="11"
        fontWeight="600"
      >
        {typeof value === 'number' && value > 1000 
          ? formatCurrency(value).replace('R$', 'R$ ')
          : typeof value === 'number' && value > 100
          ? `${formatNumber(value)}%`
          : value
        }
      </text>
    );
  };

  const renderCurrencyLabel = (props: any) => {
    const { x, y, width, height, value, fill } = props;
    
    // Validar props
    if (!value || !width || !height) return null;
    
    const textColor = getContrastColor(fill);
    
    return (
      <text
        x={x + width / 2}
        y={y + height / 2}
        fill={textColor}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="10"
        fontWeight="600"
      >
        {formatCurrency(value)}
      </text>
    );
  };

  const renderCountLabel = (props: any) => {
    const { x, y, width, height, value, fill } = props;
    
    // Validar props
    if (!value || !width || !height) return null;
    
    const textColor = getContrastColor(fill);
    
    return (
      <text
        x={x + width / 2}
        y={y + height / 2}
        fill={textColor}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="12"
        fontWeight="700"
      >
        {value}
      </text>
    );
  };

  const renderPercentLabel = (props: any) => {
    const { x, y, width, height, value, fill } = props;
    
    // Validar props
    if (!value || !width || !height) return null;
    
    const textColor = getContrastColor(fill);
    
    // Multiplicar por 100 para converter decimal em percentual
    const percentValue = value * 100;
    
    return (
      <text
        x={x + width / 2}
        y={y + height / 2}
        fill={textColor}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="11"
        fontWeight="600"
      >
        {formatNumber(percentValue)}%
      </text>
    );
  };

  // Tooltip customizado para TOP 5
  const CustomTooltipTop5 = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-[#141414] border border-gray-300 dark:border-[#1F1F1F] p-3 rounded shadow-lg">
          <p className="font-semibold text-gray-900 dark:text-white mb-1">
            Carga: {data.idCarga}
          </p>
          <p className="text-sm text-gray-700 dark:text-[#9CA3AF]">
            Fretista: {data.fretista}
          </p>
          <p className="text-sm text-gray-700 dark:text-[#9CA3AF]">
            Rota: {data.rota}
          </p>
          <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
            % Despesa: {formatNumber(data.percDespesa * 100)}%
          </p>
        </div>
      );
    }
    return null;
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
      <div className="flex items-center justify-between flex-wrap gap-3">
        <FilterBar
          onFilterChange={setFilters}
          quinzenas={quinzenas}
          fretistas={fretistas}
          rotas={rotas}
          veiculos={veiculos}
        />
        <Button
          onClick={handleGenerateHTML}
          className="bg-[#0F5132] hover:bg-[#0F5132]/90 h-9"
          disabled={loading || !data}
        >
          <FileText className="w-4 h-4 mr-2" />
          Gerar HTML
        </Button>
      </div>

      {/* Cards de Métricas */}
      <div className="grid gap-3 md:grid-cols-4 lg:grid-cols-7">
        <Card className="dark:bg-[#141414] dark:border-[#1F1F1F] dark:shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-gray-600 dark:text-[#9CA3AF] flex items-center gap-2">
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

        <Card className="dark:bg-[#141414] dark:border-[#1F1F1F] dark:shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-gray-600 dark:text-[#9CA3AF] flex items-center gap-2">
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

        <Card className="dark:bg-[#141414] dark:border-[#1F1F1F] dark:shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-gray-600 dark:text-[#9CA3AF] flex items-center gap-2">
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

        <Card className="dark:bg-[#141414] dark:border-[#1F1F1F] dark:shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-gray-600 dark:text-[#9CA3AF] flex items-center gap-2">
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

        <Card className="dark:bg-[#141414] dark:border-[#1F1F1F] dark:shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-gray-600 dark:text-[#9CA3AF] flex items-center gap-2">
              <Percent className="w-4 h-4" />
              % Despesa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-gray-900 dark:text-white">
              {formatNumber(data.metricas.percDespesaFrete * 100)}%
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-[#141414] dark:border-[#1F1F1F] dark:shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-gray-600 dark:text-[#9CA3AF] flex items-center gap-2">
              <Activity className="w-4 h-4" />
              % Ocupação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-gray-900 dark:text-white">
              {formatNumber(data.metricas.txOcupacaoMedia * 100)}%
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-[#141414] dark:border-[#1F1F1F] dark:shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-gray-600 dark:text-[#9CA3AF] flex items-center gap-2">
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
        <Card className="dark:bg-[#141414] dark:border-[#1F1F1F] dark:shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Valor por Fretista (Top 10)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.graficoPorFretista}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis 
                  dataKey="fretista" 
                  angle={0} 
                  textAnchor="middle" 
                  height={60}
                  interval={0}
                  tick={(props) => {
                    const { x, y, payload } = props;
                    const words = formatXAxisLabel(payload.value);
                    return (
                      <g transform={`translate(${x},${y})`}>
                        {words.map((word: string, index: number) => (
                          <text
                            key={index}
                            x={0}
                            y={index * 12}
                            dy={8}
                            textAnchor="middle"
                            fill="#6b7280"
                            fontSize="10"
                          >
                            {word}
                          </text>
                        ))}
                      </g>
                    );
                  }}
                />
                <YAxis className="text-xs fill-gray-600 dark:fill-gray-400" />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
                />
                <Bar dataKey="valor" fill="#0F5132" name="Valor Total">
                  <LabelList dataKey="valor" content={renderCurrencyLabel} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico 2: Quantidade por Rota */}
        <Card className="dark:bg-[#141414] dark:border-[#1F1F1F] dark:shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Quantidade por Rota (Top 10)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.graficoPorRota}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis 
                  dataKey="rota" 
                  angle={0} 
                  textAnchor="middle" 
                  height={60}
                  interval={0}
                  tick={(props) => {
                    const { x, y, payload } = props;
                    const words = formatXAxisLabel(payload.value);
                    return (
                      <g transform={`translate(${x},${y})`}>
                        {words.map((word: string, index: number) => (
                          <text
                            key={index}
                            x={0}
                            y={index * 12}
                            dy={8}
                            textAnchor="middle"
                            fill="#6b7280"
                            fontSize="10"
                          >
                            {word}
                          </text>
                        ))}
                      </g>
                    );
                  }}
                />
                <YAxis className="text-xs fill-gray-600 dark:fill-gray-400" />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }} />
                <Bar dataKey="count" fill="#D4AF37" name="Quantidade">
                  <LabelList dataKey="count" content={renderCountLabel} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico 3: TOP 5 Piores Fretes */}
        <Card className="dark:bg-[#141414] dark:border-[#1F1F1F] dark:shadow-sm">
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
                <Tooltip content={<CustomTooltipTop5 />} />
                <Bar dataKey="percDespesa" fill="#DC2626" name="% Despesa">
                  <LabelList dataKey="percDespesa" content={renderPercentLabel} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico 4: TOP 5 Melhores Fretes */}
        <Card className="dark:bg-[#141414] dark:border-[#1F1F1F] dark:shadow-sm">
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
                <Tooltip content={<CustomTooltipTop5 />} />
                <Bar dataKey="percDespesa" fill="#16A34A" name="% Despesa">
                  <LabelList dataKey="percDespesa" content={renderPercentLabel} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tabela Resumida */}
      <Card className="dark:bg-[#141414] dark:border-[#1F1F1F] dark:shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">Resumo por Fretista</CardTitle>
            <ExportButton
              data={data.tabelaResumo.map(item => ({
                Fretista: item.fretista,
                'Valor Total': item.valorTotal,
                'Qtd Entregas': item.qtdEntregas,
                '% Despesa Frete': (item.percDespesaFrete * 100).toFixed(2) + '%',
                '% Ocupação': (item.percOcupacao * 100).toFixed(2) + '%',
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
                    <td className="p-2 text-right font-mono text-gray-900 dark:text-white">{formatNumber(item.percDespesaFrete * 100)}%</td>
                    <td className="p-2 text-right font-mono text-gray-900 dark:text-white">{formatNumber(item.percOcupacao * 100)}%</td>
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
