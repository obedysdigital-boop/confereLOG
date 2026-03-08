import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// POST - Import Tabela de Fretes data
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { records } = body;

    if (!records || !Array.isArray(records)) {
      return NextResponse.json(
        { error: 'Records array is required' },
        { status: 400 }
      );
    }

    // Clear existing Tabela de Fretes data
    await supabase.from('tabela_fretes').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // Insert new records
    let inserted = 0;
    for (const record of records) {
      try {
        const { error } = await supabase
          .from('tabela_fretes')
          .insert({
            rota: record.rota,
            tipo_veiculo: record.tipoVeiculo,
            valor_tabela: record.valorTabela,
            km: record.km || null,
            custo_km: record.custoKm || null,
          });
        
        if (!error) inserted++;
      } catch {
        // Skip duplicates
      }
    }

    // Create upload session record
    await supabase.from('divergencias').insert({
      tipo: 'TABELA',
      file_name: 'tabela-upload',
      records_count: inserted,
      status: 'COMPLETED',
    });

    return NextResponse.json({
      success: true,
      inserted,
      total: records.length,
    });
  } catch (error) {
    console.error('Error importing Tabela data:', error);
    return NextResponse.json(
      { error: 'Failed to import Tabela data' },
      { status: 500 }
    );
  }
}

// GET - Get all Tabela de Fretes data
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('tabela_fretes')
      .select('*')
      .order('rota', { ascending: true })
      .order('tipo_veiculo', { ascending: true });

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching Tabela data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Tabela data' },
      { status: 500 }
    );
  }
}
