import { createContext, useContext, useEffect, useState } from 'react';

import { Park } from '@/api/data';
import { parkDate } from '@/datetime';
import kvdb from '@/kvdb';

import { useResortData } from './ResortData';

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
  const { resort, parks } = useResortData();
  const [park, setPark] = useState(() => {
    const firstPark: Park = [...parks.values()][0]!;
    const { id = firstPark.id, date = '' } =
      kvdb.get<CurrentPark>(PARK_KEY) ?? {};
    return (date === parkDate() && parks.get(id)) || firstPark;
  });

  useEffect(() => {
    kvdb.set<CurrentPark>(PARK_KEY, { id: park.id, date: parkDate() });
  }, [park, resort]);

  return { park, setPark };
}
