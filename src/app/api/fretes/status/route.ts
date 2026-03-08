import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function PUT(request: NextRequest) {
  try {
    const { id, status_validacao, validado_por_usuario, validado_por_tipo } = await request.json();

    if (!id || !status_validacao || !validado_por_usuario || !validado_por_tipo) {
      return NextResponse.json(
        { error: 'Dados obrigatórios faltando' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    const updateData: any = {
      status_validacao,
      validado_por_usuario,
      validado_por_tipo,
      updated_at: new Date().toISOString(),
    };

    // Se está validando, adicionar data de validação
    if (status_validacao === 'Validado e Autorizado') {
      updateData.data_validacao = new Date().toISOString();
    } else {
      // Se está removendo validação, limpar data
      updateData.data_validacao = null;
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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
