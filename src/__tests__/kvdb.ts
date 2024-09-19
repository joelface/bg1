import { modifyDate, parkDate } from '@/datetime';
import { setTime } from '@/testing';

import kvdb from '../kvdb';

jest.spyOn(self, 'setTimeout');

function getItem(key: string) {
  try {
    return JSON.parse(localStorage.getItem(key) ?? '');
  } catch {
    return undefined;
  }
}

function setItem(key: string, value: any) {
  localStorage.setItem(key, JSON.stringify(value));
}

describe('kvdb', () => {
  beforeEach(() => {
    localStorage.clear();
    setTime('12:00');
  });

  describe('get()', () => {
    it('gets value from localStorage', () => {
      setItem('k', 'v');
      expect(kvdb.get<string>('k')).toBe('v');
      setItem('a.b', { v: 1 });
      expect(kvdb.get<{ v: number }>(['a', 'b'])).toEqual({ v: 1 });
      expect(kvdb.get('z')).toBe(undefined);
    });
  });

  describe('set()', () => {
    it('stores value in localStorage', () => {
      kvdb.set<string>('k', 'v');
      expect(getItem('k')).toBe('v');
      kvdb.set<{ v: number }>(['a', 'b'], { v: 1 });
      expect(getItem('a.b')).toEqual({ v: 1 });
    });
  });

  describe('delete', () => {
    it('deletes key from storage', () => {
      setItem('k', 'v');
      kvdb.delete('k');
      expect(getItem('k')).toBe(undefined);

      setItem('a.b', 'v');
      kvdb.delete(['a', 'b']);
      expect(getItem('a.b')).toBe(undefined);
    });
  });

  describe('clear', () => {
    it('clears storage', () => {
      setItem('k1', 'v1');
      setItem('k2', 'v2');
      kvdb.clear();
      expect(localStorage.length).toBe(0);
    });
  });

  describe('getDaily()', () => {
    it('gets daily value from localStorage', () => {
      setItem('a.b', { date: parkDate(), value: { v: 1 } });
      expect(kvdb.getDaily<{ v: number }>(['a', 'b'])).toEqual({ v: 1 });
    });

    it('returns undefined if value nonexistent or set before today', () => {
      expect(kvdb.getDaily('a.b')).toBe(undefined);
      setItem('a.b', { date: modifyDate(parkDate(), -1), value: { v: 1 } });
      expect(kvdb.getDaily<{ v: number }>(['a', 'b'])).toBe(undefined);
    });
  });

  describe('setDaily()', () => {
    it('stores daily value', () => {
      kvdb.setDaily<{ v: number }>(['a', 'b'], { v: 1 });
      expect(kvdb.getDaily(['a', 'b'])).toEqual({ v: 1 });
      setTime('12:00', 24 * 60);
      expect(kvdb.getDaily(['a', 'b'])).toBe(undefined);
    });
  });
});
