import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET - Listar todas as quinzenas
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('quinzenas')
      .select('*')
      .order('ano', { ascending: false })
      .order('mes', { ascending: false })
      .order('quinzena', { ascending: false });

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching quinzenas:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quinzenas' },
      { status: 500 }
    );
  }
}

// POST - Criar ou atualizar quinzena
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { quinzena, mes, ano } = body;

    if (!quinzena || !mes || !ano) {
      return NextResponse.json(
        { error: 'Quinzena, mês e ano são obrigatórios' },
        { status: 400 }
      );
    }

    // Validar quinzena (1 ou 2)
    if (quinzena !== 1 && quinzena !== 2) {
      return NextResponse.json(
        { error: 'Quinzena deve ser 1 ou 2' },
        { status: 400 }
      );
    }

    // Validar mês (1-12)
    if (mes < 1 || mes > 12) {
      return NextResponse.json(
        { error: 'Mês deve estar entre 1 e 12' },
        { status: 400 }
      );
    }

    // Criar id_quinzenal
    const meses = [
      'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
      'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
    ];
    const mesNome = meses[mes - 1];
    const id_quinzenal = `${quinzena}q_${mesNome}_${ano}`;
    const descricao = `${quinzena}ª quinzena de ${mesNome} ${ano}`;

    // Verificar se já existe
    const { data: existing } = await supabase
      .from('quinzenas')
      .select('*')
      .eq('id_quinzenal', id_quinzenal)
      .maybeSingle();

    if (existing) {
      // Já existe, retornar
      return NextResponse.json({
        quinzena: existing,
        exists: true,
      });
    }

    // Criar nova quinzena
    const { data, error } = await supabase
      .from('quinzenas')
      .insert({
        id_quinzenal,
        descricao,
        mes,
        ano,
        quinzena,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      quinzena: data,
      exists: false,
    });
  } catch (error) {
    console.error('Error creating quinzena:', error);
    return NextResponse.json(
      { error: 'Failed to create quinzena' },
      { status: 500 }
    );
  }
}
