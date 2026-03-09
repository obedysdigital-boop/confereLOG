import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  return NextResponse.json({ message: 'Upload test route works!' });
}

export async function GET() {
  return NextResponse.json({ message: 'Upload test GET works!' });
}
