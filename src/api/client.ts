import { JsonOK, fetchJson } from '@/fetch';

import { authStore } from './auth';
import { Resort, loadResort } from './resort';

export class InvalidOrigin extends Error {
  name = 'InvalidOrigin';
}

export class RequestError extends Error {
  name = 'RequestError';

  constructor(
    public response: Awaited<ReturnType<typeof fetchJson>>,
    message = 'Request failed'
  ) {
    super(`${message}: ${JSON.stringify(response)}`);
  }
}

export abstract class ApiClient {
  protected resort: Resort;
  protected origin: string;

  protected static origins = {
    WDW: 'https://disneyworld.disney.go.com',
    DLR: 'https://disneyland.disney.go.com',
  };

  static async originToResort(origin: string): Promise<Resort> {
    const entries = Object.entries(this.origins) as [Resort['id'], string][];
    const id = entries.find(([, o]) => o === origin)?.[0];
    if (id) return loadResort(id);
    throw new InvalidOrigin(origin);
  }

  constructor(resort: Resort) {
    this.resort = resort;
    this.origin = (this.constructor as typeof ApiClient).origins[
      this.resort.id
    ];
  }

  protected async request<T = any>(request: {
    path: string;
    method?: 'GET' | 'POST' | 'DELETE';
    params?: { [key: string]: string };
    data?: unknown;
    key?: string;
    ignoreUnauth?: boolean;
  }): Promise<JsonOK<T>> {
    const { swid, accessToken } = authStore.getData();
    const url = this.origin + request.path;
    const res = await fetchJson(url, {
      method: request.method,
      params: request.params,
      data: request.data,
      headers: {
        'Accept-Language': 'en-US',
        Authorization: `BEARER ${accessToken}`,
        'x-user-id': swid,
      },
    });
    if (res.status === 401 && !request.ignoreUnauth) {
      setTimeout(() => authStore.deleteData());
    } else {
      const { key } = request;
      if (res.ok && (!key || res.data[key])) {
        return { ...res, data: key ? res.data[key] : res.data };
      }
    }
    throw new RequestError(res);
  }
}
