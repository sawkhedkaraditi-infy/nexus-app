// Small fetch wrapper for the browser. Throws an Error with the API's message on failure.
export async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...((init?.headers as Record<string, string> | undefined) ?? {}) },
    cache: 'no-store',
  });
  const data = (await res.json().catch(() => ({}))) as { error?: string };
  if (!res.ok) {
    if (res.status === 401 && typeof window !== 'undefined') window.location.href = '/login';
    throw new Error(data.error ?? 'Something went wrong');
  }
  return data as T;
}
