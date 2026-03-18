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

    const { data: tabelaFretes, error: tabelaError } = await supabase
      .from('tabela_fretes')
      .select('*');

    if (tabelaError) throw tabelaError;

    // Criar mapa de valores BI
    const biMap = new Map<string, number>();
    for (const bi of dadosBI || []) {
      if (!biMap.has(bi.id_carga)) {
        biMap.set(bi.id_carga, bi.valor_bi);
      }
    }

    // Criar mapa de valores da tabela
    const tabelaMap = new Map<string, number>();
    for (const tabela of tabelaFretes || []) {
      const key = `${tabela.rota}|${tabela.tipo_veiculo || ''}`;
      if (!tabelaMap.has(key)) {
        tabelaMap.set(key, tabela.valor_tabela);
      }
    }

    // Calcular métricas
    let qtdCargas = 0;
    let valorCargas = 0;
    let qtdDivergencias = 0;
    let valorDivergencias = 0; // Soma das divergências (diferença entre valores)
    let qtdJustificadas = 0;
    let valorJustificadas = 0; // Soma das divergências justificadas
    let qtdAutorizadas = 0;
    let valorAutorizadas = 0; // Soma do valor APP das autorizadas
    let qtdSemDadosBI = 0;
    let valorSemDadosBI = 0; // Soma das divergências sem dados BI
    let qtdDivergeTabela = 0;
    let valorDivergeTabela = 0; // Soma das divergências com tabela
    let qtdSemValorTabela = 0;
    let valorSemValorTabela = 0;
    let vlrTotalApp = 0;
    let vlrTotalBI = 0;
    let vlrTotalDivergencia = 0;

    for (const carga of cargas || []) {
      const valorBI = biMap.get(carga.id_carga) || null;
      const valorApp = carga.valor_app || 0;
      
      // Buscar valor da tabela
      const tabelaKey = `${carga.rota}|${carga.tipo || ''}`;
      const valorTabela = tabelaMap.get(tabelaKey) || null;

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
        const divergenciaApp = valorTabela ? Math.abs(valorApp - valorTabela) : valorApp;
        valorSemDadosBI += divergenciaApp;
      }

      // Divergências (status = "Diverge da Tabela" e não justificadas)
      if (carga.status_frete !== 'Justificado') {
        if (valorBI && Math.abs(valorBI - valorApp) > 0.01) {
          qtdDivergencias++;
          // Calcular divergência: pode ser APP x BI ou APP x Tabela
          const divergenciaBI = Math.abs(valorBI - valorApp);
          const divergenciaTabela = valorTabela ? Math.abs(valorApp - valorTabela) : 0;
          valorDivergencias += Math.max(divergenciaBI, divergenciaTabela);
        }
      }

      // Justificadas (status_frete = "Justificado")
      if (carga.status_frete === 'Justificado') {
        qtdJustificadas++;
        // Calcular divergência justificada
        const divergenciaBI = valorBI ? Math.abs(valorBI - valorApp) : 0;
        const divergenciaTabela = valorTabela ? Math.abs(valorApp - valorTabela) : 0;
        valorJustificadas += Math.max(divergenciaBI, divergenciaTabela);
      }

      // Autorizadas (status_validacao = "Validado e Autorizado")
      if (carga.status_validacao === 'Validado e Autorizado') {
        qtdAutorizadas++;
        valorAutorizadas += valorApp; // Valor total APP das autorizadas
      }

      // Diverge tabela
      if (valorTabela && Math.abs(valorApp - valorTabela) > 0.01) {
        qtdDivergeTabela++;
        valorDivergeTabela += Math.abs(valorApp - valorTabela);
      }

      // Sem valor tabela
      if (!valorTabela) {
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
