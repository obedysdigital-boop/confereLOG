import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rota = searchParams.get('rota');

    if (!rota) {
      return NextResponse.json(
        { error: 'Rota é obrigatória' },
        { status: 400 }
      );
    }

    // Buscar justificativas anteriores da mesma rota
    // Ordenar por data de atualização mais recente
    // Pegar apenas justificativas não vazias
    const { data, error } = await supabase
      .from('dados_fretes')
      .select('justificativa, updated_at')
      .eq('rota', rota)
      .not('justificativa', 'is', null)
      .neq('justificativa', '')
      .order('updated_at', { ascending: false })
      .limit(5);

    if (error) throw error;

    // Remover duplicatas e retornar apenas as justificativas únicas
    const justificativasUnicas = Array.from(
      new Set(data?.map(item => item.justificativa) || [])
    );

    return NextResponse.json({
      success: true,
      justificativas: justificativasUnicas,
    });
  } catch (error) {
    console.error('Erro ao buscar justificativas anteriores:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar justificativas anteriores' },
      { status: 500 }
    );
  }
}
