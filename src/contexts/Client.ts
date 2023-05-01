import { createContext } from '@/context';

export interface Client {
  onUnauthorized: () => void;
  resort: 'WDW' | 'DLR';
  logOut: () => void;
}

export const [ClientProvider, useClient] = createContext<Client>({
  onUnauthorized: () => null,
  resort: 'WDW',
  logOut: () => null,
});
