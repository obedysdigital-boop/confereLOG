import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

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

    const { data, error } = await supabase
      .from('dados_fretes')
      .update({ justificativa })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

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
