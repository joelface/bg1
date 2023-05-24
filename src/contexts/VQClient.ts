import { createContext, useContext } from 'react';

import { VQClient } from '@/api/vq';

const VQClientContext = createContext({} as VQClient);
export const VQClientProvider = VQClientContext.Provider;
export const useVQClient = () => useContext(VQClientContext);
