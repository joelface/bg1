export type JsonOK<T = any> = { ok: true; status: number; data: T };

export type JsonResponse<T = any> =
  | JsonOK<T>
  | { ok: false; status: number; data: any };

const DEFAULT_TIMEOUT_MS = 8000;

export async function fetchJson<T = any>(
  url: string,
  init: RequestInit & {
    params?: { [key: string]: string | number };
    data?: unknown;
    timeout?: number;
  } = {}
): Promise<JsonResponse<T>> {
  const { params, data, timeout = DEFAULT_TIMEOUT_MS, ...fetchInit } = init;
  init = fetchInit;
  init.referrer ||= '';
  init.credentials ||= 'omit';
  init.cache ||= 'no-store';
  init.headers = {
    ...(init.headers || {}),
  };
  if (params && Object.keys(params).length > 0) {
    url +=
      (url.includes('?') ? '&' : '?') +
      Object.entries(params)
        .filter(([, v]) => v !== '')
        .map(kv => kv.map(encodeURIComponent).join('='))
        .join('&');
  }
  if (data) {
    init.method ||= 'POST';
    init.headers = {
      ...init.headers,
      'Content-Type': 'application/json',
    };
    init.body = JSON.stringify(data);
  }
  init.method ||= 'GET';
  const controller = new AbortController();
  init.signal = controller.signal;
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  let response: Response;
  try {
    response = await fetch(url, init);
  } catch (error) {
    console.error(error);
    return { ok: false, status: 0, data: null };
  } finally {
    clearTimeout(timeoutId);
  }
  return {
    ok: response.ok,
    status: response.status,
    data: (response.headers.get('Content-Type') || '').startsWith(
      'application/json'
    )
      ? await response.json()
      : {},
  };
}
