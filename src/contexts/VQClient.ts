import { VQClient } from '/api/vq';
import { useClient } from './Client';

export const useVQClient: () => VQClient = useClient;
