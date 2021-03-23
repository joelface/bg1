import { dateTimeStrings } from './datetime';

export class TokenStale extends Error {
  name = 'TokenStale';
}

interface Storage {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
}

export class StoredToken {
  constructor(
    protected name: string,
    protected storage: Storage = localStorage
  ) {}

  get(): string {
    const tokenJson = this.storage.getItem(this.name);
    if (tokenJson) {
      const { token, expires: expiresStr } = JSON.parse(tokenJson);
      const expires = dateTimeStrings(new Date(expiresStr));
      const now = dateTimeStrings();
      if (
        expires.date > now.date ||
        (expires.date === now.date &&
          expires.time > now.time &&
          expires.time >= '17')
      ) {
        return token;
      }
    }
    throw new TokenStale(`Token "${this.name}" missing or expired`);
  }

  set(token: string, expires: Date): void {
    this.storage.setItem(this.name, JSON.stringify({ token, expires }));
  }

  delete(): void {
    this.storage.removeItem(this.name);
  }
}
