import { createContext } from 'preact';
import { useContext } from 'preact/hooks';

import { GenieClient } from '@/api/genie';

export const GenieClientContext = createContext({} as GenieClient);
export const GenieClientProvider = GenieClientContext.Provider;
export const useGenieClient = () => useContext(GenieClientContext);
