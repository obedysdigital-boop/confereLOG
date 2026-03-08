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

    // Fetch all data - buscar separadamente para ter controle total
    let cargasQuery = supabase
      .from('dados_fretes')
      .select('*')
      .order('data', { ascending: false });

    // Filtrar por quinzena se fornecido
    if (idQuinzenal) {
      cargasQuery = cargasQuery.eq('id_quinzenal', idQuinzenal);
    }

    const { data: cargas, error: cargasError } = await cargasQuery;

    if (cargasError) throw cargasError;

    let biQuery = supabase
      .from('dados_bi')
      .select('*');

    // Filtrar por quinzena se fornecido
    if (idQuinzenal) {
      biQuery = biQuery.eq('id_quinzenal', idQuinzenal);
    }

    const { data: dadosBI, error: biError } = await biQuery;

    if (biError) throw biError;

    const { data: tabelaFretes, error: tabelaError } = await supabase
      .from('tabela_fretes')
      .select('*');

    if (tabelaError) throw tabelaError;

    // Create lookup map for dados BI - pode haver múltiplos BIs para a mesma carga
    // Vamos usar um Map que armazena arrays de valores
    const biMap = new Map<string, number[]>();
    for (const bi of dadosBI || []) {
      if (!biMap.has(bi.id_carga)) {
        biMap.set(bi.id_carga, []);
      }
      biMap.get(bi.id_carga)!.push(bi.valor_bi);
    }

    // Create lookup map for tabela de fretes
    const tabelaMap = new Map<string, number>();
    for (const tf of tabelaFretes || []) {
      const key = `${normalizeRota(tf.rota)}_${normalizeTipoVeiculo(tf.tipo_veiculo)}`;
      tabelaMap.set(key, tf.valor_tabela);
    }

    // Process and calculate divergences
    const results: ValidationResult[] = [];

    for (const carga of cargas || []) {
      // Para cada frete, buscar o primeiro valor BI correspondente (se houver múltiplos)
      const valoresBI = biMap.get(carga.id_carga);
      const valorBI = valoresBI && valoresBI.length > 0 ? valoresBI[0] : null;
      const valorApp = carga.valor_app;
      
      // Determine vehicle type from placa or default
      let tipoVeiculo: string | null = null;
      if (carga.placa) {
        // Try to infer from known vehicles
        const knownVehicles: Record<string, string> = {
          'QKY0D59': 'DELIVERY',
          'LRC7H40': 'DELIVERY',
          'BRY9A41': 'DELIVERY',
          'OSF8808': 'BONGO',
          'JOP0J97': '3/4',
          'LST7H05': '3/4',
          'PJN1652': '3/4',
          'OES3C15': '3/4',
          'JPX8747': '3/4',
          'NZY7881': 'TOCO',
          'NVM5109': '3/4',
          'ORI2G75': '3/4',
          'DVA3G04': 'TOCO',
          'IAD5528': 'TOCO',
          'PST5A22': 'TOCO',
          'NYL1B84': 'TOCO',
          'PEY9D15': '3/4',
          'PLK2C22': 'BONGO',
          'OKV2567': 'TOCO',
        };
        tipoVeiculo = knownVehicles[carga.placa.replace('-', '')] ?? null;
      }

      // Find valor tabela based on rota and tipo veiculo
      let valorTabela: number | null = null;
      if (carga.rota && tipoVeiculo) {
        const key = `${normalizeRota(carga.rota)}_${normalizeTipoVeiculo(tipoVeiculo)}`;
        valorTabela = tabelaMap.get(key) ?? null;
        
        // If not found, try partial matching for route
        if (valorTabela === null) {
          for (const [k, v] of tabelaMap.entries()) {
            const [rotaKey, tipoKey] = k.split('_');
            if (tipoKey === normalizeTipoVeiculo(tipoVeiculo)) {
              // Check if routes partially match
              if (normalizeRota(carga.rota).includes(rotaKey) || rotaKey.includes(normalizeRota(carga.rota))) {
                valorTabela = v;
                break;
              }
            }
          }
        }
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
          const hasDivergence = (divergBiApp !== null && divergBiApp !== 0) || 
                               (divergBiTabela !== null && divergBiTabela !== 0);
          status = hasDivergence ? 'Diverge da Tabela' : 'Conforme Tabela';
        } else {
          status = 'Sem valor tabela';
        }
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
      });
    }

    // Filter if only divergences requested
    const filteredResults = onlyDivergences 
      ? results.filter(r => r.status === 'Diverge da Tabela')
      : results;

    return NextResponse.json({
      data: filteredResults,
      total: results.length,
      divergences: results.filter(r => r.status === 'Diverge da Tabela').length,
    });
  } catch (error) {
    console.error('Error calculating validation:', error);
    return NextResponse.json(
      { error: 'Failed to calculate validation' },
      { status: 500 }
    );
  }
}
