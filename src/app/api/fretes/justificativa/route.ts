import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { registrarLogAtividade } from '@/lib/log-atividade';

// PATCH - Atualizar justificativa de um registro específico
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, justificativa } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID do registro é obrigatório' },
        { status: 400 }
      );
    }

    // Obter usuário autenticado
    const supabaseServer = createClient();
    const { data: { user } } = await supabaseServer.auth.getUser();
    const userEmail = user?.email || 'sistema';

    // Buscar dados anteriores para o log
    const { data: dadosAnteriores } = await supabase
      .from('dados_fretes')
      .select('justificativa, status_frete, id_carga')
      .eq('id', id)
      .single();

    const { data, error } = await supabase
      .from('dados_fretes')
      .update({ 
        justificativa,
        status_frete: 'Justificado',
        justificado_por_usuario: userEmail,
        data_justificativa: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Registrar log de atividade
    await registrarLogAtividade({
      acao: dadosAnteriores?.justificativa ? 'ATUALIZAR_JUSTIFICATIVA' : 'ADICIONAR_JUSTIFICATIVA',
      tabela: 'dados_fretes',
      registroId: id,
      detalhes: {
        id_carga: dadosAnteriores?.id_carga || data.id_carga,
        justificativa_anterior: dadosAnteriores?.justificativa || null,
        justificativa_nova: justificativa,
        status_frete_anterior: dadosAnteriores?.status_frete || null,
        status_frete_novo: 'Justificado',
      },
      usuarioEmail: userEmail,
    });

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Error updating justificativa:', error);
    return NextResponse.json(
      { error: 'Failed to update justificativa' },
      { status: 500 }
    );
  }
}
