const DEFAULT_BACKEND_URL = 'http://127.0.0.1:5001';

export function getBackendUrl() {
  return process.env.NEXT_PUBLIC_BACKEND_URL || DEFAULT_BACKEND_URL;
}

export async function proxyBackend(path: string, init?: RequestInit) {
  const response = await fetch(`${getBackendUrl()}${path}`, {
    cache: 'no-store',
    ...init
  });

  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    return { response, data: await response.json() };
  }

  return { response, data: await response.text() };
}