import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import * as XLSX from 'xlsx';

// Configuração para Vercel
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60; // 60 segundos timeout

type BIRecord = {
  idCarga: string;
  valorBI: number;
  pesoBruto?: number;
  pesoLiquido?: number;
  valorCarga?: number;
  custoMedioKgTransp?: string;
  txOcupacaoKg?: string;
  txOcupacaoM3?: string;
  percDespesaEntrega?: string;
  vlrDevolucao?: number;
  percDevolucao?: string;
  percMargem?: string;
  vlrCusto?: number;
  vlrDesctoFinanceiro?: number;
};

type AppRecord = {
  idCarga: string;
  data: string;
  fretista: string;
  rota: string;
  valorApp: number;
  placa: string;
  tipo: string;
  status: string;
};

type TabelaRecord = {
  rota: string;
  tipoVeiculo: string;
  valorTabela: number;
  km: number | null;
  custoKm: number | null;
};

function parseBIFile(workbook: XLSX.WorkBook): BIRecord[] {
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet) as Array<Record<string, unknown>>;

  const records: BIRecord[] = [];

  for (const row of data) {
    const carga = row['Carga'];
    const valor = row['Valor Frete'];

    if (!carga || carga === 'Totais' || carga === '-') continue;

    let idCarga = String(carga).trim();
    const parsed = parseInt(idCarga);
    if (isNaN(parsed) || parsed < 1000) continue;
    idCarga = String(parsed);

    const valorBI = parseFloat(String(valor));
    if (isNaN(valorBI) || valorBI <= 0) continue;

    const parseNumber = (val: unknown): number | undefined => {
      if (val === null || val === undefined || val === '-') return undefined;
      const num = parseFloat(String(val));
      return isNaN(num) ? undefined : num;
    };

    const parseString = (val: unknown): string | undefined => {
      if (val === null || val === undefined || val === '-') return undefined;
      return String(val).trim();
    };

    records.push({
      idCarga,
      valorBI,
      pesoBruto: parseNumber(row['Peso Buto']),
      pesoLiquido: parseNumber(row['Peso Líquido']),
      valorCarga: parseNumber(row['Valor Carga']),
      custoMedioKgTransp: parseString(row['Custo Médio KG Transp.']),
      txOcupacaoKg: parseString(row['Tx Ocupação Kg']),
      txOcupacaoM3: parseString(row['Tx Ocupação m3']),
      percDespesaEntrega: parseString(row['% Despesa Entrega']),
      vlrDevolucao: parseNumber(row['Vlr Devolução']),
      percDevolucao: parseString(row['% Devolução']),
      percMargem: parseString(row['% Margem']),
      vlrCusto: parseNumber(row['Vlr Custo']),
      vlrDesctoFinanceiro: parseNumber(row['Vlr Descto Financeiro']),
    });
  }

  return records;
}

