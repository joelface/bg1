import { createContext, useContext } from 'react';

import { Resort } from '@/api/resort';

const ResortContext = createContext<Resort>(
  new Resort('WDW', { experiences: {}, parks: [], drops: {} })
);
export const ResortProvider = ResortContext.Provider;
export const useResort = () => useContext(ResortContext);
