'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { MainLayout } from '@/components/MainLayout';
import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Upload, CheckCircle, AlertTriangle, FileSpreadsheet, MessageCircle, Loader2 as Loader2Icon, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { QuinzenaModal } from '@/components/QuinzenaModal';
import { JustificativaDialog } from '@/components/JustificativaDialog';
import { FilterBar, FilterValues } from '@/components/FilterBar';
import { MetricasImportacao } from '@/components/MetricasImportacao';
import { ExportButton } from '@/components/ExportButton';
import { StatusButton } from '@/components/StatusButton';
import DashboardPage from './dashboard/page';

// Types
interface ValidationResult {
  id: string;
  data: string;
  idCarga: string;
  fretista: string;
  rota: string;
  valorBI: number | null;
  valorApp: number | null;
  valorTabela: number | null;
  divergBiApp: number | null;
  divergBiTabela: number | null;
  status: string;
  statusFrete: string | null;
  placa: string | null;
  tipoVeiculo: string | null;
  justificativa?: string | null;
  idQuinzenal?: string | null;
  statusValidacao: string;
  validadoPorUsuario: string | null;
  validadoPorTipo: string | null;
  dataValidacao: string | null;
  justificadoPorUsuario?: string | null;
  dataJustificativa?: string | null;
}

