import { createContext, useContext } from 'react';

import { LiveDataClient } from '@/api/livedata';

const LiveDataClientContext = createContext({} as LiveDataClient);
export const LiveDataClientProvider = LiveDataClientContext.Provider;
export const useLiveDataClient = () => useContext(LiveDataClientContext);
