import { createContext as createCtx, useContext } from 'react';

export function createContext<T>(defaultValue: T) {
  const Context = createCtx<T>(defaultValue);
  return [Context.Provider, () => useContext(Context)] as const;
}
