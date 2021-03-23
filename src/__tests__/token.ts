import { StoredToken, TokenStale } from '../token';

const testToken = new StoredToken('testToken');

let tokenId = 0;
function makeToken(ttl: number) {
  return {
    token: `token-${++tokenId}`,
    expires: new Date(ttl),
  };
}

function setToken(ttl: number) {
  const { token, expires } = makeToken(ttl);
  testToken.set(token, expires);
  return token;
}

function isDST() {
  return new Date()
    .toLocaleString('en-US', {
      timeZone: 'America/New_York',
      timeZoneName: 'short',
    })
    .endsWith('EDT');
}

describe('StoredToken', () => {
  beforeEach(() => {
    testToken.delete();
  });

  describe('get()', () => {
    it('returns unexpired access token', () => {
      const token = setToken(Date.now() + 86400_000);
      expect(testToken.get()).toEqual(token);
    });

    it('throws TokenStale when expired', () => {
      setToken(Date.now() - 1);
      expect(() => testToken.get()).toThrow(TokenStale);
    });

    it('throws TokenStale when expires today before 5 PM', () => {
      const today = new Date().toLocaleDateString('en-US', {
        timeZone: 'America/New_York',
      });
      const tz = isDST() ? 'EDT' : 'EST';
      setToken(new Date(`${today} 16:59:59 ${tz}`).getTime());
      expect(() => testToken.get()).toThrow(TokenStale);
    });
  });

  describe('set()', () => {
    it('updates token data', () => {
      const { token, expires } = makeToken(Date.now() + 86400_000);
      testToken.set(token, expires);
      const stored = JSON.parse(localStorage.getItem('testToken') as string);
      expect(stored).toEqual({ token, expires: expires.toISOString() });
    });
  });

  describe('delete()', () => {
    it('deletes token data', () => {
      setToken(Date.now() + 86400_000);
      testToken.delete();
      expect(() => testToken.get()).toThrow(TokenStale);
    });
  });
});
