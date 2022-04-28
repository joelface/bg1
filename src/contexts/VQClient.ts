import { createContext } from 'preact';
import { useContext } from 'preact/hooks';

import { VQClient } from '@/api/vq';

export const VQClientContext = createContext({} as VQClient);
export const VQClientProvider = VQClientContext.Provider;
export const useVQClient = () => useContext(VQClientContext);
