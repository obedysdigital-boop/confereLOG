import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Buscar todos os dados
    const { data: cargas, error: cargasError } = await supabase
      .from('dados_fretes')
      .select('*');

    if (cargasError) throw cargasError;

    const { data: dadosBI, error: biError } = await supabase
      .from('dados_bi')
      .select('*');

    if (biError) throw biError;

    // Criar mapa de valores BI
    const biMap = new Map<string, number>();
    for (const bi of dadosBI || []) {
      if (!biMap.has(bi.id_carga)) {
        biMap.set(bi.id_carga, bi.valor_bi);
      }
    }

    // Calcular métricas
    let qtdCargas = 0;
    let valorCargas = 0;
    let qtdDivergencias = 0;
    let valorDivergencias = 0;
    let qtdJustificadas = 0;
    let valorJustificadas = 0;
    let qtdAutorizadas = 0;
    let valorAutorizadas = 0;
    let qtdSemDadosBI = 0;
    let valorSemDadosBI = 0;
    let qtdDivergeTabela = 0;
    let valorDivergeTabela = 0;
    let qtdSemValorTabela = 0;
    let valorSemValorTabela = 0;
    let vlrTotalApp = 0;
    let vlrTotalBI = 0;
    let vlrTotalDivergencia = 0;

    for (const carga of cargas || []) {
      const valorBI = biMap.get(carga.id_carga) || null;
      const valorApp = carga.valor_app || 0;

      qtdCargas++;
      valorCargas += valorApp;
      vlrTotalApp += valorApp;
      
      if (valorBI) {
        vlrTotalBI += valorBI;
        const divergencia = Math.abs(valorBI - valorApp);
        vlrTotalDivergencia += divergencia;
      }

      // Sem dados BI
      if (!valorBI) {
        qtdSemDadosBI++;
        valorSemDadosBI += valorApp;
      }

      // Divergências (não justificadas)
      if (carga.status_frete !== 'Justificado') {
        if (valorBI && Math.abs(valorBI - valorApp) > 0.01) {
          qtdDivergencias++;
          valorDivergencias += valorApp;
        }
      }

      // Justificadas
      if (carga.status_frete === 'Justificado') {
        qtdJustificadas++;
        valorJustificadas += valorApp;
      }

      // Autorizadas
      if (carga.status_validacao === 'Validado e Autorizado') {
        qtdAutorizadas++;
        valorAutorizadas += valorApp;
      }

      // Diverge tabela (simplificado - você pode melhorar com a lógica real)
      if (valorBI && Math.abs(valorBI - valorApp) > 0.01) {
        qtdDivergeTabela++;
        valorDivergeTabela += valorApp;
      }

      // Sem valor tabela (simplificado)
      if (!valorBI) {
        qtdSemValorTabela++;
        valorSemValorTabela += valorApp;
      }
    }

    return NextResponse.json({
      success: true,
      metricas: {
        qtdCargas,
        valorCargas,
        qtdDivergencias,
        valorDivergencias,
        qtdJustificadas,
        valorJustificadas,
        qtdAutorizadas,
        valorAutorizadas,
        qtdSemDadosBI,
        valorSemDadosBI,
        qtdDivergeTabela,
        valorDivergeTabela,
        qtdSemValorTabela,
        valorSemValorTabela,
        vlrTotalApp,
        vlrTotalBI,
        vlrTotalDivergencia,
      },
    });
  } catch (error) {
    console.error('Error fetching metricas:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metricas' },
      { status: 500 }
    );
  }
}
