import { GenieClient } from '@/api/genie';

import { useClient } from './Client';

export const useGenieClient = () => useClient() as GenieClient;