// Upload Component
function UploadPage() {
  const [uploading, setUploading] = useState<string | null>(null);
  const [status, setStatus] = useState({
    bi: { done: false, count: 0 },
    app: { done: false, count: 0 },
    tabela: { done: false, count: 0 },
  });
  const [quinzenaModalOpen, setQuinzenaModalOpen] = useState(false);
  const [pendingUpload, setPendingUpload] = useState<{
    type: 'bi' | 'app' | 'tabela';
    file: File;
  } | null>(null);

  const handleFileSelect = (type: 'bi' | 'app' | 'tabela', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Para tabela, não precisa de quinzena
    if (type === 'tabela') {
      handleUploadWithoutQuinzena(type, file);
    } else {
      // Para BI e APP, abrir modal de quinzena
      setPendingUpload({ type, file });
      setQuinzenaModalOpen(true);
    }

    // Limpar input
    e.target.value = '';
  };

  const handleUploadWithoutQuinzena = async (type: 'tabela', file: File) => {
    setUploading(type);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      formData.append('idQuinzenal', 'N/A'); // Tabela não usa quinzena

      const res = await fetch('/api/import-files', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        toast.success(`${data.inserted} registros importados!`);
        setStatus((prev) => ({
          ...prev,
          [type]: { done: true, count: data.inserted },
        }));
      } else {
        toast.error(data.error || 'Erro ao importar arquivo');
      }
    } catch (error) {
      toast.error('Erro ao processar arquivo');
    } finally {
      setUploading(null);
    }
  };

  const handleQuinzenaConfirm = async (idQuinzenal: string) => {
    if (!pendingUpload) return;

    const { type, file } = pendingUpload;
    setQuinzenaModalOpen(false);
    setUploading(type);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      formData.append('idQuinzenal', idQuinzenal);

      const res = await fetch('/api/import-files', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        toast.success(`${data.inserted} registros importados para ${idQuinzenal}!`);
        setStatus((prev) => ({
          ...prev,
          [type]: { done: true, count: data.inserted },
        }));
      } else {
        toast.error(data.error || 'Erro ao importar arquivo');
      }
    } catch (error) {
      toast.error('Erro ao processar arquivo');
    } finally {
      setUploading(null);
      setPendingUpload(null);
    }
  };

  const handleQuinzenaCancel = () => {
    setQuinzenaModalOpen(false);
    setPendingUpload(null);
  };

  const uploadButtons = [
    {
      type: 'bi' as const,
      label: 'Importar dados BI',
      description: 'Planilha "Fretes de Saídas" do BI',
      icon: FileSpreadsheet,
      color: 'bg-blue-600 hover:bg-blue-700',
    },
    {
      type: 'app' as const,
      label: 'Importar dados App Fretes',
      description: 'Planilha ou CSV do app de fretes',
      icon: Upload,
      color: 'bg-[#0F5132] hover:bg-[#0F5132]/90',
    },
    {
      type: 'tabela' as const,
      label: 'Importar Tabela de Fretes',
      description: 'Tabela de valores por rota e veículo',
      icon: FileSpreadsheet,
      color: 'bg-[#D4AF37] hover:bg-[#D4AF37]/90',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        {uploadButtons.map((btn) => {
          const Icon = btn.icon;
          const isLoading = uploading === btn.type;
          const isDone = status[btn.type].done;

          return (
            <Card
              key={btn.type}
              className={`relative transition-all hover:shadow-md dark:bg-[#434343] dark:border-[#606060] ${
                isDone ? 'border-green-500' : ''
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold">{btn.label}</CardTitle>
                  {isDone && <CheckCircle className="w-5 h-5 text-green-500" />}
                </div>
                <CardDescription className="text-xs">{btn.description}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={(e) => handleFileSelect(btn.type, e)}
                  className="hidden"
                  id={`upload-${btn.type}`}
                  disabled={isLoading}
                />
                <Button
                  className={`w-full h-9 ${btn.color} text-white text-sm`}
                  disabled={isLoading}
                  onClick={() => document.getElementById(`upload-${btn.type}`)?.click()}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <Icon className="w-4 h-4 mr-2" />
                      Selecionar
                    </>
                  )}
                </Button>
                {isDone && (
                  <p className="text-xs text-center text-green-600 mt-2">
                    {status[btn.type].count} registros
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Modal de Quinzena */}
      <QuinzenaModal
        open={quinzenaModalOpen}
        onClose={handleQuinzenaCancel}
        onConfirm={handleQuinzenaConfirm}
        title="Período de Referência"
        description={`Selecione a quinzena para os dados ${
          pendingUpload?.type === 'bi' ? 'do BI' : 'do App de Fretes'
        }`}
      />

      {/* Métricas de Importação */}
      <MetricasImportacao />
    </div>
  );
}

// Validation Table Component
function ValidationTable({ onlyDivergences = false, onlyJustificados = false }: { onlyDivergences?: boolean; onlyJustificados?: boolean }) {
  const [data, setData] = useState<ValidationResult[]>([]);
  const [filteredData, setFilteredData] = useState<ValidationResult[]>([]);
  const [paginatedData, setPaginatedData] = useState<ValidationResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [justificativaDialogOpen, setJustificativaDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ValidationResult | null>(null);
  const [filters, setFilters] = useState<FilterValues>({
    quinzena: '',
    data: '',
    fretista: '',
    rota: '',
    veiculo: '',
    status: '',
    validacao: '',
  });

  const ITEMS_PER_PAGE = 500;
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      let url = '/api/fretes/validacao';
      
      if (onlyDivergences) {
        url += '?divergentes=true';
      } else if (onlyJustificados) {
        url += '?justificados=true';
      }
      
      const res = await fetch(url);
      const result = await res.json();
      setData(result.data || []);
    } catch (error) {
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  }, [onlyDivergences, onlyJustificados]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Aplicar filtros
  useEffect(() => {
    let filtered = [...data];

    // Filtro de busca textual - expandido para incluir status, validação, valores e justificativa
    if (search) {
      filtered = filtered.filter(
        (item) =>
          item.fretista.toLowerCase().includes(search.toLowerCase()) ||
          item.rota.toLowerCase().includes(search.toLowerCase()) ||
          item.idCarga.includes(search) ||
          item.status.toLowerCase().includes(search.toLowerCase()) ||
          item.statusValidacao.toLowerCase().includes(search.toLowerCase()) ||
          (item.justificativa && item.justificativa.toLowerCase().includes(search.toLowerCase())) ||
          (item.valorBI && item.valorBI.toString().includes(search)) ||
          (item.valorApp && item.valorApp.toString().includes(search)) ||
          (item.valorTabela && item.valorTabela.toString().includes(search))
      );
    }

    // Filtro de quinzena
    if (filters.quinzena && filters.quinzena !== 'TODAS') {
      filtered = filtered.filter((item) => item.idQuinzenal === filters.quinzena);
    }

    // Filtro de data
    if (filters.data) {
      filtered = filtered.filter((item) => item.data === filters.data);
    }

    // Filtro de fretista
    if (filters.fretista) {
      filtered = filtered.filter((item) => item.fretista === filters.fretista);
    }

    // Filtro de rota
    if (filters.rota) {
      filtered = filtered.filter((item) => item.rota === filters.rota);
    }

    // Filtro de veículo
    if (filters.veiculo) {
      filtered = filtered.filter((item) => item.placa === filters.veiculo);
    }

    // Filtro de status
    if (filters.status) {
      filtered = filtered.filter((item) => item.status === filters.status);
    }

    // Filtro de validação
    if (filters.validacao) {
      filtered = filtered.filter((item) => item.statusValidacao === filters.validacao);
    }

    setFilteredData(filtered);
    setCurrentPage(1); // Reset para primeira página quando filtros mudarem
  }, [data, search, filters]);

  // Aplicar paginação
  useEffect(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    setPaginatedData(filteredData.slice(startIndex, endIndex));
  }, [filteredData, currentPage]);

  // Extrair valores únicos para os filtros
  const quinzenas = Array.from(new Set(data.map((d) => d.idQuinzenal).filter(Boolean))) as string[];
  const fretistas = Array.from(new Set(data.map((d) => d.fretista))).sort();
  const rotas = Array.from(new Set(data.map((d) => d.rota))).sort();
  const veiculos = Array.from(new Set(data.map((d) => d.placa).filter(Boolean))) as string[];

  const handleOpenJustificativa = (item: ValidationResult) => {
    setSelectedItem(item);
    setJustificativaDialogOpen(true);
  };

  const handleJustificativaSaved = () => {
    fetchData();
  };

  const formatCurrency = (value: number | null) => {
    if (value === null) return '-';
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleShareWhatsApp = (item: ValidationResult) => {
    const text = `*DIVERGÊNCIA DE FRETE*

📦 Carga: ${item.idCarga}
👤 Fretista: ${item.fretista}
📍 Rota: ${item.rota}

💰 Valor BI: ${formatCurrency(item.valorBI)}
📱 Valor APP: ${formatCurrency(item.valorApp)}
📋 Valor Tabela: ${formatCurrency(item.valorTabela)}

⚠️ Diferença BI x APP: ${formatCurrency(item.divergBiApp)}
⚠️ Diferença BI x Tabela: ${formatCurrency(item.divergBiTabela)}`;

    const encodedText = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encodedText}`, '_blank');
  };

  const handleShareAllDivergences = () => {
    const divergences = data.filter((d) => d.status === 'Diverge da Tabela');
    if (divergences.length === 0) {
      toast.info('Não há divergências para compartilhar');
      return;
    }

    const text = `*DIVERGÊNCIAS DE FRETE*

Total: ${divergences.length} cargas com divergência

${divergences
  .slice(0, 10)
  .map(
    (d, i) => `${i + 1}. Carga ${d.idCarga} - ${d.fretista}
   Rota: ${d.rota}
   Diferença: ${formatCurrency(d.divergBiTabela)}`
  )
  .join('\n\n')}

${divergences.length > 10 ? `\n... e mais ${divergences.length - 10} divergências` : ''}`;

    const encodedText = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encodedText}`, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#0F5132]" />
      </div>
    );
  }

  // Calcular métricas
  const totalCargas = filteredData.length;
  const totalDivergentes = filteredData.filter((d) => d.status !== 'Conforme Tabela' && d.statusFrete !== 'Justificado').length;
  const totalJustificados = filteredData.filter((d) => d.statusFrete === 'Justificado').length;
  const totalAutorizados = filteredData.filter((d) => d.statusValidacao === 'Validado e Autorizado').length;
  const valorAppTotal = filteredData.reduce((sum, item) => sum + (item.valorApp || 0), 0);

  return (
    <div className="space-y-3">
      {/* Cards de Métricas */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-gray-500 mb-1">Qtd. de Cargas</div>
            <div className="text-2xl font-bold">{totalCargas}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-gray-500 mb-1">Divergentes</div>
            <div className="text-2xl font-bold text-red-600">{totalDivergentes}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-gray-500 mb-1">Justificados</div>
            <div className="text-2xl font-bold text-blue-600">{totalJustificados}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-gray-500 mb-1">Autorizados</div>
            <div className="text-2xl font-bold text-green-600">{totalAutorizados}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-gray-500 mb-1">Vlr APP Total</div>
            <div className="text-xl font-bold">{formatCurrency(valorAppTotal)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <Input
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64 h-9 text-sm"
          />
          <Badge variant="outline" className="text-xs">
            {filteredData.length} registros
          </Badge>
          {!onlyDivergences && !onlyJustificados && (
            <>
              <Badge variant="destructive" className="text-xs">
                {filteredData.filter((d) => d.status !== 'Conforme Tabela' && d.statusFrete !== 'Justificado').length} divergências
              </Badge>
              <Badge className="text-xs bg-blue-600">
                {filteredData.filter((d) => d.statusFrete === 'Justificado').length} justificados
              </Badge>
            </>
          )}
          {totalPages > 1 && (
            <Badge variant="secondary" className="text-xs">
              Página {currentPage} de {totalPages}
            </Badge>
          )}
          <div className="ml-auto flex items-center gap-2">
            <ExportButton
              data={filteredData.map(item => ({
                Data: item.data,
                Carga: item.idCarga,
                Fretista: item.fretista,
                Rota: item.rota,
                'Valor BI': item.valorBI,
                'Valor APP': item.valorApp,
                'Valor Tabela': item.valorTabela,
                'Dif BI×APP': item.divergBiApp,
                'Dif BI×Tabela': item.divergBiTabela,
                Status: item.status,
                Justificativa: item.justificativa || '',
              }))}
              filename={onlyDivergences ? 'exportacao-divergencias' : onlyJustificados ? 'exportacao-justificados' : 'exportacao-validacao'}
            />
            {onlyDivergences && (
              <Button
                onClick={handleShareAllDivergences}
                size="sm"
                className="bg-green-600 hover:bg-green-700 h-9"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Compartilhar
              </Button>
            )}
            {onlyJustificados && (
              <Button
                onClick={handleShareAllDivergences}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 h-9"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Compartilhar
              </Button>
            )}
          </div>
        </div>
        
        <FilterBar
          onFilterChange={setFilters}
          quinzenas={quinzenas}
          fretistas={fretistas}
          rotas={rotas}
          veiculos={veiculos}
        />
      </div>

      <Card className="overflow-hidden dark:bg-[#434343] dark:border-[#606060]">
        <div className="overflow-auto max-h-[calc(100vh-400px)]">
          <table className="w-full text-xs border-collapse">
            {/* Header */}
            <thead className="bg-gray-50 dark:bg-gray-800 border-b sticky top-0 z-10">
              <tr>
                <th className="p-2 text-left font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap border-r">Data</th>
                <th className="p-2 text-left font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap border-r">Carga</th>
                <th className="p-2 text-left font-medium text-gray-600 dark:text-gray-400 min-w-[120px] border-r">Fretista</th>
                <th className="p-2 text-left font-medium text-gray-600 dark:text-gray-400 min-w-[150px] border-r">Rota</th>
                <th className="p-2 text-right font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap border-r">Vlr BI</th>
                <th className="p-2 text-right font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap border-r">Vlr APP</th>
                <th className="p-2 text-right font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap border-r">Vlr Tab</th>
                <th className="p-2 text-right font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap border-r">Dif B×A</th>
                <th className="p-2 text-right font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap border-r">Dif B×T</th>
                <th className="p-2 text-center font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap border-r">Status</th>
                <th className="p-2 text-center font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap border-r">Justif.</th>
                <th className="p-2 text-center font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap border-r">Validação</th>
                <th className="p-2 text-left font-medium text-gray-600 dark:text-gray-400 min-w-[150px] border-r">Justificativa</th>
                <th className="p-2 text-center font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">Ações</th>
              </tr>
            </thead>
            {/* Body */}
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={14} className="text-center py-8 text-sm text-gray-500">
                    {onlyDivergences ? 'Nenhuma divergência pendente' : onlyJustificados ? 'Nenhum registro justificado' : 'Nenhum registro'}
                  </td>
                </tr>
              ) : (
                paginatedData.map((item) => (
                  <tr
                    key={item.id}
                    className={`border-b hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                      item.status === 'Diverge da Tabela' ? 'bg-red-50/30 dark:bg-red-900/10' : ''
                    }`}
                  >
                    <td className="p-2 text-gray-600 dark:text-gray-400 whitespace-nowrap border-r">{item.data}</td>
                    <td className="p-2 font-mono font-medium whitespace-nowrap border-r">{item.idCarga}</td>
                    <td className="p-2 truncate max-w-[120px] border-r" title={item.fretista}>{item.fretista}</td>
                    <td className="p-2 truncate max-w-[150px] border-r" title={item.rota}>{item.rota}</td>
                    <td className="p-2 text-right font-mono whitespace-nowrap border-r">{formatCurrency(item.valorBI)}</td>
                    <td className="p-2 text-right font-mono whitespace-nowrap border-r">{formatCurrency(item.valorApp)}</td>
                    <td className="p-2 text-right font-mono whitespace-nowrap border-r">{formatCurrency(item.valorTabela)}</td>
                    <td className={`p-2 text-right font-mono font-medium whitespace-nowrap border-r ${item.divergBiApp !== null && item.divergBiApp !== 0 ? 'text-red-600 dark:text-red-400' : ''}`}>
                      {formatCurrency(item.divergBiApp)}
                    </td>
                    <td className={`p-2 text-right font-mono font-medium whitespace-nowrap border-r ${item.divergBiTabela !== null && item.divergBiTabela !== 0 ? 'text-red-600 dark:text-red-400' : ''}`}>
                      {formatCurrency(item.divergBiTabela)}
                    </td>
                    <td className="p-2 text-center border-r">
                      <Badge
                        variant={item.status === 'Conforme Tabela' ? 'default' : 'destructive'}
                        className={`text-xs whitespace-nowrap ${
                          item.status === 'Conforme Tabela'
                            ? 'bg-green-600 hover:bg-green-700'
                            : item.status === 'Diverge da Tabela'
                            ? 'bg-red-600 hover:bg-red-700'
                            : 'bg-gray-500 hover:bg-gray-600'
                        }`}
                      >
                        {item.status === 'Conforme Tabela' ? 'OK' : item.status === 'Diverge da Tabela' ? 'Diverge' : item.status}
                      </Badge>
                    </td>
                    <td className="p-2 text-center border-r">
                      <Badge
                        variant={item.statusFrete === 'Justificado' ? 'default' : 'secondary'}
                        className={`text-xs whitespace-nowrap ${
                          item.statusFrete === 'Justificado'
                            ? 'bg-blue-600 hover:bg-blue-700'
                            : 'bg-gray-400 hover:bg-gray-500'
                        }`}
                      >
                        {item.statusFrete === 'Justificado' ? 'Sim' : 'Não'}
                      </Badge>
                    </td>
                    <td className="p-2 text-center border-r">
                      <StatusButton
                        id={item.id}
                        idCarga={item.idCarga}
                        currentStatus={item.statusValidacao}
                        statusAtual={item.status}
                        onStatusChanged={fetchData}
                      />
                    </td>
                    <td className="p-2 text-xs text-gray-600 dark:text-gray-400 max-w-[150px] border-r">
                      {item.justificativa && item.justificativa.length > 40 ? (
                        <details className="cursor-pointer">
                          <summary className="hover:text-gray-900 dark:hover:text-gray-200 font-medium truncate">
                            {item.justificativa.substring(0, 40)}...
                          </summary>
                          <div className="mt-1 p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs whitespace-pre-wrap max-w-xs shadow-lg border">
                            {item.justificativa}
                          </div>
                        </details>
                      ) : (
                        <span className="truncate block" title={item.justificativa || ''}>{item.justificativa || '-'}</span>
                      )}
                    </td>
                    <td className="p-2">
                      <div className="flex gap-1 justify-center">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 hover:bg-gray-200 dark:hover:bg-gray-700"
                          onClick={() => handleOpenJustificativa(item)}
                          title="Justificativa"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </Button>
                        {item.status === 'Diverge da Tabela' && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-green-600 hover:bg-green-100 dark:hover:bg-green-900"
                            onClick={() => handleShareWhatsApp(item)}
                            title="WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Controles de Paginação */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <div className="text-sm text-gray-600">
              Mostrando {((currentPage - 1) * ITEMS_PER_PAGE) + 1} a {Math.min(currentPage * ITEMS_PER_PAGE, filteredData.length)} de {filteredData.length} registros
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(1)}
                disabled={currentPage === 1}
              >
                Primeira
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Anterior
              </Button>
              
              {/* Páginas */}
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => goToPage(pageNum)}
                      className={currentPage === pageNum ? 'bg-[#0F5132] hover:bg-[#0F5132]/90' : ''}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Próxima
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                Última
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Dialog de Justificativa */}
      {selectedItem && (
        <JustificativaDialog
          open={justificativaDialogOpen}
          onClose={() => setJustificativaDialogOpen(false)}
          id={selectedItem.id}
          idCarga={selectedItem.idCarga}
          fretista={selectedItem.fretista}
          rota={selectedItem.rota}
          currentJustificativa={selectedItem.justificativa || ''}
          onSave={handleJustificativaSaved}
        />
      )}
    </div>
  );
}

// Main App Component
export default function ConfereLOGApp() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'upload');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, []);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    const url = new URL(window.location.href);
    url.searchParams.set('tab', value);
    window.history.pushState({}, '', url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#0F5132]" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <MainLayout>
      {activeTab === 'upload' && <UploadPage />}
      {activeTab === 'validacao' && <ValidationTable />}
      {activeTab === 'divergencias' && <ValidationTable onlyDivergences />}
      {activeTab === 'justificados' && <ValidationTable onlyJustificados />}
      {activeTab === 'dashboard' && <DashboardPage />}
    </MainLayout>
  );
}
