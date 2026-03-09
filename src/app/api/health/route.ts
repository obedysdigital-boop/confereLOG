import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function GET() {
  try {
    const checks = {
      timestamp: new Date().toISOString(),
      environment: {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Configurado' : '❌ Não configurado',
        supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Configurado' : '❌ Não configurado',
      },
      database: {
        status: '❌ Não testado',
        error: null as string | null,
      },
    };

    // Testar conexão com Supabase
    try {
      const supabase = createClient();
      const { data, error } = await supabase.from('usuarios').select('count').limit(1);
      
      if (error) {
        checks.database.status = '❌ Erro na conexão';
        checks.database.error = error.message;
      } else {
        checks.database.status = '✅ Conectado';
      }
    } catch (error: any) {
      checks.database.status = '❌ Erro na conexão';
      checks.database.error = error.message;
    }

    return NextResponse.json({
      status: 'ok',
      checks,
      message: 'Health check concluído',
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      error: error.message,
      message: 'Erro ao executar health check',
    }, { status: 500 });
  }
}
