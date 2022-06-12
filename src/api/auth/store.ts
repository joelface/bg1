import { dateTimeStrings } from '/datetime';
import { AuthData } from './client';

export class ReauthNeeded extends Error {
  name = 'ReauthNeeded';

  constructor(storageKey: string) {
    super(`Auth data "${storageKey}" missing or expired`);
  }
}

export class AuthStore {
  constructor(
    protected storageKey: string,
    protected storage: Pick<
      Storage,
      'getItem' | 'setItem' | 'removeItem'
    > = localStorage
  ) {}

  getData(): Pick<AuthData, 'swid' | 'accessToken'> {
    try {
      const json = this.storage.getItem(this.storageKey);
      if (json) {
        const { swid, accessToken, expires: expiresStr } = JSON.parse(json);
        const expires = dateTimeStrings(new Date(expiresStr));
        const now = dateTimeStrings();
        if (
          expires.date > now.date ||
          (expires.date === now.date &&
            expires.time > now.time &&
            expires.time >= '17')
        ) {
          return { swid, accessToken };
        }
      }
    } catch (error) {
      console.error(error);
    }
    throw new ReauthNeeded(this.storageKey);
  }

  setData(data: AuthData): void {
    this.storage.setItem(this.storageKey, JSON.stringify(data));
  }

  deleteData(): void {
    this.storage.removeItem(this.storageKey);
  }
}
