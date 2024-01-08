import { createContext, useContext, useEffect, useState } from 'react';

import { Park } from '@/api/data';
import { parkDate } from '@/datetime';

import { useResortData } from './ResortData';

export const PARK_KEY = 'bg1.genie.park';

interface ParkState {
  park: Park;
  setPark: (park: Park) => void;
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
  const { parks } = useResortData();
  const [park, setPark] = useState(() => {
    const firstPark = [...parks.values()][0];
    const { id = firstPark.id, date = '' } =
      JSON.parse(localStorage.getItem(PARK_KEY) || '{}') || {};
    return (date === parkDate() && parks.get(id)) || firstPark;
  });

  useEffect(() => {
    localStorage.setItem(
      PARK_KEY,
      JSON.stringify({ id: park.id, date: parkDate() })
    );
  }, [park]);

  return { park, setPark };
}
