import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { usuario, senha, nome_completo } = await request.json();

    if (!usuario || !senha) {
      return NextResponse.json(
        { error: 'Usuário e senha são obrigatórios' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Verificar se usuário já existe
    const { data: existingUsers } = await supabase
      .from('usuarios')
      .select('id')
      .eq('usuario', usuario)
      .limit(1);

    if (existingUsers && existingUsers.length > 0) {
      return NextResponse.json(
        { error: 'Usuário já existe' },
        { status: 409 }
      );
    }

    // Criar novo usuário (sempre como 'novo')
    const { data: newUser, error } = await supabase
      .from('usuarios')
      .insert({
        usuario,
        senha, // Em produção, use hash (bcrypt)
        nome_completo,
        tipo: 'novo',
        ativo: true,
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar usuário:', error);
      return NextResponse.json(
        { error: 'Erro ao criar usuário' },
        { status: 500 }
      );
    }

    // Retornar dados do usuário (sem a senha)
    const { senha: _, ...userWithoutPassword } = newUser;

    return NextResponse.json({
      user: userWithoutPassword,
      message: 'Usuário criado com sucesso! Aguarde autorização do administrador.',
    });
  } catch (error) {
    console.error('Erro no registro:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
