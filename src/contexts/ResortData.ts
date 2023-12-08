import { createContext, useContext } from 'react';

import { ResortData } from '@/api/data';

const ResortDataContext = createContext<ResortData>({
  resort: 'WDW',
  parks: new Map(),
  experiences: {},
  drops: {},
});
export const ResortDataProvider = ResortDataContext.Provider;
export const useResortData = () => useContext(ResortDataContext);
