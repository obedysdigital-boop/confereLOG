import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const idQuinzenal = searchParams.get('idQuinzenal');
    const data = searchParams.get('data');
    const fretista = searchParams.get('fretista');
    const rota = searchParams.get('rota');
    const veiculo = searchParams.get('veiculo');

    // Buscar dados fretes
    let fretesQuery = supabase
      .from('dados_fretes')
      .select('*');

    if (idQuinzenal) {
      fretesQuery = fretesQuery.eq('id_quinzenal', idQuinzenal);
    }
    if (fretista) {
      fretesQuery = fretesQuery.eq('fretista', fretista);
    }
    if (rota) {
      fretesQuery = fretesQuery.eq('rota', rota);
    }
    if (veiculo) {
      fretesQuery = fretesQuery.eq('placa', veiculo);
    }

    const { data: fretes, error: fretesError } = await fretesQuery;
    if (fretesError) throw fretesError;

    // Buscar dados BI
    let biQuery = supabase
      .from('dados_bi')
      .select('*');

    if (idQuinzenal) {
      biQuery = biQuery.eq('id_quinzenal', idQuinzenal);
    }
    if (data) {
      biQuery = biQuery.eq('data', data);
    }

    const { data: dadosBI, error: biError } = await biQuery;
    if (biError) throw biError;

    // Criar mapa de dados BI por id_carga
    const biMap = new Map();
    for (const bi of dadosBI || []) {
      biMap.set(bi.id_carga, bi);
    }

    // Calcular métricas
    const totalValor = fretes?.reduce((sum, f) => sum + (f.valor_app || 0), 0) || 0;
    const qtdFretes = fretes?.length || 0;
    
    let pesoBrutoTotal = 0;
    let faturamentoBruto = 0;
    let despesaFreteTotal = 0;
    let ocupacaoKgTotal = 0;
    let custoMedioKgTotal = 0;
    let countWithBI = 0;

    for (const frete of fretes || []) {
      const bi = biMap.get(frete.id_carga);
      if (bi) {
        countWithBI++;
        pesoBrutoTotal += bi.peso_bruto || 0;
        faturamentoBruto += bi.valor_carga || 0;
        
        // Parse percentuais
        const percDespesa = parseFloat(String(bi.perc_despesa_entrega || '0').replace('%', '').replace(',', '.'));
        if (!isNaN(percDespesa)) {
          despesaFreteTotal += percDespesa;
        }

        const txOcupacao = parseFloat(String(bi.tx_ocupacao_kg || '0').replace('%', '').replace(',', '.'));
        if (!isNaN(txOcupacao)) {
          ocupacaoKgTotal += txOcupacao;
        }

        const custoMedio = parseFloat(String(bi.custo_medio_kg_transp || '0').replace('R$', '').replace(',', '.'));
        if (!isNaN(custoMedio)) {
          custoMedioKgTotal += custoMedio;
        }
      }
    }

    const percDespesaFrete = countWithBI > 0 ? despesaFreteTotal / countWithBI : 0;
    const txOcupacaoMedia = countWithBI > 0 ? ocupacaoKgTotal / countWithBI : 0;
    const custoMedioKg = countWithBI > 0 ? custoMedioKgTotal / countWithBI : 0;

    // Agrupar por fretista
    const porFretista = new Map<string, {
      valorTotal: number;
      qtdEntregas: number;
      pesoBruto: number;
      despesaFrete: number;
      ocupacao: number;
      custoKg: number;
      count: number;
    }>();

    for (const frete of fretes || []) {
      const bi = biMap.get(frete.id_carga);
      
      if (!porFretista.has(frete.fretista)) {
        porFretista.set(frete.fretista, {
          valorTotal: 0,
          qtdEntregas: 0,
          pesoBruto: 0,
          despesaFrete: 0,
          ocupacao: 0,
          custoKg: 0,
          count: 0,
        });
      }

      const stats = porFretista.get(frete.fretista)!;
      stats.valorTotal += frete.valor_app || 0;
      stats.qtdEntregas += 1;

      if (bi) {
        stats.pesoBruto += bi.peso_bruto || 0;
        
        const percDespesa = parseFloat(String(bi.perc_despesa_entrega || '0').replace('%', '').replace(',', '.'));
        if (!isNaN(percDespesa)) {
          stats.despesaFrete += percDespesa;
          stats.count += 1;
        }

        const txOcupacao = parseFloat(String(bi.tx_ocupacao_kg || '0').replace('%', '').replace(',', '.'));
        if (!isNaN(txOcupacao)) {
          stats.ocupacao += txOcupacao;
        }

        const custoMedio = parseFloat(String(bi.custo_medio_kg_transp || '0').replace('R$', '').replace(',', '.'));
        if (!isNaN(custoMedio)) {
          stats.custoKg += custoMedio;
        }
      }
    }

    // Converter para array e calcular médias
    const tabelaResumo = Array.from(porFretista.entries()).map(([fretista, stats]) => ({
      fretista,
      valorTotal: stats.valorTotal,
      qtdEntregas: stats.qtdEntregas,
      percDespesaFrete: stats.count > 0 ? stats.despesaFrete / stats.count : 0,
      percOcupacao: stats.count > 0 ? stats.ocupacao / stats.count : 0,
      custoKg: stats.count > 0 ? stats.custoKg / stats.count : 0,
      pesoTotal: stats.pesoBruto,
      pesoMedio: stats.qtdEntregas > 0 ? stats.pesoBruto / stats.qtdEntregas : 0,
    })).sort((a, b) => b.valorTotal - a.valorTotal);

    // Agrupar por rota
    const porRota = new Map<string, number>();
    for (const frete of fretes || []) {
      porRota.set(frete.rota, (porRota.get(frete.rota) || 0) + 1);
    }

    const graficoPorRota = Array.from(porRota.entries())
      .map(([rota, count]) => ({ rota, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // TOP 5 piores fretes (maior % despesa)
    const fretesComBI = fretes?.filter(f => biMap.has(f.id_carga)) || [];
    const top5Piores = fretesComBI
      .map(f => {
        const bi = biMap.get(f.id_carga);
        const percDespesa = parseFloat(String(bi?.perc_despesa_entrega || '0').replace('%', '').replace(',', '.'));
        return {
          idCarga: f.id_carga,
          fretista: f.fretista,
          rota: f.rota,
          percDespesa: isNaN(percDespesa) ? 0 : percDespesa,
        };
      })
      .sort((a, b) => b.percDespesa - a.percDespesa)
      .slice(0, 5);

    // TOP 5 melhores fretes (menor % despesa, excluindo zeros)
    const top5Melhores = fretesComBI
      .map(f => {
        const bi = biMap.get(f.id_carga);
        const percDespesa = parseFloat(String(bi?.perc_despesa_entrega || '0').replace('%', '').replace(',', '.'));
        return {
          idCarga: f.id_carga,
          fretista: f.fretista,
          rota: f.rota,
          percDespesa: isNaN(percDespesa) ? 999 : percDespesa,
        };
      })
      .filter(f => f.percDespesa > 0 && f.percDespesa < 999)
      .sort((a, b) => a.percDespesa - b.percDespesa)
      .slice(0, 5);

    return NextResponse.json({
      metricas: {
        totalValor,
        qtdFretes,
        pesoBrutoTotal,
        faturamentoBruto,
        percDespesaFrete,
        txOcupacaoMedia,
        custoMedioKg,
      },
      graficoPorFretista: tabelaResumo.slice(0, 10).map(t => ({
        fretista: t.fretista,
        valor: t.valorTotal,
      })),
      graficoPorRota,
      top5Piores,
      top5Melhores,
      tabelaResumo,
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
