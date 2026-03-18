import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { registrarLogAtividade } from '@/lib/log-atividade';

export async function PUT(request: NextRequest) {
  try {
    const { id, status_validacao, validado_por_usuario, validado_por_tipo, status_atual } = await request.json();

    if (!id || !status_validacao || !validado_por_usuario || !validado_por_tipo) {
      return NextResponse.json(
        { error: 'Dados obrigatórios faltando' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Buscar dados anteriores para o log
    const { data: dadosAnteriores } = await supabase
      .from('dados_fretes')
      .select('status_validacao, validado_por_usuario, status_frete, id_carga')
      .eq('id', id)
      .single();

    const updateData: any = {
      status_validacao,
      validado_por_usuario,
      validado_por_tipo,
      updated_at: new Date().toISOString(),
    };

    // Se está validando, adicionar data de validação
    if (status_validacao === 'Validado e Autorizado') {
      updateData.data_validacao = new Date().toISOString();
      
      // Se o status atual é uma divergência, marcar como "Justificado"
      if (status_atual && status_atual !== 'Conforme Tabela') {
        updateData.status_frete = 'Justificado';
      }
    } else {
      // Se está removendo validação, limpar data e status_frete
      updateData.data_validacao = null;
      updateData.status_frete = null;
    }

    const { error } = await supabase
      .from('dados_fretes')
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.error('Erro ao atualizar status:', error);
      return NextResponse.json(
        { error: 'Erro ao atualizar status' },
        { status: 500 }
      );
    }

    // Registrar log de atividade
    await registrarLogAtividade({
      acao: status_validacao === 'Validado e Autorizado' ? 'AUTORIZAR_FRETE' : 'DESAUTORIZAR_FRETE',
      tabela: 'dados_fretes',
      registroId: id,
      detalhes: {
        id_carga: dadosAnteriores?.id_carga,
        status_validacao_anterior: dadosAnteriores?.status_validacao || null,
        status_validacao_novo: status_validacao,
        validado_por_usuario_anterior: dadosAnteriores?.validado_por_usuario || null,
        validado_por_usuario_novo: validado_por_usuario,
        validado_por_tipo,
        status_frete_anterior: dadosAnteriores?.status_frete || null,
        status_frete_novo: updateData.status_frete || null,
        status_atual,
      },
      usuarioEmail: validado_por_usuario,
      tipoUsuario: validado_por_tipo,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
