import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();

    const { data: usuarios, error } = await supabase
      .from('usuarios')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar usuários:', error);
      return NextResponse.json(
        { error: 'Erro ao buscar usuários' },
        { status: 500 }
      );
    }

    return NextResponse.json({ usuarios });
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, tipo, ativo } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'ID do usuário é obrigatório' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (tipo !== undefined) {
      updateData.tipo = tipo;
    }

    if (ativo !== undefined) {
      updateData.ativo = ativo;
    }

    const { error } = await supabase
      .from('usuarios')
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.error('Erro ao atualizar usuário:', error);
      return NextResponse.json(
        { error: 'Erro ao atualizar usuário' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
