import { NextResponse } from 'next/server';
import { proxyBackend } from '@/lib/backend';

export async function GET() {
  const { response, data } = await proxyBackend('/get_predictions');
  return NextResponse.json(data, { status: response.status });
}