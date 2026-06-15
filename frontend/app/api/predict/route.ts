import { NextResponse } from 'next/server';
import { proxyBackend } from '@/lib/backend';

export async function POST(request: Request) {
  const formData = await request.formData();
  const payload = new URLSearchParams();

  for (const [key, value] of formData.entries()) {
    payload.set(key, String(value));
  }

  const { response, data } = await proxyBackend('/predict', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: payload.toString()
  });

  return NextResponse.json(data, { status: response.status });
}