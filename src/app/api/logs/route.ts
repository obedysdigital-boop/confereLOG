import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { usuario_id, usuario, tipo_usuario, acao, tabela, registro_id, detalhes } = await request.json();

    if (!usuario || !tipo_usuario || !acao) {
      return NextResponse.json(
        { error: 'Dados obrigatórios faltando' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    const { error } = await supabase
      .from('logs_atividades')
      .insert({
        usuario_id,
        usuario,
        tipo_usuario,
        acao,
        tabela,
        registro_id,
        detalhes,
      });

    if (error) {
      console.error('Erro ao registrar log:', error);
      return NextResponse.json(
        { error: 'Erro ao registrar log' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao registrar log:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || '100';

    const { data, error } = await supabase
      .from('logs_atividades')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(parseInt(limit));

    if (error) {
      console.error('Erro ao buscar logs:', error);
      return NextResponse.json(
        { error: 'Erro ao buscar logs' },
        { status: 500 }
      );
    }

    return NextResponse.json({ logs: data });
  } catch (error) {
    console.error('Erro ao buscar logs:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
