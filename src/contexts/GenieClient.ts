import { GenieClient } from '@/api/genie';
import { createContext } from '@/context';

export const [GenieClientProvider, useGenieClient] = createContext<
  Public<GenieClient>
>({} as GenieClient);
