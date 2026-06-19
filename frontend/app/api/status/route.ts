import { NextResponse } from 'next/server';
import { proxyBackend } from '@/lib/backend';

export const dynamic = 'force-dynamic';

export async function GET() {
  const { response, data } = await proxyBackend('/');
  return NextResponse.json(data, { status: response.status });
}