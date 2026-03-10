import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    
    return NextResponse.json({ 
      message: 'Upload test route works!',
      hasFile: !!file,
      fileName: file ? (file as File).name : null,
    });
  } catch (error) {
    return NextResponse.json({ 
      error: 'Test failed',
      details: String(error),
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Upload test GET works!',
    timestamp: new Date().toISOString(),
  });
}
