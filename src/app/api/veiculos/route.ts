import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET - Get all vehicles
export async function GET() {
  try {
    const { data: veiculos, error } = await supabase
      .from('veiculos')
      .select('*')
      .order('fretista', { ascending: true });

    if (error) throw error;
    return NextResponse.json(veiculos);
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vehicles' },
      { status: 500 }
    );
  }
}

// POST - Seed vehicles
export async function POST(request: NextRequest) {
  try {
    const vehicles = [
      { fretista: 'Danilo', placa: 'QKY0D59', tipo: 'Delivery' },
      { fretista: 'Jancleiton', placa: 'LRC7H40', tipo: 'Delivery' },
      { fretista: 'Anderson', placa: 'BRY9A41', tipo: 'Delivery' },
      { fretista: 'Natal', placa: 'OSF8808', tipo: 'Bongo' },
      { fretista: 'Eden', placa: 'JOP0J97', tipo: '3/4' },
      { fretista: 'Andre', placa: 'LST7H05', tipo: '3/4' },
      { fretista: 'Roque', placa: 'PJN1652', tipo: '3/4' },
      { fretista: 'Tiago', placa: 'OES3C15', tipo: '3/4' },
      { fretista: 'Elipaju', placa: 'JPX8747', tipo: '3/4' },
      { fretista: 'Renato', placa: 'NZY7881', tipo: 'Toco' },
      { fretista: 'Elipaju', placa: 'NVM5109', tipo: '3/4' },
      { fretista: 'Elipaju', placa: 'ORI2G75', tipo: '3/4' },
      { fretista: 'Elipaju', placa: 'DVA3G04', tipo: 'Toco' },
      { fretista: 'Elipaju', placa: 'IAD5528', tipo: 'Toco' },
      { fretista: 'Elipaju', placa: 'PST5A22', tipo: 'Toco' },
      { fretista: 'Renato', placa: 'NYL1B84', tipo: 'Toco' },
      { fretista: 'Elipaju', placa: 'PEY9D15', tipo: '3/4' },
      { fretista: 'Josenilson', placa: 'PLK2C22', tipo: 'Bongo' },
      { fretista: 'Renato', placa: 'OKV2567', tipo: 'Toco' },
    ];

    // Clear existing
    await supabase.from('veiculos').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    // Insert new
    const { data, error } = await supabase
      .from('veiculos')
      .insert(vehicles)
      .select();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      inserted: data?.length || 0,
    });
  } catch (error) {
    console.error('Error seeding vehicles:', error);
    return NextResponse.json(
      { error: 'Failed to seed vehicles' },
      { status: 500 }
    );
  }
}
