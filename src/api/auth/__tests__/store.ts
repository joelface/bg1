import { TODAY, setTime } from '@/testing';

import { AuthStore, ReauthNeeded } from '../store';

setTime('12:30');

const storageKey = 'testAuth';
const store = new AuthStore(storageKey);

let tokenId = 0;
function makeData(timestamp: number) {
  return {
    swid: '{SWID}',
    accessToken: `token-${++tokenId}`,
    expires: new Date(timestamp),
  };
}

function setData(timestamp: number) {
  const data = makeData(timestamp);
  store.setData(data);
  return data;
}

describe('AuthStore', () => {
  beforeEach(() => {
    store.deleteData();
  });

  describe('getData()', () => {
    it('returns unexpired auth data', () => {
      const { swid, accessToken } = setData(Date.now() + 86400_000);
      expect(store.getData()).toEqual({ swid, accessToken });
    });

    it('throws ReauthNeeded when expired', () => {
      setData(Date.now() - 1);
      expect(() => store.getData()).toThrow(ReauthNeeded);
    });

    it('throws ReauthNeeded when expires today before 5 PM', () => {
      setData(new Date(`${TODAY} 16:59:59-0400`).getTime());
      expect(() => store.getData()).toThrow(ReauthNeeded);
    });
  });

  describe('setData()', () => {
    it('stores auth data', () => {
      const { swid, accessToken, expires } = makeData(Date.now() + 86400_000);
      store.setData({ swid, accessToken, expires });
      const stored = JSON.parse(localStorage.getItem(storageKey) as string);
      expect(stored).toEqual({
        swid,
        accessToken,
        expires: expires.toISOString(),
      });
    });
  });

  describe('deleteData()', () => {
    it('deletes auth data', () => {
      setData(Date.now() + 86400_000);
      store.deleteData();
      expect(() => store.getData()).toThrow(ReauthNeeded);
    });
  });
});
