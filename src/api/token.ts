import { dateTimeStrings } from '/datetime';

export class TokenStale extends Error {
  name = 'TokenStale';

  constructor(tokenName: string) {
    super(`Token "${tokenName}" missing or expired`);
  }
}

export class StoredToken {
  constructor(
    protected name: string,
    protected storage: Pick<
      Storage,
      'getItem' | 'setItem' | 'removeItem'
    > = localStorage
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
    throw new TokenStale(this.name);
  }

  set(token: string, expires: Date): void {
    this.storage.setItem(this.name, JSON.stringify({ token, expires }));
  }

  delete(): void {
    this.storage.removeItem(this.name);
  }
}
