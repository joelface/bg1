import { LiveDataClient } from '@/api/livedata';
import { createContext, useContext } from 'react';

const LiveDataClientContext = createContext({} as LiveDataClient);
export const LiveDataClientProvider = LiveDataClientContext.Provider;
export const useLiveDataClient = () => useContext(LiveDataClientContext);
