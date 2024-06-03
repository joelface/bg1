import { createContext, useContext, useEffect, useState } from 'react';

import { InvalidId, Park } from '@/api/resort';
import { parkDate } from '@/datetime';
import kvdb from '@/kvdb';

import { useResort } from './Resort';

export const PARK_KEY = ['bg1', 'genie', 'park'];

interface ParkState {
  park: Park;
  setPark: (park: Park) => void;
}

interface CurrentPark {
  id: string;
  date: string;
}

const ParkContext = createContext<ParkState>({
  park: {} as Park,
  setPark: () => undefined,
});
export const ParkProvider = ({
  value,
  children,
}: {
  value: ParkState;
  children: React.ReactNode;
}) => {
  return <ParkContext.Provider value={value}>{children}</ParkContext.Provider>;
};
export const usePark = () => useContext(ParkContext);

export function useParkState() {
  const resort = useResort();
  const [park, setPark] = useState(() => {
    const firstPark: Park = resort.parks[0]!;
    const { id = firstPark.id, date = '' } =
      kvdb.get<CurrentPark>(PARK_KEY) ?? {};
    try {
      return date === parkDate() ? resort.park(id) : firstPark;
    } catch (error) {
      if (!(error instanceof InvalidId)) console.error(error);
      return firstPark;
    }
  });

  useEffect(() => {
    kvdb.set<CurrentPark>(PARK_KEY, { id: park.id, date: parkDate() });
  }, [park]);

  return { park, setPark };
}
