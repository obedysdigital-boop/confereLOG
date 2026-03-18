import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

// GET - Listar todos os usuários
export async function GET() {
  try {
    const { data: usuarios, error } = await supabase
      .from('usuarios')
      .select('id, usuario, tipo, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      usuarios: usuarios || [],
    });
  } catch (error) {
    console.error('Error fetching usuarios:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar usuários' },
      { status: 500 }
    );
  }
}

// POST - Criar novo usuário
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, senha, tipo } = body;

    if (!email || !senha) {
      return NextResponse.json(
        { success: false, error: 'Usuário e senha são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se o usuário já existe
    const { data: existingUser } = await supabase
      .from('usuarios')
      .select('id')
      .eq('usuario', email)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Usuário já cadastrado' },
        { status: 400 }
      );
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(senha, 10);

    // Inserir usuário
    const { data, error } = await supabase
      .from('usuarios')
      .insert([
        {
          usuario: email,
          senha: hashedPassword,
          tipo: tipo || 'usuario',
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      usuario: {
        id: data.id,
        usuario: data.usuario,
        tipo: data.tipo,
        created_at: data.created_at,
      },
    });
  } catch (error) {
    console.error('Error creating usuario:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao criar usuário' },
      { status: 500 }
    );
  }
}

// PUT - Atualizar usuário
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID do usuário é obrigatório' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { email, senha, tipo } = body;

    const updateData: any = {};

    if (email) updateData.usuario = email;
    if (tipo) updateData.tipo = tipo;
    if (senha) {
      updateData.senha = await bcrypt.hash(senha, 10);
    }

    const { data, error } = await supabase
      .from('usuarios')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      usuario: {
        id: data.id,
        usuario: data.usuario,
        tipo: data.tipo,
        created_at: data.created_at,
      },
    });
  } catch (error) {
    console.error('Error updating usuario:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao atualizar usuário' },
      { status: 500 }
    );
  }
}

// DELETE - Excluir usuário
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID do usuário é obrigatório' },
        { status: 400 }
      );
    }

    const { error } = await supabase.from('usuarios').delete().eq('id', id);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Usuário excluído com sucesso',
    });
  } catch (error) {
    console.error('Error deleting usuario:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao excluir usuário' },
      { status: 500 }
    );
  }
}
