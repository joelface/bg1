import { dateTimeStrings } from '@/datetime';
import kvdb from '@/kvdb';

import { AuthData } from './client';

export const AUTH_KEY = ['bg1', 'auth'];

export class ReauthNeeded extends Error {
  name = 'ReauthNeeded';

  constructor() {
    super(`Auth data missing or expired`);
  }
}

export class AuthStore {
  onUnauthorized: () => void = () => undefined;

  getData(): Pick<AuthData, 'swid' | 'accessToken'> {
    try {
      const data = kvdb.get<AuthData>(AUTH_KEY);
      if (data) {
        const { swid, accessToken, expires } = data;
        const exp = dateTimeStrings(expires);
        const now = dateTimeStrings();
        if (
          exp.date > now.date ||
          (exp.date === now.date && exp.time > now.time && exp.time >= '17')
        ) {
          return { swid, accessToken };
        }
      }
    } catch (error) {
      console.error(error);
    }
    this.deleteData();
    throw new ReauthNeeded();
  }

  setData(data: AuthData): void {
    kvdb.set<AuthData>(AUTH_KEY, data);
  }

  deleteData(): void {
    kvdb.delete(AUTH_KEY);
    setTimeout(this.onUnauthorized);
  }
}
