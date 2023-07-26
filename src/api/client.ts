import { JsonOK, fetchJson } from '@/fetch';

import { AuthStore } from './auth/store';
import { Resort, ResortData } from './data';

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
  protected data: ResortData;
  protected authStore: Public<AuthStore>;
  protected origin: string;

  protected static origins = {
    WDW: 'https://disneyworld.disney.go.com',
    DLR: 'https://disneyland.disney.go.com',
  };

  static originToResort(origin: string): Resort {
    const entries = Object.entries(this.origins) as [Resort, string][];
    const abbr = entries.find(([, o]) => o === origin)?.[0];
    if (abbr) return abbr;
    throw new InvalidOrigin(origin);
  }

  constructor(data: ResortData, authStore: Public<AuthStore>) {
    this.data = data;
    this.origin = (this.constructor as typeof ApiClient).origins[
      this.data.resort
    ];
    this.authStore = authStore;
  }

  logOut() {
    this.authStore.deleteData();
  }

  protected async request<T = any>(request: {
    path: string;
    method?: 'GET' | 'POST' | 'DELETE';
    params?: { [key: string]: string };
    data?: unknown;
    key?: string;
  }): Promise<JsonOK<T>> {
    const { swid, accessToken } = this.authStore.getData();
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
    if (res.status === 401) {
      setTimeout(() => this.authStore.deleteData());
    } else {
      const { key } = request;
      if (res.ok && (!key || res.data[key])) {
        return { ...res, data: key ? res.data[key] : res.data };
      }
    }
    throw new RequestError(res);
  }
}
