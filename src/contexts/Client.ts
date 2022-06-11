import { createContext, useContext } from 'react';

export interface Client {
  onUnauthorized: () => void;
  resort: 'WDW' | 'DLR';
  logOut: () => void;
}

export const ClientContext = createContext<Client>({
  resort: 'WDW',
  onUnauthorized: () => undefined,
  logOut: () => null,
});
export const ClientProvider = ClientContext.Provider;
export const useClient = <T extends Client>() => useContext(ClientContext) as T;
