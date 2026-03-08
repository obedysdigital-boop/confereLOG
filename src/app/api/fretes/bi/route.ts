import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// POST - Import BI data
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

    // Clear existing BI data
    await supabase.from('dados_bi').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // Insert new records
    let inserted = 0;
    for (const record of records) {
      try {
        const { error } = await supabase
          .from('dados_bi')
          .insert({
            id_carga: record.idCarga,
            valor_bi: record.valorBI,
          });
        
        if (!error) inserted++;
      } catch {
        // Skip duplicates
      }
    }

    // Create upload session record
    await supabase.from('divergencias').insert({
      tipo: 'BI',
      file_name: 'bi-upload',
      records_count: inserted,
      status: 'COMPLETED',
    });

    return NextResponse.json({
      success: true,
      inserted,
      total: records.length,
    });
  } catch (error) {
    console.error('Error importing BI data:', error);
    return NextResponse.json(
      { error: 'Failed to import BI data' },
      { status: 500 }
    );
  }
}

// GET - Get all BI data
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('dados_bi')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching BI data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch BI data' },
      { status: 500 }
    );
  }
}
