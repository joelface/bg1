export interface JsonResponse {
  status: number;
  data: any;
}

const DEFAULT_TIMEOUT_MS = 8000;

export async function fetchJson(
  url: string,
  init: RequestInit & {
    params?: { [key: string]: string | number };
    data?: unknown;
    timeout?: number;
  } = {}
): Promise<JsonResponse> {
  const { params, data, timeout = DEFAULT_TIMEOUT_MS, ...fetchInit } = init;
  init = fetchInit;
  if (params) {
    url +=
      '?' +
      Object.entries(params)
        .filter(([, v]) => v !== '')
        .map(kv => kv.map(encodeURIComponent).join('='))
        .join('&');
  }
  if (data) {
    init.method ||= 'POST';
    init.headers = {
      ...(init.headers || {}),
      'Content-Type': 'application/json',
    };
    init.body = JSON.stringify(data);
  }
  const controller = new AbortController();
  init.signal = controller.signal;
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  let response: Response;
  try {
    response = await fetch(url, init);
  } catch (error) {
    console.error(error);
    return { status: 0, data: null };
  } finally {
    clearTimeout(timeoutId);
  }
  return {
    status: response.status,
    data: (response.headers.get('Content-Type') || '').startsWith(
      'application/json'
    )
      ? await response.json()
      : {},
  };
}
