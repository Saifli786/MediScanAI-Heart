import { NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/backend';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  if (!id) {
    return NextResponse.json({ error: 'Missing prediction ID' }, { status: 400 });
  }

  try {
    const backendUrl = getBackendUrl();
    const res = await fetch(`${backendUrl}/download_pdf/${id}`, {
      cache: 'no-store'
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch PDF report from backend' }, { status: res.status });
    }

    const pdfBuffer = await res.arrayBuffer();

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=mediscan_report_${id}.pdf`
      }
    });
  } catch (error) {
    return NextResponse.json({ error: `Server error: ${String(error)}` }, { status: 500 });
  }
}
