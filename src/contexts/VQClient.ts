import { VQClient } from '@/api/vq';
import { createContext } from '@/context';

export const [VQClientProvider, useVQClient] = createContext<Public<VQClient>>(
  {} as VQClient
);
