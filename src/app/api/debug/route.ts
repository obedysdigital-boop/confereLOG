import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    message: 'Debug route works',
    env: {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      nodeEnv: process.env.NODE_ENV,
    },
    timestamp: new Date().toISOString(),
  });
}

export const dynamic = 'force-dynamic';
