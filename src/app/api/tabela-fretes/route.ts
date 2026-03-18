import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET - Listar todos os fretes da tabela
export async function GET() {
  try {
    const { data: fretes, error } = await supabase
      .from('tabela_fretes')
      .select('id, rota, tipo_veiculo, km, valor_tabela, created_at, updated_at')
      .order('rota', { ascending: true });

    if (error) throw error;

    // Mapear valor_tabela para valor
    const fretesFormatados = (fretes || []).map(frete => ({
      ...frete,
      valor: frete.valor_tabela,
    }));

    return NextResponse.json({
      success: true,
      fretes: fretesFormatados,
    });
  } catch (error) {
    console.error('Error fetching tabela fretes:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar tabela de fretes' },
      { status: 500 }
    );
  }
}

// POST - Criar novo frete na tabela
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { rota, tipo_veiculo, km, valor } = body;

    if (!rota || !tipo_veiculo || valor === undefined || valor === null) {
      return NextResponse.json(
        { success: false, error: 'Rota, tipo de veículo e valor são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se a rota + tipo_veiculo já existe
    const { data: existingFrete } = await supabase
      .from('tabela_fretes')
      .select('id')
      .eq('rota', rota)
      .eq('tipo_veiculo', tipo_veiculo)
      .single();

    if (existingFrete) {
      return NextResponse.json(
        { success: false, error: 'Rota com este tipo de veículo já cadastrada' },
        { status: 400 }
      );
    }

    // Inserir frete
    const { data, error } = await supabase
      .from('tabela_fretes')
      .insert([
        {
          rota,
          tipo_veiculo,
          km: km ? parseInt(km) : null,
          valor_tabela: parseFloat(valor),
        },
      ])
      .select()
      .single();

    if (error) throw error;

    // Mapear valor_tabela para valor
    const freteFormatado = {
      ...data,
      valor: data.valor_tabela,
    };

    return NextResponse.json({
      success: true,
      frete: freteFormatado,
    });
  } catch (error) {
    console.error('Error creating frete:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao criar frete' },
      { status: 500 }
    );
  }
}

// PUT - Atualizar frete
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID do frete é obrigatório' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { rota, tipo_veiculo, km, valor } = body;

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (rota) updateData.rota = rota;
    if (tipo_veiculo) updateData.tipo_veiculo = tipo_veiculo;
    if (km !== undefined) {
      updateData.km = km ? parseInt(km) : null;
    }
    if (valor !== undefined && valor !== null) {
      updateData.valor_tabela = parseFloat(valor);
    }

    const { data, error } = await supabase
      .from('tabela_fretes')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Mapear valor_tabela para valor
    const freteFormatado = {
      ...data,
      valor: data.valor_tabela,
    };

    return NextResponse.json({
      success: true,
      frete: freteFormatado,
    });
  } catch (error) {
    console.error('Error updating frete:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao atualizar frete' },
      { status: 500 }
    );
  }
}

// DELETE - Excluir frete
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID do frete é obrigatório' },
        { status: 400 }
      );
    }

    const { error } = await supabase.from('tabela_fretes').delete().eq('id', id);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Frete excluído com sucesso',
    });
  } catch (error) {
    console.error('Error deleting frete:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao excluir frete' },
      { status: 500 }
    );
  }
}
