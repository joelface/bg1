import { ResortData } from '@/api/data';
import { createContext } from '@/context';

export const [ResortDataProvider, useResortData] = createContext<ResortData>({
  resort: 'WDW',
  parks: new Map(),
  experiences: {},
  drops: {},
});
