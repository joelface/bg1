import { createContext, useContext, useEffect, useState } from 'react';

import { InvalidId, Park } from '@/api/resort';
import kvdb from '@/kvdb';

import { useResort } from './Resort';

export const PARK_KEY = ['bg1', 'park'];

interface ParkState {
  park: Park;
  setPark: React.Dispatch<React.SetStateAction<Park>>;
}

export const ParkContext = createContext<ParkState>({
  park: {} as Park,
  setPark: () => undefined,
});
export const usePark = () => useContext(ParkContext);

export function ParkProvider({ children }: { children: React.ReactNode }) {
  const resort = useResort();
  const [park, setPark] = useState(() => {
    const firstPark: Park = resort.parks[0]!;
    const id = kvdb.getDaily<string>(PARK_KEY);
    if (!id) return firstPark;
    try {
      return resort.park(id);
    } catch (error) {
      if (!(error instanceof InvalidId)) console.error(error);
      return firstPark;
    }
  });

  useEffect(() => kvdb.setDaily(PARK_KEY, park.id), [park]);

  return (
    <ParkContext.Provider value={{ park, setPark }}>
      {children}
    </ParkContext.Provider>
  );
}
