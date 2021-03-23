export interface JsonResponse {
  status: number;
  data: any;
}

export async function fetchJson(
  url: string,
  init: RequestInit = {}
): Promise<JsonResponse> {
  const response = await fetch(url, init);
  return {
    status: response.status,
    data: await response.json(),
  };
}
