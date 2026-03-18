import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

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
  justificativa: string | null;
  idQuinzenal: string | null;
  statusValidacao: string;
  validadoPorUsuario: string | null;
  validadoPorTipo: string | null;
  dataValidacao: string | null;
}

// Normalize route name for matching
function normalizeRota(rota: string): string {
  if (!rota) return '';
  return rota.toUpperCase().trim();
}

// Normalize vehicle type for matching
function normalizeTipoVeiculo(tipo: string): string {
  if (!tipo) return '';
  const t = tipo.toUpperCase().trim();
  
  const mappings: Record<string, string> = {
    'DELIVERY': 'DELIVERY',
    'BONGO': 'BONGO',
    '3/4': '3/4',
    '3 / 4': '3/4',
    'TOCO': 'TOCO',
    'TRUCK': 'TOCO',
  };
  return mappings[t] || t;
}

// GET - Get validation data with calculated divergences
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const onlyDivergences = searchParams.get('divergentes') === 'true';
    const idQuinzenal = searchParams.get('idQuinzenal');

    // Fetch dados_fretes
    let cargasQuery = supabase
      .from('dados_fretes')
      .select('*')
      .order('data', { ascending: false });

    if (idQuinzenal) {
      cargasQuery = cargasQuery.eq('id_quinzenal', idQuinzenal);
    }

    const { data: cargas, error: cargasError } = await cargasQuery;
    if (cargasError) throw cargasError;

    // Fetch dados_bi
    let biQuery = supabase.from('dados_bi').select('*');
    if (idQuinzenal) {
      biQuery = biQuery.eq('id_quinzenal', idQuinzenal);
    }

    const { data: dadosBI, error: biError } = await biQuery;
    if (biError) throw biError;

    // Fetch tabela_fretes
    const { data: tabelaFretes, error: tabelaError } = await supabase
      .from('tabela_fretes')
      .select('*');
    if (tabelaError) throw tabelaError;

    // Fetch veiculos para fazer o match manual
    const { data: veiculos, error: veiculosError } = await supabase
      .from('veiculos')
      .select('placa, tipo');
    if (veiculosError) throw veiculosError;

    // Create lookup maps
    const biMap = new Map<string, number[]>();
    for (const bi of dadosBI || []) {
      if (!biMap.has(bi.id_carga)) {
        biMap.set(bi.id_carga, []);
      }
      biMap.get(bi.id_carga)!.push(bi.valor_bi);
    }

    const tabelaMap = new Map<string, number>();
    for (const tf of tabelaFretes || []) {
      const key = `${normalizeRota(tf.rota)}_${normalizeTipoVeiculo(tf.tipo_veiculo)}`;
      tabelaMap.set(key, tf.valor_tabela);
    }

    // Create veiculos map (placa -> tipo)
    const veiculosMap = new Map<string, string>();
    for (const v of veiculos || []) {
      veiculosMap.set(v.placa, v.tipo);
    }

    // Process and calculate divergences
    const results: ValidationResult[] = [];

    for (const carga of cargas || []) {
      const valoresBI = biMap.get(carga.id_carga);
      const valorBI = valoresBI && valoresBI.length > 0 ? valoresBI[0] : null;
      const valorApp = carga.valor_app;
      
      // Buscar tipo de veículo pela placa na tabela veiculos
      let tipoVeiculo: string | null = null;
      if (carga.placa) {
        tipoVeiculo = veiculosMap.get(carga.placa) || null;
      }

      // Find valor tabela based on rota and tipo veiculo
      let valorTabela: number | null = null;
      if (carga.rota && tipoVeiculo) {
        const key = `${normalizeRota(carga.rota)}_${normalizeTipoVeiculo(tipoVeiculo)}`;
        valorTabela = tabelaMap.get(key) ?? null;
      }

      // Calculate divergences
      const divergBiApp = valorBI !== null && valorApp !== null 
        ? Number((valorBI - valorApp).toFixed(2)) 
        : null;
      const divergBiTabela = valorBI !== null && valorTabela !== null 
        ? Number((valorBI - valorTabela).toFixed(2)) 
        : null;

      // Determine status
      let status = 'Sem dados BI';
      if (valorBI !== null) {
        if (valorTabela !== null) {
          const hasDivergence = Math.abs(divergBiTabela || 0) > 0.01;
          status = hasDivergence ? 'Diverge da Tabela' : 'Conforme Tabela';
        } else {
          status = 'Sem valor tabela';
        }
      }

      // Se tem status_frete definido (Justificado), usar ele
      if (carga.status_frete) {
        status = carga.status_frete;
      }

      // Auto-autorizar status OK
      let statusValidacao = carga.status_validacao || 'Não autorizado';
      if (status === 'Conforme Tabela' && statusValidacao === 'Não autorizado') {
        statusValidacao = 'Validado e Autorizado';
      }

      results.push({
        id: carga.id,
        data: carga.data,
        idCarga: carga.id_carga,
        fretista: carga.fretista,
        rota: carga.rota,
        valorBI,
        valorApp,
        valorTabela,
        divergBiApp,
        divergBiTabela,
        status,
        placa: carga.placa,
        tipoVeiculo,
        justificativa: carga.justificativa || null,
        idQuinzenal: carga.id_quinzenal || null,
        statusValidacao,
        validadoPorUsuario: carga.validado_por_usuario || null,
        validadoPorTipo: carga.validado_por_tipo || null,
        dataValidacao: carga.data_validacao || null,
      });
    }

    // Filter if only divergences requested
    const filteredResults = onlyDivergences 
      ? results.filter(r => r.status !== 'Conforme Tabela')
      : results;

    return NextResponse.json({
      data: filteredResults,
      total: results.length,
      divergences: results.filter(r => r.status !== 'Conforme Tabela').length,
    });
  } catch (error) {
    console.error('Error calculating validation:', error);
    return NextResponse.json(
      { error: 'Failed to calculate validation' },
      { status: 500 }
    );
  }
}
