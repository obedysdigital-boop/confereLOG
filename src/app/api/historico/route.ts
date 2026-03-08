import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('historico_importacoes')
      .select('*')
      .order('data_importacao', { ascending: false })
      .limit(50);

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error fetching historico:', error);
    return NextResponse.json(
      { error: 'Failed to fetch historico' },
      { status: 500 }
    );
  }
}
