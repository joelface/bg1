import { createContext, useContext } from 'react';

import { GenieClient } from '@/api/genie';

const GenieClientContext = createContext({} as GenieClient);
export const GenieClientProvider = GenieClientContext.Provider;
export const useGenieClient = () => useContext(GenieClientContext);
