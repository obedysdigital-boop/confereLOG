import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipos para as tabelas
export type Veiculo = {
  id: string;
  fretista: string;
  placa: string;
  tipo: string;
  created_at: string;
  updated_at: string;
};

export type DadosFrete = {
  id: string;
  id_carga: string;
  data: string;
  fretista: string;
  rota: string;
  valor_app: number;
  placa?: string;
  tipo?: string;
  status?: string;
  id_quinzenal?: string;
  justificativa?: string;
  created_at: string;
  updated_at: string;
};

export type DadosBI = {
  id: string;
  id_carga: string;
  valor_bi: number;
  id_quinzenal?: string;
  peso_bruto?: number;
  peso_liquido?: number;
  valor_carga?: number;
  custo_medio_kg_transp?: string;
  tx_ocupacao_kg?: string;
  tx_ocupacao_m3?: string;
  perc_despesa_entrega?: string;
  vlr_devolucao?: number;
  perc_devolucao?: string;
  perc_margem?: string;
  vlr_custo?: number;
  vlr_descto_financeiro?: number;
  created_at: string;
  updated_at: string;
};

export type TabelaFrete = {
  id: string;
  rota: string;
  tipo_veiculo: string;
  valor_tabela: number;
  km?: number;
  custo_km?: number;
  created_at: string;
  updated_at: string;
};

export type Divergencia = {
  id: string;
  tipo: string;
  file_name: string;
  records_count: number;
  status: string;
  error?: string;
  created_at: string;
};

export type Quinzena = {
  id: string;
  id_quinzenal: string;
  descricao: string;
  mes: number;
  ano: number;
  quinzena: number;
  created_at: string;
  updated_at: string;
};

export type HistoricoImportacao = {
  id: string;
  data_importacao: string;
  nome_arquivo: string;
  tipo_importacao: 'dados_bi' | 'dados_app_fretes' | 'tabela_fretes';
  qtd_linhas: number;
  menor_carga: string | null;
  maior_carga: string | null;
  id_quinzenal: string | null;
  created_at: string;
};
