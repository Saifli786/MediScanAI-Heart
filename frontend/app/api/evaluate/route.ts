import { NextResponse } from 'next/server';
import { proxyBackend } from '@/lib/backend';

export async function GET() {
  const { response, data } = await proxyBackend('/evaluate');
  return NextResponse.json(data, { status: response.status });
}