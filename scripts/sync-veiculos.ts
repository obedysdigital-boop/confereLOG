import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';

const prisma = new PrismaClient();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function syncVeiculos() {
  try {
    console.log('Buscando veículos do SQLite...');
    const veiculos = await prisma.veiculo.findMany();
    console.log(`Encontrados ${veiculos.length} veículos no SQLite`);

    if (veiculos.length === 0) {
      console.log('Nenhum veículo para sincronizar');
      return;
    }

    console.log('\nVeículos encontrados:');
    veiculos.forEach(v => {
      console.log(`- ${v.fretista}: ${v.placa} (${v.tipo})`);
    });

    // Limpar tabela do Supabase
    console.log('\nLimpando tabela veiculos no Supabase...');
    const { error: deleteError } = await supabase
      .from('veiculos')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (deleteError) {
      console.error('Erro ao limpar tabela:', deleteError);
    }

    // Inserir veículos no Supabase
    console.log('Inserindo veículos no Supabase...');
    const veiculosToInsert = veiculos.map(v => ({
      fretista: v.fretista,
      placa: v.placa,
      tipo: v.tipo,
    }));

    const { data, error } = await supabase
      .from('veiculos')
      .insert(veiculosToInsert)
      .select();

    if (error) {
      console.error('Erro ao inserir veículos:', error);
      throw error;
    }

    console.log(`\n✅ ${data?.length || 0} veículos sincronizados com sucesso!`);
  } catch (error) {
    console.error('Erro na sincronização:', error);
  } finally {
    await prisma.$disconnect();
  }
}

syncVeiculos();