function parseAppFile(workbook: XLSX.WorkBook): AppRecord[] {
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet) as Array<Record<string, unknown>>;

  const records: AppRecord[] = [];

  const formatExcelDate = (value: unknown): string => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') {
      if (value.includes('/')) return value;
      return value;
    }
    if (typeof value === 'number') {
      const excelEpoch = new Date(1899, 11, 30);
      const date = new Date(excelEpoch.getTime() + value * 24 * 60 * 60 * 1000);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    }
    return String(value);
  };

  for (const row of data) {
    const carga = row['Carga'];
    const valor = row['Valor'];

    if (!valor) continue;

    let idCarga: string;
    
    if (!carga) {
      idCarga = `SEM_CARGA_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    } else {
      const cargaStr = String(carga).trim();
      const parsed = parseFloat(cargaStr);
      
      if (isNaN(parsed)) {
        idCarga = cargaStr.replace(/[^A-Z0-9_-]/gi, '_').toUpperCase();
      } else {
        idCarga = String(Math.floor(parsed));
      }
    }

    let valorApp: number;
    if (typeof valor === 'number') {
      valorApp = valor;
    } else {
      const valorStr = String(valor)
        .replace('R$', '')
        .replace(/\s/g, '')
        .replace(',', '.');
      valorApp = parseFloat(valorStr);
    }

    if (isNaN(valorApp) || valorApp <= 0) continue;

    let fretista = String(row['Fretista'] || '').trim();
    fretista = fretista.replace(/\s*\(Saida\)\s*$/i, '').replace(/\s*\(Entrada\)\s*$/i, '').trim();
    if (!fretista) fretista = 'SEM FRETISTA';

    let rota = String(row['Rota'] || '').trim().toUpperCase();
    if (!rota) rota = 'SEM ROTA';

    let placa = String(row['Placa'] || '').trim().toUpperCase();
    placa = placa.replace(/[^A-Z0-9]/g, '');
    
    const tipo = String(row['Tipo'] || '').trim();
    const status = String(row['Status'] || '').trim();
    const dataStr = formatExcelDate(row['Data']);

    records.push({
      idCarga,
      data: dataStr,
      fretista,
      rota,
      valorApp,
      placa: placa || '',
      tipo,
      status,
    });
  }

  return records;
}

function parseTabelaFile(workbook: XLSX.WorkBook): TabelaRecord[] {
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet) as Array<Record<string, unknown>>;

  const records: TabelaRecord[] = [];

  for (const row of data) {
    const rotaDestino = row['Rota_Destino'];
    const tipoVeiculo = row['Tipo_Veiculo'];
    const valorTotal = row['Valor_Total_Frete'];

    if (!rotaDestino || !tipoVeiculo || valorTotal === undefined) continue;

    const rota = String(rotaDestino).trim().toUpperCase();
    const tipo = String(tipoVeiculo).trim().toUpperCase();

    const tipoMap: Record<string, string> = {
      'DELIVERY': 'DELIVERY',
      'BONGO': 'BONGO',
      '3/4': '3/4',
      '3 / 4': '3/4',
      'TOCO': 'TOCO',
    };

    const tipoVeiculoNormalized = tipoMap[tipo] || tipo;
    const valorTabela = parseFloat(String(valorTotal));
    if (isNaN(valorTabela)) continue;

    records.push({
      rota,
      tipoVeiculo: tipoVeiculoNormalized,
      valorTabela,
      km: row['KM_Rota'] ? parseInt(String(row['KM_Rota'])) : null,
      custoKm: row['Custo_KM'] ? parseFloat(String(row['Custo_KM'])) : null,
    });
  }

  return records;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;
    const idQuinzenal = formData.get('idQuinzenal') as string;

    if (!file || !type) {
      return NextResponse.json(
        { error: 'File and type are required' },
        { status: 400 }
      );
    }

    if (type !== 'tabela' && !idQuinzenal) {
      return NextResponse.json(
        { error: 'ID Quinzenal é obrigatório para BI e APP' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const workbook = XLSX.read(buffer, { type: 'buffer' });

    let inserted = 0;
    let records: BIRecord[] | AppRecord[] | TabelaRecord[] = [];

    if (type === 'bi') {
      records = parseBIFile(workbook);
      await supabase.from('dados_bi').delete().eq('id_quinzenal', idQuinzenal);
      
      for (const record of records as BIRecord[]) {
        const { error } = await supabase.from('dados_bi').insert({
          id_carga: record.idCarga,
          valor_bi: record.valorBI,
          id_quinzenal: idQuinzenal,
          peso_bruto: record.pesoBruto,
          peso_liquido: record.pesoLiquido,
          valor_carga: record.valorCarga,
          custo_medio_kg_transp: record.custoMedioKgTransp,
          tx_ocupacao_kg: record.txOcupacaoKg,
          tx_ocupacao_m3: record.txOcupacaoM3,
          perc_despesa_entrega: record.percDespesaEntrega,
          vlr_devolucao: record.vlrDevolucao,
          perc_devolucao: record.percDevolucao,
          perc_margem: record.percMargem,
          vlr_custo: record.vlrCusto,
          vlr_descto_financeiro: record.vlrDesctoFinanceiro,
        });
        
        if (!error) inserted++;
      }
    } else if (type === 'app') {
      records = parseAppFile(workbook);
      await supabase.from('dados_fretes').delete().eq('id_quinzenal', idQuinzenal);
      
      for (const record of records as AppRecord[]) {
        const { error } = await supabase.from('dados_fretes').insert({
          id_carga: record.idCarga,
          data: record.data,
          fretista: record.fretista,
          rota: record.rota,
          valor_app: record.valorApp,
          placa: record.placa || null,
          tipo: record.tipo,
          status: record.status,
          id_quinzenal: idQuinzenal,
        });
        
        if (!error) inserted++;
      }
    } else if (type === 'tabela') {
      records = parseTabelaFile(workbook);
      await supabase.from('tabela_fretes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      
      for (const record of records as TabelaRecord[]) {
        const { error } = await supabase.from('tabela_fretes').insert({
          rota: record.rota,
          tipo_veiculo: record.tipoVeiculo,
          valor_tabela: record.valorTabela,
          km: record.km,
          custo_km: record.custoKm
        });
        
        if (!error) inserted++;
      }
    } else {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    let menorCarga: string | null = null;
    let maiorCarga: string | null = null;
    
    if (type === 'bi' || type === 'app') {
      const cargas = (records as Array<{ idCarga: string }>)
        .map(r => r.idCarga)
        .filter(id => !isNaN(parseInt(id)))
        .map(id => parseInt(id))
        .sort((a, b) => a - b);
      
      if (cargas.length > 0) {
        menorCarga = String(cargas[0]);
        maiorCarga = String(cargas[cargas.length - 1]);
      }
    }

    const tipoImportacaoMap: Record<string, string> = {
      'bi': 'dados_bi',
      'app': 'dados_app_fretes',
      'tabela': 'tabela_fretes',
    };

    await supabase.from('historico_importacoes').insert({
      nome_arquivo: file.name,
      tipo_importacao: tipoImportacaoMap[type],
      qtd_linhas: inserted,
      menor_carga: menorCarga,
      maior_carga: maiorCarga,
      id_quinzenal: type !== 'tabela' ? idQuinzenal : null,
    });

    await supabase.from('divergencias').insert({
      tipo: type.toUpperCase(),
      file_name: file.name,
      records_count: inserted,
      status: 'COMPLETED',
    });

    return NextResponse.json({
      success: true,
      inserted,
      total: records.length,
      preview: records.slice(0, 5),
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to process upload', details: String(error) },
      { status: 500 }
    );
  }
}
