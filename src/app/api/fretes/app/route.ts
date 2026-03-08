import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// POST - Import App Fretes data
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

    // Clear existing Cargas data
    await supabase.from('dados_fretes').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // Insert new records
    let inserted = 0;
    for (const record of records) {
      try {
        const { error } = await supabase
          .from('dados_fretes')
          .insert({
            id_carga: record.idCarga,
            data: record.data,
            fretista: record.fretista,
            rota: record.rota,
            valor_app: record.valorApp,
            placa: record.placa || null,
            tipo: record.tipo || null,
            status: record.status || null,
          });
        
        if (!error) inserted++;
      } catch {
        // Skip duplicates
      }
    }

    // Create upload session record
    await supabase.from('divergencias').insert({
      tipo: 'APP',
      file_name: 'app-upload',
      records_count: inserted,
      status: 'COMPLETED',
    });

    return NextResponse.json({
      success: true,
      inserted,
      total: records.length,
    });
  } catch (error) {
    console.error('Error importing App data:', error);
    return NextResponse.json(
      { error: 'Failed to import App data' },
      { status: 500 }
    );
  }
}

// GET - Get all Cargas data
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('dados_fretes')
      .select(`
        *,
        dados_bi (*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching Cargas data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Cargas data' },
      { status: 500 }
    );
  }
}
