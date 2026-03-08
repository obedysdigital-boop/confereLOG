import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { usuario, senha } = await request.json();

    if (!usuario || !senha) {
      return NextResponse.json(
        { error: 'Usuário e senha são obrigatórios' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Buscar usuário
    const { data: users, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('usuario', usuario)
      .eq('ativo', true)
      .limit(1);

    if (error) {
      console.error('Erro ao buscar usuário:', error);
      return NextResponse.json(
        { error: 'Erro ao buscar usuário' },
        { status: 500 }
      );
    }

    if (!users || users.length === 0) {
      return NextResponse.json(
        { error: 'Usuário ou senha inválidos' },
        { status: 401 }
      );
    }

    const user = users[0];

    // Verificar senha (em produção, use bcrypt ou similar)
    if (user.senha !== senha) {
      return NextResponse.json(
        { error: 'Usuário ou senha inválidos' },
        { status: 401 }
      );
    }

    // Retornar dados do usuário (sem a senha)
    const { senha: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Erro no login:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
