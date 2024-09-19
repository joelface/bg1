import { parkDate } from './datetime';

type Key = string | string[];

const keyStr = (key: Key) => (Array.isArray(key) ? key.join('.') : key);

interface DailyValue<T> {
  value: T;
  date: string;
}

export default {
  get<T = unknown>(key: Key) {
    const json = localStorage.getItem(keyStr(key));
    try {
      return JSON.parse(json ?? '') as T;
    } catch {
      return undefined;
    }
  },

  set<T = unknown>(key: Key, value: T) {
    localStorage.setItem(keyStr(key), JSON.stringify(value));
  },

  delete(key: Key) {
    localStorage.removeItem(keyStr(key));
  },

  clear() {
    localStorage.clear();
  },

  getDaily<T = unknown>(key: Key) {
    const { date, value } = this.get<DailyValue<T>>(key) ?? {};
    return date === parkDate() ? value : undefined;
  },

  setDaily<T = unknown>(key: Key, value: T) {
    this.set<DailyValue<T>>(key, { date: parkDate(), value });
  },
};
