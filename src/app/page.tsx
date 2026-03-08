'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Upload, CheckCircle, AlertTriangle, LogOut, FileSpreadsheet, MessageCircle, Loader2, FileText, Eye, Moon, Sun } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { QuinzenaModal } from '@/components/QuinzenaModal';
import { JustificativaDialog } from '@/components/JustificativaDialog';
import { FilterBar, FilterValues } from '@/components/FilterBar';
import { HistoricoImportacoes } from '@/components/HistoricoImportacoes';
import { ExportButton } from '@/components/ExportButton';
import Image from 'next/image';
import DashboardPage from './dashboard/page';

// Types
interface AuthState {
  authenticated: boolean;
  loading: boolean;
}

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
  placa: string | null;
  tipoVeiculo: string | null;
  justificativa?: string | null;
  idQuinzenal?: string | null;
}

// Login Component
function LoginPage({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success('Acesso autorizado');
        onLogin();
      } else {
        toast.error('Senha incorreta');
      }
    } catch {
      toast.error('Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={{
        backgroundImage: 'url(/backgroundlogin.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Overlay escuro */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      
      <Card className="w-full max-w-md shadow-2xl border-0 relative z-10">
        <CardHeader className="text-center space-y-4 pb-4">
          <div className="mx-auto w-24 h-24 relative">
            <Image
              src="/logo.png"
              alt="ConfereLOG"
              fill
              className="object-contain"
              priority
            />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-gray-900">ConfereLOG</CardTitle>
            <CardDescription className="text-sm mt-1">
              Sistema de Validação de Fretes
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Senha de Acesso
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite a senha"
                className="h-10"
                disabled={loading}
              />
            </div>
            <Button
              type="submit"
              className="w-full h-10 bg-[#0F5132] hover:bg-[#0F5132]/90 text-white"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
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

      const res = await fetch('/api/upload', {
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

      const res = await fetch('/api/upload', {
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
              className={`relative transition-all hover:shadow-md ${
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

      {/* Histórico de Importações */}
      <HistoricoImportacoes />
    </div>
  );
}

// Validation Table Component
function ValidationTable({ onlyDivergences = false }: { onlyDivergences?: boolean }) {
  const [data, setData] = useState<ValidationResult[]>([]);
  const [filteredData, setFilteredData] = useState<ValidationResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [justificativaDialogOpen, setJustificativaDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ValidationResult | null>(null);
  const [filters, setFilters] = useState<FilterValues>({
    quinzena: '',
    data: '',
    fretista: '',
    rota: '',
    veiculo: '',
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const url = onlyDivergences
        ? '/api/fretes/validacao?divergentes=true'
        : '/api/fretes/validacao';
      const res = await fetch(url);
      const result = await res.json();
      setData(result.data || []);
      setFilteredData(result.data || []);
    } catch (error) {
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  }, [onlyDivergences]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Aplicar filtros
  useEffect(() => {
    let filtered = [...data];

    // Filtro de busca
    if (search) {
      filtered = filtered.filter(
        (item) =>
          item.fretista.toLowerCase().includes(search.toLowerCase()) ||
          item.rota.toLowerCase().includes(search.toLowerCase()) ||
          item.idCarga.includes(search)
      );
    }

    // Filtro de quinzena
    if (filters.quinzena) {
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

    setFilteredData(filtered);
  }, [data, search, filters]);

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

  return (
    <div className="space-y-3">
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
          {!onlyDivergences && (
            <Badge variant="destructive" className="text-xs">
              {filteredData.filter((d) => d.status === 'Diverge da Tabela').length} divergências
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
              filename={onlyDivergences ? 'exportacao-divergencias' : 'exportacao-validacao'}
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

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[1200px]">
            {/* Header */}
            <div className="grid grid-cols-[80px_70px_120px_180px_90px_90px_90px_80px_80px_110px_150px_70px] gap-2 p-2 bg-gray-50 text-xs font-medium text-gray-600 border-b">
              <div>Data</div>
              <div>Carga</div>
              <div>Fretista</div>
              <div>Rota</div>
              <div>Vlr BI</div>
              <div>Vlr APP</div>
              <div>Vlr Tab</div>
              <div>Dif B×A</div>
              <div>Dif B×T</div>
              <div>Status</div>
              <div>Justificativa</div>
              <div></div>
            </div>
            {/* Body */}
            <div className="max-h-[calc(100vh-280px)] overflow-y-auto">
              {filteredData.length === 0 ? (
                <div className="text-center py-8 text-sm text-gray-500">
                  {onlyDivergences ? 'Nenhuma divergência' : 'Nenhum registro'}
                </div>
              ) : (
                filteredData.map((item) => (
                  <div
                    key={item.id}
                    className={`grid grid-cols-[80px_70px_120px_180px_90px_90px_90px_80px_80px_110px_150px_70px] gap-2 p-2 items-center text-xs border-b hover:bg-gray-50 transition-colors ${
                      item.status === 'Diverge da Tabela' ? 'bg-red-50/30' : ''
                    }`}
                  >
                    <div className="text-gray-600">{item.data}</div>
                    <div className="font-mono font-medium">{item.idCarga}</div>
                    <div className="truncate" title={item.fretista}>{item.fretista}</div>
                    <div className="truncate" title={item.rota}>{item.rota}</div>
                    <div className="font-mono">{formatCurrency(item.valorBI)}</div>
                    <div className="font-mono">{formatCurrency(item.valorApp)}</div>
                    <div className="font-mono">{formatCurrency(item.valorTabela)}</div>
                    <div className={`font-mono font-medium ${item.divergBiApp !== null && item.divergBiApp !== 0 ? 'text-red-600' : ''}`}>
                      {formatCurrency(item.divergBiApp)}
                    </div>
                    <div className={`font-mono font-medium ${item.divergBiTabela !== null && item.divergBiTabela !== 0 ? 'text-red-600' : ''}`}>
                      {formatCurrency(item.divergBiTabela)}
                    </div>
                    <div>
                      <Badge
                        variant={item.status === 'Conforme Tabela' ? 'default' : 'destructive'}
                        className={`text-xs ${
                          item.status === 'Conforme Tabela'
                            ? 'bg-green-600'
                            : item.status === 'Diverge da Tabela'
                            ? 'bg-red-600'
                            : 'bg-gray-500'
                        }`}
                      >
                        {item.status === 'Conforme Tabela' ? 'OK' : item.status === 'Diverge da Tabela' ? 'Diverge' : item.status}
                      </Badge>
                    </div>
                    <div className="truncate text-xs text-gray-600" title={item.justificativa || ''}>
                      {item.justificativa || '-'}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => handleOpenJustificativa(item)}
                        title="Justificativa"
                      >
                        <FileText className="w-3.5 h-3.5" />
                      </Button>
                      {item.status === 'Diverge da Tabela' && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-green-600"
                          onClick={() => handleShareWhatsApp(item)}
                          title="WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
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
function ConfereLOGApp() {
  const [auth, setAuth] = useState<AuthState>({ authenticated: false, loading: true });
  const [activeTab, setActiveTab] = useState('upload');
  const authChecked = useRef(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Gerenciar tema
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  useEffect(() => {
    if (authChecked.current) return;
    authChecked.current = true;
    
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth');
        const data = await res.json();
        setAuth({ authenticated: data.authenticated, loading: false });
      } catch {
        setAuth({ authenticated: false, loading: false });
      }
    };
    
    void checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth', { method: 'DELETE' });
      setAuth({ authenticated: false, loading: false });
      toast.success('Logout realizado');
    } catch {
      toast.error('Erro ao sair');
    }
  };

  if (auth.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#0F5132]" />
      </div>
    );
  }

  if (!auth.authenticated) {
    return (
      <LoginPage
        onLogin={() => setAuth({ authenticated: true, loading: false })}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b dark:border-gray-800 shadow-sm">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 relative">
                <Image
                  src="/logo.png"
                  alt="ConfereLOG"
                  fill
                  className="object-contain"
                />
              </div>
              <div>
                <h1 className="font-bold text-lg text-gray-900 dark:text-white">ConfereLOG</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Sistema de Validação de Fretes</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="h-8"
                title={theme === 'light' ? 'Tema Escuro' : 'Tema Claro'}
              >
                {theme === 'light' ? (
                  <Moon className="w-4 h-4" />
                ) : (
                  <Sun className="w-4 h-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white h-8"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Banner */}
      <div className="bg-white dark:bg-gray-900 border-b dark:border-gray-800">
        <div className="container mx-auto px-4">
          <div className="relative w-full h-32 overflow-hidden">
            <Image
              src="/banner.gif"
              alt="Banner"
              fill
              className="object-cover object-center"
              unoptimized
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-4 flex-1">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-4 h-9 bg-white dark:bg-gray-900">
            <TabsTrigger value="upload" className="text-sm">
              <Upload className="w-4 h-4 mr-2" />
              Importação
            </TabsTrigger>
            <TabsTrigger value="validacao" className="text-sm">
              <Eye className="w-4 h-4 mr-2" />
              Validação
            </TabsTrigger>
            <TabsTrigger value="divergencias" className="text-sm">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Divergências
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="text-sm">
              <CheckCircle className="w-4 h-4 mr-2" />
              Dashboard
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload">
            <UploadPage />
          </TabsContent>

          <TabsContent value="validacao">
            <ValidationTable />
          </TabsContent>

          <TabsContent value="divergencias">
            <ValidationTable onlyDivergences />
          </TabsContent>

          <TabsContent value="dashboard">
            <DashboardPage />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-900 border-t dark:border-gray-800 py-3 mt-auto">
        <div className="container mx-auto px-4 text-center text-xs text-gray-500 dark:text-gray-400">
          ConfereLOG © {new Date().getFullYear()} - Grupo Doce Mel
        </div>
      </footer>
    </div>
  );
}

// Export wrapped with ThemeProvider context
export default ConfereLOGApp;
